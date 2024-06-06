const { randomNumber } = require("../libraries/misc");
const LinkedIn = require("./linkedin");



class LinkedinCompany {
  /** Owned linkedin company
   * @param {string} id - company's number id
   * @param {object} details - Company details 
   * @param {string} details.name - name of company 
   * @param {number} details.follower_count - follower count
   * @param {string} details.logo - company logo source url
   * @param {string} details.cover_image - company cover image source url
   */
  constructor(id, details) { 
    this.id = id 
    this.details = details
  }


  /** Get company details
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @returns {LinkedinCompany} Linkedin company with details
   */
  async fetchDetails(linkedinClient) {
    console.log('[TASK] Get Company Details: ' + this.id);

    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()

    await page.goto(linkedinClient.linkedinSettings.MAIN_ADDRESS + 'company/' + this.id + '/admin/dashboard/')

    let details = await page.evaluate(() => {
      return ({
        name: document.querySelector('.org-organizational-page-admin-navigation__title').innerText.trim(),
        follower_count: parseInt(document.querySelector('.org-organizational-page-admin-navigation__follower-count').innerText.trim().split(' ')[0]),
        logo: document.querySelector('.org-organizational-page-admin-navigation__logo').src,
        cover_image: document.querySelector('.ivm-view-attr__img--centered').src
      })
    })

    details.id = this.id
    details.link = page.url()

    await page.close()

    this.details = details
    return this
  }


  /** Send follow invitation to users
   * @param {LinkedIn} linkedinClient - Client that will used in visit
   * @param {string} nameToSearch - Search keywords for profile name
   * @returns {Promise}
   */
  async sendInvite(linkedinClient, nameToSearch) {
    console.log('[TASK] Send Page (' + this.details.name + ') Invite to ' + nameToSearch);

    const browser = await linkedinClient.getBrowser()
    const page = await browser.newPage()

    await page.goto(linkedinClient.linkedinSettings.MAIN_ADDRESS + 'company/' + this.id + '/admin/analytics/followers/?invite=true')

    await page.waitForSelector('.artdeco-typeahead__input')
    let search_input = await page.$('.artdeco-typeahead__input')
    await search_input.type(nameToSearch)

    await new Promise(r => setTimeout(r, randomNumber(5,7) * 1000))

    let checkbox_id = await page.evaluate(() => {
      let input = document.querySelector('.artdeco-typeahead__result').querySelector('.ember-checkbox')
      if (input) return input.id
      else return null
    })

    if (!checkbox_id) {
      await page.close()
      throw new Error('Invitation already sent or profile not found.')
    }
    
    let checkbox_elm = await page.$('#' + checkbox_id)
    await checkbox_elm.click()

    let accept_btn = await page.$('.invitee-picker__footer > div > button')
    await accept_btn.click()

    await new Promise(r => setTimeout(r, randomNumber(1,2) * 1000))

    await page.close()
    console.log('  Invitation sent');
    return true
  }

}

module.exports = LinkedinCompany