const Bot = require('../../model/Bot')
const { find, findOne } = require('../../util/findModel')
const { ensureOwnBot, getMe } = require('../auth')
const { resolveBot } = require('./props')

const botResolvers = {
  Query: {
    bots: (_) => find(Bot, undefined, resolveBot),
    bot: (_, {id, name}) => findOne(Bot, {_id: id, name}, resolveBot)
  },
  Mutation: {
    newBot: async (_, {name, code}, {isAuth, userID}) => {
      // Get my user document
      let me = await getMe(isAuth, userID)

      // Does a bot with this name exist?
      let pre = await Bot.findOne({name})
      if (pre) {
        throw Error('Bot with given name already exists')
      }

      // Create the new bot
      let bot = new Bot({name, code})
      bot.author = userID

      // Add to user list
      me.createdBots.push(bot.id)
      await me.save()

      // Save bot and resolve query properties
      return bot.save().then(resolveBot)
    },
    // #TODO: Remove all matches that include this bot
    removeBot: async (_, {id}, {isAuth, userID}) => {
      // Check auth and that bot is own
      await ensureOwnBot(id, isAuth, userID)

      // Remove bot then resolve and return old one
      let old = await Bot.findByIdAndDelete(id)
      return resolveBot(old)
    },
    // #TODO: Should it be possible to update a published bot?
    setBot: async (_, {id, name, code}, {isAuth, userID}) => {
      // Check auth and that bot is own
      await ensureOwnBot(id, isAuth, userID)

      // Update bot then resolve and return
      let updated = await Bot.findByIdAndUpdate(id, {name, code}, {omitUndefined: true})
      return resolveBot(updated)
    }
  }
}

module.exports = botResolvers
