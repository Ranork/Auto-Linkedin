const { Environment } = require("./libraries/environment");
const { LinkedIn } = require("./controllers/linkedin");

async function main() {
  await Environment.declare_settings()

  //! Headless unabled for debug
  const client = new LinkedIn({ headless: true })
  await client.login(Environment.settings.ACCOUNT_USERNAME, Environment.settings.ACCOUNT_PASSWORD)

  let profiles = await client.searchPeople({
    keywords: 'Business Intelligence',
    network: ['S'],
    geoUrn: ['90010435'],
  }, 100)

  let i = 1
  for (let p of profiles) {
    let waitms = ((Math.random() * 10) + 1) * 1000
    
    await p.visitProfile(client, waitms)
    console.log('  ' + i + '/' + profiles.length);
    i++
  }

  


}





main()