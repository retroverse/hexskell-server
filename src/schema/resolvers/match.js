const { UserInputError } = require('apollo-server-express')
const Bot = require('../../model/Bot')
const Match = require('../../model/Match')
const { resolveMatch } = require('./props')
const { find } = require('../../util/findModel')
const { performMatch } = require('../../tournament')

const resolvers = {
  Query: {
    matches: (_) => find(Match, undefined, resolveMatch)
  },
  Mutation: {
    removeMatches: _ => Match.deleteMany({}).then(_ => []),
    competeBots: async (_, {competitors}) => {
      // Get competitors from ids
      if (competitors.length !== 2) {
        throw new UserInputError('Bad Input: Mutation requires exactly two competitors')
      }
      const [compA, compB] = await Promise.all(competitors.map(id => Bot.findById(id)))

      // Do we have them?
      [compA, compB].forEach((bot, i) => {
        if (!bot) {
          throw new UserInputError(`Bad Input: No such bot with id "${competitors[i]}"`)
        }
      })

      // Perform match
      let matchResult = await performMatch(compA, compB)

      // Create match document (isn't saved)
      let match = new Match({...matchResult})

      // Resolve and return
      return resolveMatch(match)
    }
  }
}

module.exports = resolvers
