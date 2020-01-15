const Bot = require('../../model/Bot')
const Match = require('../../model/Match')
const { resolveMatch } = require('./props')
const { find } = require('../../util/findModel')
const { performMatch } = require('../../util/tournament')

const resolvers = {
  Query: {
    matches: (_) => find(Match, undefined, resolveMatch)
  },
  Mutation: {
    removeMatches: _ => Match.deleteMany({}).then(_ => []),
    competeBots: async (_, {competitors}) => {
      // Get competitors from ids
      if (competitors.length !== 2) {
        throw Error('Requires two competitors')
      }
      const [compA, compB] = await Promise.all(competitors.map(id => Bot.findById(id)))

      // Do we have them?
      if (!(compA && compB)) {
        throw Error('No such bots')
      }

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
