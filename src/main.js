const { Environment } = require("./libraries/environment");
const { LinkedIn } = require("./controllers/linkedin");

async function main() {
  await Environment.declare_settings()

  //! Headless unabled for debug
  const client = new LinkedIn({ headless: true })
  await client.login(Environment.settings.ACCOUNT_USERNAME, Environment.settings.ACCOUNT_PASSWORD)

  let profiles = await client.searchPeople({
    keywords: 'Data Analyst',
    network: ['S'],
    // geoUrn: ['90010435'],
  }, 50)

  let i = 1
  for (let p of profiles) {
    try {
      await p.connectionRequest(client, `Merhaba, ben DEBI'den Emir. Veri analizini dinamik hale getirerek teknik bilgi olmadan rapor hazırlamayı mümkün kılıyoruz!
Sizin fikirleriniz bizim için değerli.
DEBI'yi denemek için: https://debi.akatron.net/demo/
Bana ulaşmak için: emir@akatron.net`)
    }
    catch (e) {
      console.log(e);
    }
    console.log('  ' + i + '/' + profiles.length);
    i++
  }

  


}





main()