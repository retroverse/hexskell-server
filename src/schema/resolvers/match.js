const { UserInputError } = require('apollo-server-express')
const Bot = require('../../model/Bot')
const Match = require('../../model/Match')
const { resolveMatch, resolveTestRound } = require('./props')
const { find, findOne } = require('../../util/findModel')
const { performMatch, performTestRound } = require('../../tournament')

const resolvers = {
  Query: {
    match: (_, { id }) => findOne(Match, { _id: id }, resolveMatch),
    matches: (_) => find(Match, undefined, resolveMatch)
  },
  Mutation: {
    removeMatches: _ => Match.deleteMany({}).then(_ => []),
    competeBots: async (_, { competitors }) => {
      // Get competitors from ids
      if (competitors.length !== 2) {
        throw new UserInputError('Bad Input: Mutation requires exactly two competitors')
      }
      const [compA, compB] = await Promise.all(competitors.map(id => Bot.findById(id)))

      // Do we have them?
      ;[compA, compB].forEach((bot, i) => {
        if (!bot) {
          throw new UserInputError(`Bad Input: No such bot with id "${competitors[i]}"`)
        }
      })

      // Perform match
      const matchResult = await performMatch(compA, compB)

      // Create match document (isn't saved)
      const match = new Match({ ...matchResult })

      // Resolve and return
      return resolveMatch(match)
    },
    competeScripts: async (_, { scripts }) => {
      let [redScript, blueScript] = scripts
      if (redScript === undefined || blueScript === undefined) {
        throw new UserInputError('Bad Input: Mutation requires two scripts')
      }

      const roundResult = await performTestRound(scripts)

      return resolveTestRound({
        ...roundResult,
        botErrors: [roundResult.error].filter(x => x),
        botLogs: roundResult.logs.filter(x => x)
      })
    }
  }
}

module.exports = resolvers
