const { Environment } = require("./libraries/environment");
const { LinkedIn } = require("./controllers/linkedin");

async function main() {
  await Environment.declare_settings()

  //! Headless unabled for debug
  const client = new LinkedIn({ headless: false })
  await client.login(Environment.settings.USERNAME, Environment.settings.PASSWORD)

  let profiles = await client.searchPeople({
    keywords: 'data analyse',
    network: ['B']
  }, 10)

  console.log(profiles);

  for (let p of profiles) {
    await p.connectionRequest(client)
    
  }


}





main()