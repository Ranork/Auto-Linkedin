require('dotenv').config();


class Environment {
  static settings = {}

  static async declare_settings() {
    this.settings = process.env

    
    this.settings.TIMEOUT = parseInt(this.settings.TIMEOUT)
  }
}



module.exports = { Environment }