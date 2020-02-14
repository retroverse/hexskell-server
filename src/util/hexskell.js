const fetch = require('node-fetch')

const {
  HEXSKELL_SERVER_ADDRESS,
  HEXSKELL_SERVER_PORT
} = require('../config')

const hexskell = (redCode, blueCode) => {
  return fetch(
    `http://${HEXSKELL_SERVER_ADDRESS}:${HEXSKELL_SERVER_PORT}`,
    {
      method: 'post',
      body: JSON.stringify({ redCode, blueCode })
    }
  ).then(
    response => response.json()
  )
  .catch(
    err => { throw Error(`Fetch request to HEXSKELL Core-API failed: ${err}`) }
  )
}

// SAMPLE CODE: const empty = getAllCheckers(grid).filter(checker => checker.team === 'neutral'); return empty[0]

module.exports = hexskell
