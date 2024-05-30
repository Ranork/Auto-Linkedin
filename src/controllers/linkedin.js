const { default: puppeteer } = require("puppeteer");
const querystring = require('querystring');
const fs = require('fs');
const LinkedinProfile = require("./profile");
const { randomNumber } = require("../libraries/misc");

class LinkedIn {

  /** Linkedin Client
   * @param {PuppeteerLaunchOptions} browserSettings - Puppeteer browser settings
   * 
   * @param {Object} linkedinSettings - Settings for linkedin static variables
   * 
   * @param {string} linkedinSettings.MAIN_ADDRESS - Main linkedin address (default: "https://www.linkedin.com/")
   * @param {string} linkedinSettings.CACHE_DIR - cache files dir (default: "./cache/")
   * 
   * @param {string} linkedinSettings.PROFILEBUTTON_MESSAGE - In profile message button's text (default: "Message")
   * @param {string} linkedinSettings.PROFILEBUTTON_CONNECT - In profile connect button's text (default: "Connect")
   * @param {string} linkedinSettings.PROFILEBUTTON_FOLLOW - In profile follow button's text (default: "Follow")
   * 
   * @param {number} linkedinSettings.COOLDOWN_MIN - Minimum cooldown treshold (default: 5)
   * @param {number} linkedinSettings.COOLDOWN_MAX - Maximum cooldown treshold (default: 20)
   * @param {number} linkedinSettings.TIMEOUT - Timeout in seconds (default: 60)
   */
  constructor(browserSettings, linkedinSettings) {
    this.browserSettings = browserSettings
    this.linkedinSettings = linkedinSettings || {}

    if (!this.linkedinSettings.MAIN_ADDRESS) this.linkedinSettings.MAIN_ADDRESS = process.env.MAIN_ADDRESS || 'https://www.linkedin.com/'
    if (!this.linkedinSettings.CACHE_DIR) this.linkedinSettings.CACHE_DIR = process.env.CACHE_DIR || './cache/'

    if (!this.linkedinSettings.PROFILEBUTTON_MESSAGE) this.linkedinSettings.PROFILEBUTTON_MESSAGE = process.env.PROFILEBUTTON_MESSAGE || 'Message'
    if (!this.linkedinSettings.PROFILEBUTTON_CONNECT) this.linkedinSettings.PROFILEBUTTON_CONNECT = process.env.PROFILEBUTTON_CONNECT || 'Connect'
    if (!this.linkedinSettings.PROFILEBUTTON_FOLLOW) this.linkedinSettings.PROFILEBUTTON_FOLLOW = process.env.PROFILEBUTTON_FOLLOW || 'Follow'

    if (!this.linkedinSettings.COOLDOWN_MIN) this.linkedinSettings.COOLDOWN_MIN = parseInt(process.env.COOLDOWN_MIN) || 5
    if (!this.linkedinSettings.COOLDOWN_MAX) this.linkedinSettings.COOLDOWN_MAX = parseInt(process.env.COOLDOWN_MAX) || 20
    if (!this.linkedinSettings.TIMEOUT) this.linkedinSettings.TIMEOUT = parseInt(process.env.TIMEOUT) || 60

    // make dir if not exists
    if (!fs.existsSync(this.linkedinSettings.CACHE_DIR)) fs.mkdirSync(this.linkedinSettings.CACHE_DIR, { recursive: true });
  }

  /** Get client's browser
   * @returns Browser - puppeteer browser
   */
  async getBrowser() {
    if (this.browser) { return this.browser }

    this.browser = await puppeteer.launch(this.browserSettings)
    console.log('  New Browser created.')
    return this.browser
  }


  /** Logs into LinkedIn asynchronously
   * @param {string} username - The LinkedIn username (or mail address)
   * @param {string} password - The LinkedIn password
   * @returns {Promise<void>} Returns when the login process is completed
   */
  async login(username, password) {
    console.log('[TASK] Login');

    const browser = await this.getBrowser()
    const page = await browser.newPage()

    if (fs.existsSync(this.linkedinSettings.CACHE_DIR + 'cookies.json')) {
      let cookies = JSON.parse(fs.readFileSync(this.linkedinSettings.CACHE_DIR + 'cookies.json'))
      await page.setCookie(...cookies)
      await page.goto(this.linkedinSettings.MAIN_ADDRESS + 'feed')

      await new Promise(r => setTimeout(r, randomNumber(1,3)));

      if (page.url().endsWith('feed/')) {
        await page.close()
        return console.log('  Logged in from cache.')
      }
    }

    await page.goto(this.linkedinSettings.MAIN_ADDRESS + 'login')
  
    const usernameInput = await page.$('#username')
    await usernameInput.type(username)
  
    const passwordInput = await page.$('#password')
    await passwordInput.type(password)
  
    await passwordInput.press('Enter')
  
    await page.waitForNavigation()
    let afterLoginUrl = page.url()

    console.log('  Url: ' + afterLoginUrl);
  
    //* Checkpoint for login
    if (afterLoginUrl.includes('checkpoint/challenge')) {
  
      for (let i = 0; i < this.linkedinSettings.TIMEOUT; i++) {
        if (page.url() !== afterLoginUrl) {
          console.log('  New URL: ' + page.url());
  
          if (page.url().includes('feed')) {
            await page.waitForNavigation()
            break;
          }
        }

        try {
          const header = await page.evaluate(() => {
            console.log('  ' + document.querySelector('h1'));
            return document.querySelector('h1').textContent;
          });
          const explanation = await page.evaluate(() => {
            return document.querySelector('h1').parentElement.querySelector('p').textContent;
          });
      
          console.log('  ' + header + ' -> ' + explanation);
        }
        catch (e) { console.log(e.message) }
  
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  
    
    if (page.url().includes('feed')) {

      const cookies = await page.cookies()
      fs.writeFileSync(this.linkedinSettings.CACHE_DIR + 'cookies.json', JSON.stringify(cookies))
      await page.close()
      return console.log('  Login complated.');
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
   * @param {Array<string>} parameters.geoUrn - Locations
   * @param {number} limit - LinkedinProfile object limit (default 100)
   * @returns {Promise<Array<LinkedinProfile>>} Array of profile objects
   */
  async searchPeople(parameters, limit = 100) {
    console.log('[TASK] Search People: ' + limit + ' (' + JSON.stringify(parameters) + ')');
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    if (parameters.network) { parameters.network = JSON.stringify(parameters.network)}
    if (parameters.geoUrn) { parameters.geoUrn = JSON.stringify(parameters.geoUrn)}

    let i = 1
    let findedLinkedinProfiles = []
    for (let p = 1; p <= limit / 10; p++) {

      parameters.page = p
      const qString = querystring.stringify(parameters)
      
      await page.goto(this.linkedinSettings.MAIN_ADDRESS + 'search/results/people/?' + qString)

      try { 
        let profiles = await this.extractLinkedinProfilesFromSearch(page) 
        findedLinkedinProfiles.push(...profiles)
        console.log('  Page: ' + i + '/' + (limit / 10) + ' -> ' + profiles.length);
      }
      catch (e) { console.log(e); }

      i++
    }

    console.log('  Search complete: ' + findedLinkedinProfiles.length);

    await page.close()
    return findedLinkedinProfiles.map(p => (new LinkedinProfile(p)))

  }

  /** Extract LinkedinProfiles from Search People Page
   * @param {Object} page - the puppeteer page that opened in search/results/people url
   * @returns {Promise<Array>} Array of profile objects
   */
  async extractLinkedinProfilesFromSearch(page) {
    await page.waitForSelector('.linked-area')

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


module.exports = LinkedIn