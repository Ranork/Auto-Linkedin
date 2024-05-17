const { Environment } = require("./libraries/environment");
const { LinkedIn } = require("./controllers/linkedin");

async function main() {
  await Environment.declare_settings()

  //! Headless unabled for debug
  const client = new LinkedIn({ headless: true })
  await client.login(Environment.settings.USERNAME, Environment.settings.PASSWORD)

  let profiles = await client.searchPeople({
    keywords: 'venture capital',
    network: ['S']
  }, 300)

  let i = 1
  for (let p of profiles) {
    console.log('  ' + i + '/' + profiles.length);
    i++
    
    await p.visitProfile(client, 50)
  }


}





main()