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
   * @param {Array<Objecr>} details.experiences - work experiences list
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
   * @param {number} waitMs - Wait milliseconds after opening profile (default is coming from linkedin client)
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
    
    //! if not change viewport, message button not works.
    await page.setViewport({ width: 1366, height: 768 })

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

    await page.tap('.scaffold-layout__main > section > div:nth-child(2) > div > div > div > .artdeco-button')

    await page.waitForSelector('.msg-form__contenteditable')
    await page.type('.msg-form__contenteditable', message)

    await new Promise(r => setTimeout(r, waitMs/2));
    await page.tap('.msg-form__send-button')
    await new Promise(r => setTimeout(r, waitMs/2));
  }

  /** Get Message history with this profile
   * @param {LinkedIn} linkedinClient 
   * @param {number} waitMs - Wait milliseconds
   * @returns {Array<Object>}
   */
  async getMessageHistory(linkedinClient, waitMs) {
    if (!waitMs) waitMs = randomNumber(linkedinClient.linkedinSettings.COOLDOWN_MIN * 1000, linkedinClient.linkedinSettings.COOLDOWN_MAX * 1000)
      console.log('[TASK] Message History: ' + this.details.name + ' (waitMs: ' + waitMs.toFixed(0) + ')');
  
      const browser = await linkedinClient.getBrowser()
      const page = await browser.newPage()
      
      //! if not change viewport, message button not works.
      await page.setViewport({ width: 1366, height: 768 })
  
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
  
      await page.tap('.scaffold-layout__main > section > div:nth-child(2) > div > div > div > .artdeco-button')


      await new Promise(r => setTimeout(r, waitMs));

      let messages = await page.evaluate(() => {
        let msgs = []
        let lastMsgTime, lastMsgName
        for (let msg of document.querySelectorAll('.msg-s-event-listitem, .msg-s-message-list__time-heading')) {
          
          if (msg.tagName.toLowerCase() === 'div') {
            if (msg.querySelector('time')) lastMsgTime = msg.querySelector('time').innerText.trim().replaceAll(' ','')
            if (msg.querySelector('a > img')) lastMsgName = msg.querySelector('a > img').title.trim()
  
            msgs.push({
              time: lastMsgTime,
              name: lastMsgName,
              message: msg.querySelector('.msg-s-event__content').innerText.trim()
            })
          }
          else if (msg.tagName.toLowerCase() === 'time') {
            msgs.push(msg.innerText)
          }

        }
        return msgs
      })

      return messages
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

    details.experiences = await page.evaluate(() => {
      let divs = document.querySelector('#experience')?.parentElement?.querySelectorAll('.artdeco-list__item') ?? []
      let result = []
      for (let elm of divs) {

          let company_name, company_url, employment_type, title, period

          company_url =  elm.querySelector('a').href
          if (company_url.includes('search')) company_url = null
          
          //. Multi title/position
          if (elm.querySelector('div > div:nth-child(2) > div > a > div')) {
              company_name = elm.querySelector('div > div:nth-child(2) > div > a > div').querySelector('span').innerText
              title = elm.querySelector('div > div:nth-child(2) > div:nth-child(2)').querySelector('a > div').querySelector('span').innerText
              if (elm.querySelector('div > div:nth-child(2) > div > a > span > span').innerText.includes('·')) {
                  employment_type = elm.querySelector('div > div:nth-child(2) > div > a > span > span').innerText.split(' · ')[0]
                  period = elm.querySelector('div > div:nth-child(2) > div > a > span > span').innerText.split(' · ')[1]
              }
              else {
                  period = elm.querySelector('div > div:nth-child(2) > div > a > span > span').innerText
              }
          }

          //. Single title/position
          else {
              company_name = elm.querySelector('div > div:nth-child(2) > div > div > span > span').innerText.split(' · ')[0]
              employment_type = elm.querySelector('div > div:nth-child(2) > div > div > span > span').innerText.split(' · ')[1]
              title = elm.querySelector('div > div:nth-child(2) > div > div > div').querySelector('span').innerText
              period = elm.querySelector('div > div:nth-child(2) > div > div > span:nth-child(3) > span').innerText
          }
          
          result.push({
              company_url,
              company_name, employment_type, title, period
          })
      }
      return result
    })

    await new Promise(r => setTimeout(r, 500));
    await page.close()

    return new LinkedinProfile(details)
  }

}

module.exports = LinkedinProfile