const { default: puppeteer } = require("puppeteer");
const { Environment } = require("../libraries/environment")
const querystring = require('querystring');
const fs = require('fs');
const Profile = require("./profile");

class LinkedIn {

  /** Linkedin Client
   * @param {PuppeteerLaunchOptions} browserSettings - Puppeteer browser settings
   */
  constructor(browserSettings) {
    this.browserSettings = browserSettings
  }

  /** Get client's browser
   * @returns Browser - puppeteer browser
   */
  async getBrowser() {
    if (this.browser) { return this.browser }

    this.browser = await puppeteer.launch(this.browserSettings)
    console.log('New Browser created.')
    return this.browser
  }


  /** Logs into LinkedIn asynchronously
   * @param {string} username - The LinkedIn username (or mail address)
   * @param {string} password - The LinkedIn password
   * @returns {Promise<void>} Returns when the login process is completed
   */
  async login(username, password) {
    
    await Environment.declare_settings()

    const browser = await this.getBrowser()
    const page = await browser.newPage()

    if (fs.existsSync('./cache/cookies.json')) {
      let cookies = JSON.parse(fs.readFileSync('./cache/cookies.json'))
      await page.setCookie(...cookies)
      await page.goto(Environment.settings.MAIN_ADDRESS + 'feed')

      if (page.url().includes('feed')) {
        await page.close()
        return console.log('Logged in from cache.')
      }
    }

    await page.goto(Environment.settings.MAIN_ADDRESS + 'login')
  
    const usernameInput = await page.$('#username')
    await usernameInput.type(username)
  
    const passwordInput = await page.$('#password')
    await passwordInput.type(password)
  
    await passwordInput.press('Enter')
  
    await page.waitForNavigation()
    let afterLoginUrl = page.url()

    console.log('Url: ' + afterLoginUrl);
  
    //* Checkpoint for login
    if (afterLoginUrl.includes('checkpoint/challenge')) {
  
      for (let i = 0; i < Environment.settings.TIMEOUT; i++) {
        if (page.url() !== afterLoginUrl) {
          console.log('New URL: ' + page.url());
  
          if (page.url().includes('feed')) {
            await page.waitForNavigation()
            break;
          }
        }

        try {
          const header = await page.evaluate(() => {
            console.log(document.querySelector('h1'));
            return document.querySelector('h1').textContent;
          });
          const explanation = await page.evaluate(() => {
            return document.querySelector('h1').parentElement.querySelector('p').textContent;
          });
      
          console.log(header + ' -> ' + explanation);
        }
        catch (e) { console.log(e.message) }
  
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  
    
    if (page.url().includes('feed')) {

      const cookies = await page.cookies()
      fs.writeFileSync('./cache/cookies.json', JSON.stringify(cookies))
      await page.close()
      return console.log('Login complated.');
    }
    else {
      await new Promise(r => setTimeout(r, 30000));
      throw new Error('Login Failed.')
    }
  }


  /** Search people with filters
   * @param {Object} parameters - Object that includes filters
   * @param {string} parameters.keywords - The keywords to search for
   * @param {Array<string>} parameters.network - The network distance (F for 1, S for 2, B for 3+)
   * @param {number} limit - Profile object limit (default 100)
   * @returns {Promise<Array<Profile>>} Array of profile objects
   */
  async searchPeople(parameters, limit = 100) {
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    if (parameters.network) { parameters.network = JSON.stringify(parameters.network)}

    let findedProfiles = []
    for (let p = 1; p <= limit / 10; p++) {
      parameters.page = p
      const qString = querystring.stringify(parameters)
      
      await page.goto(Environment.settings.MAIN_ADDRESS + 'search/results/people/?' + qString)
  
      let profiles = await this.extractProfilesFromSearch(page)
      findedProfiles.push(...profiles)
    }

    await page.close()
    return findedProfiles.map(p => (new Profile(p)))

  }

  /** Extract Profiles from Search People Page
   * @param {Object} page - the puppeteer page that opened in search/results/people url
   * @returns {Promise<Array>} Array of profile objects
   */
  async extractProfilesFromSearch(page) {
    return await page.evaluate(() => {
      const cards = document.querySelectorAll('.linked-area')
      
      let people = []
      for (let c of cards) {
        try {
          const cLink = c.querySelector('a').href.split('?')[0]
          people.push({
            id: cLink.split('/in/')[1],
            link: cLink,
            name: c.querySelector('.entity-result__title-text > a > span > span:first-child').textContent,
            title: c.querySelector('.entity-result__primary-subtitle').textContent.trim(),
            location: c.querySelector('.entity-result__secondary-subtitle').textContent.trim(),
            buttonText: c.querySelector('button')?.textContent?.trim() ?? undefined,
          })
        }
        catch (e) { console.error(e); }
      }
      return people
    })
  }

}


module.exports = { LinkedIn }