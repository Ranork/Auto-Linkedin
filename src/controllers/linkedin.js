const { default: puppeteer } = require("puppeteer");
const { Environment } = require("../libraries/environment")
const querystring = require('querystring');
const fs = require('fs');

class LinkedIn {
  constructor(browserSettings) {
    this.browserSettings = browserSettings
  }


  async getBrowser() {
    if (this.browser) { return this.browser }

    this.browser = await puppeteer.launch(this.browserSettings)
    console.log('New Browser created.')
    return this.browser
  }



  async login(username, password) {
    
    await Environment.declare_settings()

    const browser = await this.getBrowser()
    const page = await browser.newPage()

    if (fs.existsSync('./cache/cookies.json')) {
      let cookies = JSON.parse(fs.readFileSync('./cache/cookies.json'))
      await page.setCookie(...cookies)
      await page.goto(Environment.settings.MAIN_ADDRESS + 'feed')

      if (page.url().includes('feed')) return console.log('Logged in from cache.');
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

      return console.log('Login complated.');
    }
    else {
      await new Promise(r => setTimeout(r, 30000));
      // throw new Error('Login Failed.')
    }
  }



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

    return findedProfiles

  }

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