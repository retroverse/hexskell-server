const { UserInputError } = require('apollo-server-express')
const Bot = require('../../model/Bot')
const User = require('../../model/User')
const Match = require('../../model/Match')

/*
  type BotStatistics {
    wins: Int!,
    ties: Int!,
    losses: Int!,
    numMatches: Int!,
    ranking: Int!,
    winRate: Float!,
    winRateBlue: Float!,
    winRateRed: Float!,
    averageGameLength: Float! # Average across all matches
  }

  type UserStatistics {
    totalWins: Int!,
    totalTies: Int!,
    totalLosses: Int!,
    bestRanking: Int!
  }
*/

const sum = (arr) => arr.reduce((a, b) => a + b, 0)
const sameRef = (ref, doc) => String(ref) === String(doc._id)

const userStatistics = async (_, { id }) => {
  // Find user
  const user = await User.findById(id)
  if (!user) {
    throw new UserInputError(`Bad Input: No such user with id "${id}"`)
  }

  return calculateUserStatistics(user)
}

const calculateUserStatistics = async (user) => {
  // Find users bots
  const bots = await Bot.find({ _id: { $in: user.createdBots } })
  const botNumResults = await Promise.all(bots.map(bot => calculateBotMatchResults(bot)))
  const totalWins = sum(botNumResults.map(res => res.wins))
  const totalTies = sum(botNumResults.map(res => res.ties))
  const totalLosses = sum(botNumResults.map(res => res.losses))

  // Calculate best ranking
  const rankings = await Promise.all(bots.map(bot => calculateBotRanking(bot)))
  const bestRanking = rankings
    .filter(x => !!x)
    .sort()[0]

  return {
    totalLosses,
    totalTies,
    totalWins,
    bestRanking
  }
}

const botStatistics = async (_, { id }) => {
  // Find Bot
  const bot = await Bot.findById(id)
  if (!bot) {
    throw new UserInputError(`Bad Input: No such bot with id "${id}"`)
  }

  // Get statistics
  const stats = await calculateBotStatistics(bot)
  return stats
}

const botRanking = async (id) => {
  const bot = await Bot.findById(id)
  if (!bot) {
    throw new UserInputError(`Bad Input: No such bot with id "${id}"`)
  }

  if (!bot.published) {
    return null
  }

  // Get statistics
  const ranking = await calculateBotRanking(bot)
  return ranking
}

const calculateBotRanking = async (bot) => {
  // No ranking if not published
  if (!bot.published) {
    return null
  }

  // Find all published bots and sort by number wins descending
  const rankedBots = await Bot.find({ published: true }).sort({ wins: 'desc', ties: 'asc' })
  const rankedBotIDs = rankedBots.map(bot => String(bot._id))
  const ranking = rankedBotIDs.indexOf(String(bot._id)) + 1
  return ranking
}

const calculateBotMatchResults = async (bot) => {
  // Find all matches where the competitors include this bot
  const matches = await Match.find({ competitors: { $all: [bot] } })
  const numMatches = matches.length

  // Find winning and tied matches
  const winningMatches = matches.filter(({ winningCompetitor }) => sameRef(winningCompetitor, bot))
  const losingMatches = matches.filter(({ winningCompetitor }) => winningCompetitor && !sameRef(winningCompetitor, bot))
  const tiedMatches = matches.filter(({ winningCompetitor }) => !winningCompetitor)

  // Calculate number of wins, losses and ties
  const wins = winningMatches.length
  const ties = tiedMatches.length
  const losses = losingMatches.length

  return {
    matches,
    winningMatches,
    tiedMatches,
    losingMatches,
    numMatches,
    wins,
    ties,
    losses
  }
}

const calculateBotStatistics = async (bot) => {
  const {
    numMatches,
    matches,
    wins,
    ties,
    losses
  } = await calculateBotMatchResults(bot)

  // Calculate win rate as each player
  const rounds = matches
    .map(match => match.rounds)
    .reduce((a, b) => a.concat(b), [])
  const wonRounds = rounds.filter(round => sameRef(round.players[round.winner], bot))
  const wonRoundsAsRed = wonRounds.filter(round => round.winner === 'red')
  const wonRoundsAsBlue = wonRounds.filter(round => round.winner === 'blue')
  const winRate = wonRounds.length / rounds.length
  const redWins = wonRoundsAsRed.length
  const blueWins = wonRoundsAsBlue.length
  const winRateBlue = blueWins / rounds.length
  const winRateRed = redWins / rounds.length
  const redWinPercentage = wonRounds.length === 0 ? 0 : redWins / wonRounds.length

  // Parse each game state
  const gameStates = rounds.map(({ terminalState }) => JSON.parse(terminalState))

  // Calculate average game length
  const gameLengths = gameStates.map(({ red, blue }) => red.concat(blue).length)
  const averageGameLength = sum(gameLengths) / gameLengths.length

  // Calculate ranking
  const ranking = await calculateBotRanking(bot)

  return {
    numMatches,
    wins,
    ties,
    losses,
    winRate,
    winRateBlue,
    winRateRed,
    redWinPercentage,
    averageGameLength,
    ranking
  }
}

module.exports = {
  userStatistics,
  calculateUserStatistics,
  calculateBotMatchResults,
  calculateBotRanking,
  botStatistics,
  botRanking
}
