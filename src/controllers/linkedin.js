const { default: puppeteer } = require("puppeteer");
const querystring = require('querystring');
const fs = require('fs');
const LinkedinProfile = require("./profile");
const { randomNumber } = require("../libraries/misc");
const LinkedinCompany = require("./company");

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
   * 
   * @param {Function} loggerFunction - function to output logs (default: console.log)
   */
  constructor(browserSettings, linkedinSettings, loggerFunction) {
    this.browserSettings = browserSettings
    this.linkedinSettings = linkedinSettings || {}

    if (!this.linkedinSettings.MAIN_ADDRESS) this.linkedinSettings.MAIN_ADDRESS = process.env.MAIN_ADDRESS || 'https://www.linkedin.com/'
    if (!this.linkedinSettings.CACHE_DIR) this.linkedinSettings.CACHE_DIR = process.env.CACHE_DIR || './cache/'

    if (!this.linkedinSettings.PROFILEBUTTON_MESSAGE) this.linkedinSettings.PROFILEBUTTON_MESSAGE = process.env.PROFILEBUTTON_MESSAGE || 'Message'
    if (!this.linkedinSettings.PROFILEBUTTON_CONNECT) this.linkedinSettings.PROFILEBUTTON_CONNECT = process.env.PROFILEBUTTON_CONNECT || 'Connect'
    if (!this.linkedinSettings.PROFILEBUTTON_FOLLOW) this.linkedinSettings.PROFILEBUTTON_FOLLOW = process.env.PROFILEBUTTON_FOLLOW || 'Follow'

    if (!this.linkedinSettings.BUTTON_MORERESULTS) this.linkedinSettings.BUTTON_MORERESULTS = process.env.BUTTON_MORERESULTS || 'Show more results'

    if (!this.linkedinSettings.COOLDOWN_MIN) this.linkedinSettings.COOLDOWN_MIN = parseInt(process.env.COOLDOWN_MIN) || 5
    if (!this.linkedinSettings.COOLDOWN_MAX) this.linkedinSettings.COOLDOWN_MAX = parseInt(process.env.COOLDOWN_MAX) || 20
    if (!this.linkedinSettings.TIMEOUT) this.linkedinSettings.TIMEOUT = parseInt(process.env.TIMEOUT) || 60

    // make dir if not exists
    if (!fs.existsSync(this.linkedinSettings.CACHE_DIR)) fs.mkdirSync(this.linkedinSettings.CACHE_DIR, { recursive: true });

    if (loggerFunction) this.loggerFunction = loggerFunction
    else this.loggerFunction = console.log
  }

  /** Get client's browser
   * @returns Browser - puppeteer browser
   */
  async getBrowser() {
    if (this.browser) { return this.browser }

    this.browser = await puppeteer.launch(this.browserSettings)
    this.loggerFunction('  New Browser created.')
    return this.browser
  }

  /** Logs into LinkedIn asynchronously
   * @param {string} username - The LinkedIn username (or mail address)
   * @param {string} password - The LinkedIn password
   * @returns {Promise<void>} Returns when the login process is completed
   */
  async login(username, password) {
    this.loggerFunction('[TASK] Login');

    const browser = await this.getBrowser()
    const page = await browser.newPage()

    if (fs.existsSync(this.linkedinSettings.CACHE_DIR + 'cookies.json')) {
      let cookies = JSON.parse(fs.readFileSync(this.linkedinSettings.CACHE_DIR + 'cookies.json'))
      await page.setCookie(...cookies)
      await page.goto(this.linkedinSettings.MAIN_ADDRESS + 'feed')

      await new Promise(r => setTimeout(r, randomNumber(1,3) * 1000));

      if (page.url().endsWith('feed/')) {
        await page.close()
        return this.loggerFunction('  Logged in from cache.')
      }
      else {
        this.loggerFunction('  Login from cache failed. Trying to login again.');
        const client = await page.createCDPSession()		
        await client.send('Network.clearBrowserCookies')
        await new Promise(r => setTimeout(r, 1000));
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

    this.loggerFunction('  Url: ' + afterLoginUrl);
  
    //* Checkpoint for login
    if (afterLoginUrl.includes('checkpoint/challenge')) {
  
      for (let i = 0; i < this.linkedinSettings.TIMEOUT; i++) {
        if (page.url() !== afterLoginUrl) {
          this.loggerFunction('  New URL: ' + page.url());
  
          if (page.url().includes('feed')) {
            await page.waitForNavigation()
            break;
          }
        }

        try {
          const header = await page.evaluate(() => {
            this.loggerFunction('  ' + document.querySelector('h1'));
            return document.querySelector('h1').textContent;
          });
          const explanation = await page.evaluate(() => {
            return document.querySelector('h1').parentElement.querySelector('p').textContent;
          });
      
          this.loggerFunction('  ' + header + ' -> ' + explanation);
        }
        catch (e) { this.loggerFunction(e.message) }
  
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  
    
    if (page.url().includes('feed')) {
      this.loggerFunction('  Login complated.');

      const cookies = await page.cookies()
      fs.writeFileSync(this.linkedinSettings.CACHE_DIR + 'cookies.json', JSON.stringify(cookies))
      await page.close()
      return this.loggerFunction('  Login cached.');
    }
    else {
      await new Promise(r => setTimeout(r, 3000));
      throw new Error('Login Failed.')
    }
  }

  /** Closes the client
   * @returns {void}
   */
  async close() {
    let browser = await this.getBrowser()
    browser.close()
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
    this.loggerFunction('[TASK] Search People: ' + limit + ' (' + JSON.stringify(parameters) + ')');
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
        this.loggerFunction('  Page: ' + i + '/' + (limit / 10) + ' -> ' + profiles.length);
      }
      catch (e) { this.loggerFunction(e); }

      i++
    }

    this.loggerFunction('  Search complete: ' + findedLinkedinProfiles.length);

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

  /** Get latest connections
   * @param {number} limit - How many connections you want? (default: 80)
   * @returns {Promise<Array<LinkedinProfile>>} Array of profile objects
   */
  async getLastConnections(limit = 80) {
    this.loggerFunction('[TASK] Get Last Connections: ' + limit);

    const browser = await this.getBrowser()
    const page = await browser.newPage()

    await page.goto(this.linkedinSettings.MAIN_ADDRESS + 'mynetwork/invite-connect/connections/')
    await page.waitForSelector('.artdeco-button')

    for (let p = 0; p <= limit / 40; p++) {
      await page.evaluate((linkedinSettings) => {
        for (let e of document.querySelectorAll('.artdeco-button')) {
          if(e.textContent.trim() === linkedinSettings.BUTTON_MORERESULTS) e.click()
        }
      }, this.linkedinSettings)

      this.loggerFunction('  Scroll ' + p);
      await new Promise(r => setTimeout(r, randomNumber(3,5) * 1000))
    }

    let people = await page.evaluate(() => {
      let cards = document.querySelectorAll('.mn-connection-card')
      let list = []
      for (let c of cards) {
          list.push({
              link: c.querySelector('a').href,
              id: c.querySelector('a').href.split('/in/')[1].replaceAll('/',''),
              name: c.querySelector('.mn-connection-card__name').innerText.trim(),
              title: c.querySelector('.mn-connection-card__occupation').innerText.trim(),
              location: null,
              buttonText: c.querySelector('button')?.textContent?.trim() ?? undefined,
          })
      }
      return list
    })

    await page.close()

    if (people.length > limit) people = people.slice(0, limit)
    return people.map(p => (new LinkedinProfile(p)))

  }

  /** Get latest connections
   * @returns {Promise<LinkedinCompany>} Owned linkedin company
   */
  async getMyCompany() {
    this.loggerFunction('[TASK] Get My Company');

    const browser = await this.getBrowser()
    const page = await browser.newPage()

    await page.goto(this.linkedinSettings.MAIN_ADDRESS + 'feed/')

    let company_element = await page.evaluate(() => (document.querySelector('.org-organization-admin-pages-entrypoint-card__card')))

    if (!company_element) {
      await page.close()
      throw new Error('No authorized company was found.')
    }

    let company_link = await page.evaluate(() => (document.querySelector('.org-organization-admin-pages-entrypoint-card__card').querySelector('a').href))
    let company_id = company_link.split('/company/')[1].replaceAll('/admin/', '')

    await page.close()
    let company = new LinkedinCompany(company_id)
    await company.fetchDetails(this)
    return company
  }

}


module.exports = LinkedIn