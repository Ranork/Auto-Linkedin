const { Environment } = require("./libraries/environment");
const { LinkedIn } = require("./controllers/linkedin");

async function main() {
  await Environment.declare_settings()

  //! Headless unabled for debug
  const client = new LinkedIn({ headless: false })
  await client.login(Environment.settings.USERNAME, Environment.settings.PASSWORD)

  let profiles = await client.searchPeople({
    keywords: 'iş zekası',
    network: ['S']
  })

  console.log(profiles);

}





main()