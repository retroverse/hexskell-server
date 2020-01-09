const fetch = require('node-fetch')

const {
  HEXSKELL_SERVER_ADDRESS,
  HEXSKELL_SERVER_PORT
} = require('../config')

const hexskell = (redCode, blueCode) => fetch(
  `${HEXSKELL_SERVER_ADDRESS}:${HEXSKELL_SERVER_PORT}?redCode=${redCode}&blueCode=${blueCode}`
).then(
  response => response.json()
)

module.exports = hexskell
