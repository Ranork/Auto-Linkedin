const { Environment } = require("./libraries/environment");
const { LinkedIn } = require("./controllers/linkedin");

async function main() {
  await Environment.declare_settings()

  //! Headless unabled for debug
  const client = new LinkedIn({ headless: true })
  await client.login(Environment.settings.USERNAME, Environment.settings.PASSWORD)

  let profiles = await client.searchPeople({
    keywords: 'data scientist',
    network: ['S'],
    geoUrn: ['90010435'],
  }, 300)

  let i = 1
  for (let p of profiles) {
    let waitms = ((Math.random() * 10) + 1) * 1000
    
    await p.visitProfile(client, waitms)
    console.log('  ' + i + '/' + profiles.length);
    i++
  }


}





main()