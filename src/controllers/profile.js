const { Environment } = require("../libraries/environment");
const { LinkedIn } = require("./linkedin");


class Profile {
  constructor(details) { 
    this.details = details
  }


  /** Visit the user's rofile page
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {number} waitMs - Wait milliseconds after opening profile (default is 500ms)
   */
  async visitProfile(linkedinClient, waitMs = 500) {
    console.log('[TASK] Profile Visit: ' + this.details.name + ' (' + this.details.id + ')');
    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(Environment.settings.MAIN_ADDRESS + 'in/' + this.details.id)
    await page.waitForSelector('.scaffold-layout__main')
    
    await new Promise(r => setTimeout(r, waitMs));
    await page.close()
  }


  /** Send connection request to user
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {string} connectionMessage - Message that will send with connection request
   */
  async connectionRequest(linkedinClient, connectionMessage) {
    console.log('[TASK] Conection request: ' + this.details.name + ' (' + this.details.id + ')');
    
    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(Environment.settings.MAIN_ADDRESS + 'in/' + this.details.id)

    let buttonText = await page.evaluate(async () => {
      await new Promise(r => setTimeout(r, 500));

      //* If there is extra div remove it
      if (document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').classList[0] === 'display-flex') document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child').remove()

      let parentDiv = document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child')
      return parentDiv.querySelector('button').textContent.trim()
    })

    const firstButtonisMessage = (buttonText === Environment.settings.PROFILEBUTTON_MESSAGE)
    if (firstButtonisMessage) {
      await page.close()
      return console.log('  Already connected to ' + this.details.name + ' (' + this.details.id + ')')
    }

    const firstButtonisConnect = (buttonText === Environment.settings.PROFILEBUTTON_CONNECT)
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
  
      await page.close()
      return console.log('  Connection request send to ' + this.details.name + ' (' + this.details.id + ')')
    }

    const firstButtonisFollow = (buttonText === Environment.settings.PROFILEBUTTON_FOLLOW)
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
      await new Promise(r => setTimeout(r, 500));
  
      await page.close()
      return console.log('  Connection request send to ' + this.details.name + ' (' + this.details.id + ')')
    }

  }
}

module.exports = Profile