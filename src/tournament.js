const hexskell = require('./util/hexskell')
const transformScript = require('./scripts')

const NUMBER_ROUNDS = 4 // must be even

const performTournament = async (newBot, competitors) => {
  // the new bot faces off against all competitors
  // returns a list of match results (not documents)

  const matches = await Promise.all(competitors.map(competitor => performMatch(newBot, competitor)))
  return matches
}

const performMatch = async (compA, compB) => {
  // Announce match
  console.log(`Match between bots "${compA.name}" and "${compB.name}"`)
  console.log(`Consisting of ${NUMBER_ROUNDS} rounds`)

  // Start the rounds in parallel
  const rounds = await Promise.all(Array.from({ length: NUMBER_ROUNDS }).map(async (_, i) => {
    console.log(`Starting round ${i + 1}`)

    // Red and blue players alternate each round
    const competitors = i % 2 === 0 ? [compA, compB] : [compB, compA]

    // Script Transformations (resolve import statements)
    const [redCode, blueCode] = await Promise.all(competitors.map(c => transformScript(c.code)))

    // Perform round
    return performRound(redCode, blueCode, ...competitors)
      .then(round => {
        console.log(`Competitors were ${competitors[0].name} and ${competitors[1].name}`)
        console.log(`Winner of round ${i + 1} is ${round.players[round.winner].name}`)
        return round
      })
      .catch(err => {
        console.error(`An error occured while performing round ${i + 1}`, err)
      })
  }))

  // Who won? Was it a tie?
  // Award wins to winning bot
  const AWins = rounds.filter(round => round.players[round.winner].name === compA.name).length
  const BWins = NUMBER_ROUNDS - AWins
  let winningCompetitor
  if (AWins === BWins) {
    // Tie
    console.log('Match is a tie')
    winningCompetitor = null
  } else {
    if (AWins > BWins) {
      // Win for A
      console.log(`Match goes to ${compA.name}`)
      winningCompetitor = compA
    } else {
      // Win for B
      console.log(`Match goes to ${compB.name}`)
      winningCompetitor = compB
    }
  }

  const roundLogs = rounds.map((round, i) => round.logs.map(log => ({...log, round: i + 1})))
  const botLogs = roundLogs.reduce((a, b) => a.concat(b), [])

  return {
    competitors: [compA.id, compB.id],
    rounds,
    botErrors: rounds.filter(round => round.error).map((round, i) => ({ ...round.error, round: i + 1 })).filter(x => x),
    botLogs,
    winningCompetitor
  }
}

const performRound = async (redCode, blueCode, redBot, blueBot) => {

  // Call to hexskell server and await response
  const gameResult = await hexskell(redCode, blueCode)
    .catch(err => {
      throw Error(`Game execution failed: ${err}`)
    })

  // Did we get a result
  if (!gameResult) {
    throw Error('Failed to run match, no result')
  }

  // Check for a bot error
  let error = undefined
  if (gameResult.error) {
    const bot = gameResult.winner.toLowerCase() === 'red' ? blueBot : redBot
    const player = gameResult.winner.toLowerCase() === 'red' ? 'blue' : 'red'
    const message = gameResult.error
    error = { bot, message, player }
  }

  // Add meta information to each log (turn, bot, player etc)
  let logsByTurnRed = gameResult.logs.red.map((messages, i) => messages.map((message, j) => (
    { message, turn: (i * 2) + 1, logNumber: j, player: 'red', bot: redBot }
  )))
  let logsByTurnBlue = gameResult.logs.blue.map((messages, i) => messages.map((message, j) => (
    { message, turn: (i * 2) + 2, logNumber: j, player: 'blue', bot: blueBot }
  )))
  
  // Concatenate logs into a single array for each player
  let redLogs = logsByTurnRed.reduce((a, b) => a.concat(b), [])
  let blueLogs = logsByTurnBlue.reduce((a, b) => a.concat(b), [])
  let logs = redLogs.concat(blueLogs)

  const round = {
    players: {
      red: redBot,
      blue: blueBot
    },
    winner: gameResult.winner.toLowerCase(),
    terminalState: JSON.stringify({
      red: gameResult.checkers.red,
      blue: gameResult.checkers.blue
    }),
    error,
    logs
  }

  return round
}

module.exports = { performMatch, performRound, performTournament }
