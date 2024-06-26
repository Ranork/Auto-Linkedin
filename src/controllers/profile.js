const { randomNumber } = require("../libraries/misc");
const LinkedIn = require("./linkedin");


class LinkedinProfile {
  /** Linkedin User Profile
   * @param {object} details - Profile details
   * @param {string} details.id - user id (in the link)
   * @param {string} details.link - profile link
   * @param {string} details.name - profile's full name
   * @param {string} details.title - profile's main title
   * @param {string} details.location - profile's location
   * @param {string} details.buttonText - profile's main button (connect, message or follow etc)
   */
  constructor(details) { 
    this.details = details
  }


  /** Visit the user's rofile page
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {number} waitMs - Wait milliseconds after opening profile (default is coming from linkedin client)
   * @param {boolean} scrollPage - Scroll page to bottom to be sure (default: true)
   */
  async visitProfile(linkedinClient, waitMs, scrollPage = true) {
    if (!waitMs) waitMs = randomNumber(linkedinClient.linkedinSettings.COOLDOWN_MIN * 1000, linkedinClient.linkedinSettings.COOLDOWN_MAX * 1000)

    console.log('[TASK] LinkedinProfile Visit: ' + this.details.name + ' (waitMs: ' + waitMs.toFixed(0) + ', scrollPage: ' + scrollPage + ')');
    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(linkedinClient.linkedinSettings.MAIN_ADDRESS + 'in/' + this.details.id)
    await page.waitForSelector('.scaffold-layout__main')
    
    if (scrollPage) {

      await page.evaluate(async () => {
        const totalDuration = 5 * 1000;
        const scrollStep = window.innerHeight / 2;
        const delay = 100;
    
        const startTime = Date.now();
        const endTime = startTime + totalDuration;
    
        while (Date.now() < endTime) {
          window.scrollBy(0, scrollStep);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
  
        window.scrollTo(0, document.body.scrollHeight);
      });

    }

    await new Promise(r => setTimeout(r, waitMs));
    await page.close()
  }

  /** Send connection request to user
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {string} connectionMessage - Message that will send with connection request
   */
  async connectionRequest(linkedinClient, connectionMessage, waitMs) {
    if (!waitMs) waitMs = randomNumber(linkedinClient.linkedinSettings.COOLDOWN_MIN * 1000, linkedinClient.linkedinSettings.COOLDOWN_MAX * 1000)
    console.log('[TASK] Conection request: ' + this.details.name + ' (waitMs: ' + waitMs.toFixed(0) + ')');
    
    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(linkedinClient.linkedinSettings.MAIN_ADDRESS + 'in/' + this.details.id)

    await page.waitForSelector('.scaffold-layout__main > section > div:nth-child(2) > div > div > button')

    let buttonText = await page.evaluate(async () => {
      await new Promise(r => setTimeout(r, 500));

      //* If there is extra div remove it
      if (document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').classList[0] === 'display-flex') document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').remove()

      let parentDiv = document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child')
      return parentDiv.querySelector('button').textContent.trim()
    })

    const firstButtonisMessage = (buttonText === linkedinClient.linkedinSettings.PROFILEBUTTON_MESSAGE)
    if (firstButtonisMessage) {
      await page.close()
      throw new Error('  Already connected or connection already sent.')
    }

    const firstButtonisConnect = (buttonText === linkedinClient.linkedinSettings.PROFILEBUTTON_CONNECT)
    if (firstButtonisConnect) {
      let connectButtonQuery = '.scaffold-layout__main > section > div:nth-child(2) > div:last-child > div > button'
      await page.waitForSelector(connectButtonQuery);
      await page.click(connectButtonQuery);
  
      let actionBarQuery = '#artdeco-modal-outlet > div > div > .artdeco-modal__actionbar'
      await page.waitForSelector(actionBarQuery);
      if (!connectionMessage) {
          await page.click(actionBarQuery + ' > button:nth-child(2)');
      } else {
          await page.click(actionBarQuery + ' > button:first-child');
  
          await page.waitForSelector('#custom-message');
          await page.focus('#custom-message');
          await page.type('#custom-message', connectionMessage);
  
          await page.focus('.artdeco-modal__actionbar > button:nth-child(2)');
          await page.click('.artdeco-modal__actionbar > button:nth-child(2)');
      }
      await new Promise(r => setTimeout(r, 500));
  
      await new Promise(r => setTimeout(r, waitMs));
      await page.close()
      return console.log('  Connection request sent.')
    }

    const firstButtonisFollow = (buttonText === linkedinClient.linkedinSettings.PROFILEBUTTON_FOLLOW)
    if (firstButtonisFollow) {
      let moreButtonQuery = '.scaffold-layout__main > section > div:nth-child(2) > div > div > .artdeco-dropdown'
      await page.waitForSelector(moreButtonQuery)
      await page.click(moreButtonQuery)

      await new Promise(r => setTimeout(r, 500));

      let connectButtonQuery = '.scaffold-layout__main > section > div:nth-child(2) > div > div > div:last-child > div > div > ul > li:nth-child(3) > div'
      await page.waitForSelector(connectButtonQuery);
      await page.click(connectButtonQuery);
  
      let actionBarQuery = '#artdeco-modal-outlet > div > div > .artdeco-modal__actionbar'
      await page.waitForSelector(actionBarQuery);
      if (!connectionMessage) {
          await page.click(actionBarQuery + ' > button:nth-child(2)');
      } else {
          await page.click(actionBarQuery + ' > button:first-child');
  
          await page.waitForSelector('#custom-message');
          await page.focus('#custom-message');
          await page.type('#custom-message', connectionMessage);
  
          await page.focus('.artdeco-modal__actionbar > button:nth-child(2)');
          await page.click('.artdeco-modal__actionbar > button:nth-child(2)');
      }
      
      await new Promise(r => setTimeout(r, waitMs));
      await page.close()
      return console.log('  Connection request sent.')
    }

  }

  /** Send message to a profile
   * @param {LinkedIn} linkedinClient 
   * @param {string} message 
   * @param {number} waitMs 
   */
  async sendMessage(linkedinClient, message, waitMs) {
    if (!waitMs) waitMs = randomNumber(linkedinClient.linkedinSettings.COOLDOWN_MIN * 1000, linkedinClient.linkedinSettings.COOLDOWN_MAX * 1000)
    console.log('[TASK] Send message: ' + this.details.name + ' (waitMs: ' + waitMs.toFixed(0) + ')');

    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(linkedinClient.linkedinSettings.MAIN_ADDRESS + 'in/' + this.details.id)

    try { await page.waitForSelector('.scaffold-layout__main > section > div:nth-child(2) > div > div > div > .artdeco-button') }
    catch (e) { throw new Error('Cannot send message to user. Message button not found in profile. (1)')  }
    

    let buttonText = await page.evaluate(async () => {
      await new Promise(r => setTimeout(r, 500));

      //* If there is extra div remove it
      if (document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').classList[0] === 'display-flex') document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').remove()

      let parentDiv = document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child')
      return parentDiv.querySelector('button').textContent.trim()
    })

    const firstButtonisMessage = (buttonText === linkedinClient.linkedinSettings.PROFILEBUTTON_MESSAGE)
    if (!firstButtonisMessage) throw new Error('Cannot send message to user. Message button not found in profile. (2)');

    
    //todo: Not works.... IDK WHYY
    await page.click('.scaffold-layout__main > section > div:nth-child(2) > div > div > div > .artdeco-button')


    await page.waitForSelector('.msg-form__contenteditable')
    await page.type('.msg-form__contenteditable', message)


    await new Promise(r => setTimeout(r, 500));

  }


  /** Get profile with url
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {string} url - full profile url or just the id part 
   * @returns {LinkedinProfile}
   */
  static async getProfile(linkedinClient, url) {
    if (url.includes('/in/')) url = url.split('/in/')[1].replaceAll('/', '')
    console.log('[TASK] Get profile: ' + url);

    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()

    await page.goto(linkedinClient.linkedinSettings.MAIN_ADDRESS + 'in/' + url)
    await page.waitForSelector('.scaffold-layout__main')

    let details = await page.evaluate(() => {
      //* If there is extra div remove it
      if (document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').classList[0] === 'display-flex') document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').remove()

      let btnparentDiv = document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child')

      return {
        name: (document.querySelector('.artdeco-card > div:nth-child(2) > div:nth-child(2) > div > div > span')?.textContent ?? '').trim(),
        title: (document.querySelector('.artdeco-card > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2)')?.textContent ?? '').trim(),
        location: (document.querySelector('.artdeco-card > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > span')?.textContent ?? '').trim(),
        buttonText: btnparentDiv.querySelector('button').textContent.trim()
      }
    })

    details.id = url
    details.link = page.url()

    await new Promise(r => setTimeout(r, 500));
    await page.close()

    return new LinkedinProfile(details)
  }

}

module.exports = LinkedinProfile