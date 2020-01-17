const hexskell = require('./util/hexskell')

const NUMBER_ROUNDS = 4 // must be even

const performTournament = async (newBot, competitors) => {
  // the new bot faces off against all competitors
  // returns a list of match results (not documents)

  let matches = await Promise.all(competitors.map(competitor => performMatch(newBot, competitor)))
  return matches
}

const performMatch = async (compA, compB) => {
  // Announce match
  console.log(`Match between bots "${compA.name}" and "${compB.name}"`)
  console.log(`Consisting of ${NUMBER_ROUNDS} rounds`)

  // Start the rounds in parallel
  let rounds = await Promise.all(Array.from({length: NUMBER_ROUNDS}).map(async (_, i) => {
    console.log(`Starting round ${i + 1}`)

    // Red and blue players alternate each round
    let competitors = i % 2 === 0 ? [compA, compB] : [compB, compA]

    // Perform round
    return performRound(...competitors)
      .then(round => {
        console.log(`Winner of round ${i + 1} is ${round.players[round.winner].name}`)
        return round
      })
  }))

  // Who won? Was it a tie?
  // Award wins to winning bot
  let AWins = rounds.filter(round => round.players[round.winner].name === compA.name).length
  let BWins = NUMBER_ROUNDS - AWins
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

  return {
    competitors: [compA.id, compB.id],
    rounds,
    winningCompetitor
  }
}

const performRound = async (redBot, blueBot) => {
  const gameResult = await hexskell(redBot.code, blueBot.code)
  if (!gameResult) {
    throw Error('Failed to run match')
  }

  const round = {
    players: {
      red: redBot,
      blue: blueBot
    },
    winner: gameResult.winner.toLowerCase(),
    terminalState: JSON.stringify({
      red: gameResult.checkers.red,
      blue: gameResult.checkers.blue
    })
  }

  return round
}

module.exports = { performMatch, performRound, performTournament }
