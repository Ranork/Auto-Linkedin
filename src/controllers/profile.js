const { randomNumber } = require("../libraries/misc");
const LinkedIn = require("./linkedin");


class LinkedinProfile {
  constructor(details) { 
    this.details = details
  }


  /** Visit the user's rofile page
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {number} waitMs - Wait milliseconds after opening profile (default is coming from linkedin client)
   * @param {boolean} scrollPage - Scroll page to bottom to be sure (default: true)
   */
  async visitProfile(linkedinClient, waitMs, scrollPage = true) {
    if (!waitMs) waitMs = randomNumber(linkedinClient.linkedinSettings.COOLDOWN_MIN, linkedinClient.linkedinSettings.COOLDOWN_MAX)

    console.log('[TASK] LinkedinProfile Visit: ' + this.details.name + ' (waitMs: ' + waitMs.toFixed(2) + ', scrollPage: ' + scrollPage + ')');
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
    if (!waitMs) waitMs = randomNumber(linkedinClient.linkedinSettings.COOLDOWN_MIN, linkedinClient.linkedinSettings.COOLDOWN_MAX)
    console.log('[TASK] Conection request: ' + this.details.name + ' (waitMs: ' + waitMs.toFixed(2) + ')');
    
    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(linkedinClient.linkedinSettings.MAIN_ADDRESS + 'in/' + this.details.id)

    await page.waitForSelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child > div > button')

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
      return console.log('  Already connected to ' + this.details.name + ' (' + this.details.id + ')')
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
      return console.log('  Connection request send to ' + this.details.name + ' (' + this.details.id + ')')
    }

    const firstButtonisFollow = (buttonText === linkedinClient.linkedinSettings.PROFILEBUTTON_FOLLOW)
    if (firstButtonisFollow) {
      let moreButtonQuery = '.scaffold-layout__main > section > div:nth-child(2) > div:last-child > div > div:last-child > button'
      await page.waitForSelector(moreButtonQuery)
      await page.click(moreButtonQuery)

      await new Promise(r => setTimeout(r, 500));

      let connectButtonQuery = '.scaffold-layout__main > section > div:nth-child(2) > div:last-child > div > div:last-child > div > div > ul > li:nth-child(3) > div'
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
      return console.log('  Connection request send to ' + this.details.name + ' (' + this.details.id + ')')
    }

  }
}

module.exports = LinkedinProfile