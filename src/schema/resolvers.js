const Bot = require('../model/Bot')
const find = require('../util/findModel')

const resolvers = {
  Query: {
    bots: (_, {id, name}) => find(Bot, {_id: id, name}),
    bot: (_, {id, name}) => Bot.findOne({id, name})
  },
  Mutation: {
    newBot: (_, {name, code}) => (new Bot({name, code})).save(),
    removeBot: (_, {id}) => Bot.findByIdAndDelete(id),
    setBot: (_, {id, name, code}) => Bot.findByIdAndUpdate(id, {name, code}, {omitUndefined: true})
  }
}

module.exports = resolvers
