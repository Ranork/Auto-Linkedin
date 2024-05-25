require('dotenv').config({overwrite: true});


class Environment {
  static settings = {}

  static async declare_settings() {
    this.settings = {...process.env}
    
    this.settings.TIMEOUT = parseInt(process.env.TIMEOUT)
    this.settings.COOLDOWN_MIN = parseInt(process.env.COOLDOWN_MIN)
    this.settings.COOLDOWN_MAX = parseInt(process.env.COOLDOWN_MAX)

    console.log('[S] Environment Declared.');
  }
}



module.exports = { Environment }