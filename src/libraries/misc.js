function randomNumber(start, end) {
  if (!start) start = 5
  if (!end) end = 20
  
  return (Math.random() * Math.abs(end - start)) + start
}

module.exports = {
  randomNumber,
}