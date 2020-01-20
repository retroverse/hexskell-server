const fetch = require('node-fetch')

const {
  HEXSKELL_SERVER_ADDRESS,
  HEXSKELL_SERVER_PORT
} = require('../config')

const hexskell = (redCode, blueCode) => {
  return fetch(
    `http://${HEXSKELL_SERVER_ADDRESS}:${HEXSKELL_SERVER_PORT}?redCode=${redCode}&blueCode=${blueCode}`
  ).then(
    response => response.json()
  )
    .catch(
      err => { throw err }
    )
}

// SAMPLE CODE: const empty = getAllCheckers(grid).filter(checker => checker.team === 'neutral'); return empty[0]

module.exports = hexskell
