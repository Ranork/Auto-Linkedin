const { Environment } = require("./environment")


function randomNumber(start, end) {
  if (!start) start = Environment.settings.COOLDOWN_MIN
  if (!end) end = Environment.settings.COOLDOWN_MAX
  
  return (Math.random() * Math.abs(end - start)) + start
}

module.exports = {
  randomNumber,
}