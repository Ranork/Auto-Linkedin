const { Environment } = require("../libraries/environment");
const { LinkedIn } = require("./linkedin");


class Profile {
  constructor(details) { 
    this.details = details
  }


  /** Visit the user's rofile page
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   */
  async visitProfile(linkedinClient) {
    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(Environment.settings.MAIN_ADDRESS + 'in/' + this.details.id)

    await new Promise(r => setTimeout(r, 500));
    await page.close()
  }


  /** Send connection request to user
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {string} connectionMessage - Message that will send with connection request
   */
  async connectionRequest(linkedinClient, connectionMessage) {
    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()
    await page.goto(Environment.settings.MAIN_ADDRESS + 'in/' + this.details.id)

    let buttonText = await page.evaluate(async () => {
      await new Promise(r => setTimeout(r, 500));
      let parentDiv = document.querySelector('.scaffold-layout__main > section > div:nth-child(2) > div:last-child')
      return parentDiv.querySelector('button').textContent.trim()
    })

    const alreadyConnected = (buttonText === Environment.settings.PROFILEBUTTON_MESSAGE)
    if (alreadyConnected) {
      await page.close()
      return console.log('Already connected to ' + this.details.name + ' (' + this.details.id + ')')
    }

    let connectButtonQuery = '.scaffold-layout__main > section > div:nth-child(2) > div:last-child > div > button'
    await page.waitForSelector(connectButtonQuery);
    await page.click(connectButtonQuery);

    await new Promise(r => setTimeout(r, 500));

    let actionBarQuery = '#artdeco-modal-outlet > div > div > .artdeco-modal__actionbar'
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
    await new Promise(r => setTimeout(r, 1000));

    await page.close()
    return console.log('Connection request send to ' + this.details.name + ' (' + this.details.id + ')')
  }
}

module.exports = Profile