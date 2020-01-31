const { UserInputError } = require('apollo-server-express')
const Bot = require('../../model/Bot')
const User = require('../../model/User')
const Match = require('../../model/Match')
const { find, findOne } = require('../../util/findModel')
const { ensureOwnBot, getMe } = require('../auth')
const { resolveBot } = require('./props')
const { unpublish } = require('../../publishing')
const { botStatistics } = require('./statistics')

const botResolvers = {
  Query: {
    bots: async (_, { input }, { isAuth, userID }) => {
      // If there was no options provided then just send every bot
      if (!input) {
        return { bots: await find(Bot, {}, resolveBot), totalPages: 1, currentPage: 1 }
      }

      // Create filter obj using provided filters
      let filter = {}
      if (input.filters) {
        // Filter for bots created by authenticated user
        if (input.filters.includes('MINE')) {
          // Must be authenticated
          if (!isAuth || !userID) {
            throw new UserInputError('Bad Input: Must be authenticated to use "MINE" bot filter.')
          }

          // Add user id requirement
          filter = { ...filter, author: userID }
        }

        // Filter for bots that have been published
        if (input.filters.includes('PUBLISHED')) {
          // Add published requirement
          filter = { ...filter, published: true }
        }
      }

      // Sort by given sort method and order
      let sort
      if (input.sortBy) {
        // Discern which document field to sort by
        let sortField
        switch (input.sortBy) {
          case 'ALPHABETICALLY':
            sortField = 'name'
            break
          case 'DATE_CREATED':
            sortField = 'dateCreated'
            break
          case 'NUMBER_WINS':
            sortField = 'wins'
            break
        }

        const order = input.sortOrder ? (input.sortOrder === 'INCREASING' ? 'asc' : 'desc') : 'asc'
        sort = { [sortField]: order }
      }

      // Perform search
      let filteredBotIDs
      if (input.search) {
        // ... on bots
        const filteredBots = await Bot.fuzzySearch(input.search)
        filteredBotIDs = filteredBots.map(doc => doc.id)

        // ... on users
        const filteredUsers = await User.fuzzySearch(input.search)
        const filteredUsersBotIDs = filteredUsers.map(doc => doc.createdBots).reduce((a, b) => a.concat(b), [])
        filteredBotIDs = filteredBotIDs.concat(filteredUsersBotIDs)
      }

      // Get bots based on filters
      // Defaults to returning first 10 bots
      const { docs: bots, totalPages, page } = await Bot.paginate(
        {
          ...filter,
          ...(filteredBotIDs ? { _id: { $in: filteredBotIDs } } : {})
        },
        {
          offset: input.offset || 0,
          limit: input.amount || 10,
          sort
        }
      )

      // Resolve props
      const resolvedBots = await bots.map(resolveBot)

      return {
        bots: resolvedBots,
        totalPages,
        currentPage: page
      }
    },
    bot: (_, { id, name }) => findOne(Bot, { _id: id, name }, resolveBot),
    botStatistics
  },
  Mutation: {
    unpublishBot: async (_, { id }, { isAuth, userID }) => {
      // Get bot
      const bot = await ensureOwnBot(id, isAuth, userID)

      // Unpublish
      await unpublish(bot)

      // Set bot to be unpublished
      bot.published = false
      await bot.save()

      // Resolve and return
      return resolveBot(bot)
    },
    publishBot: async (_, { id }, { isAuth, userID }) => {
      // Get bot
      const bot = await ensureOwnBot(id, isAuth, userID)

      // Is it already published?
      if (bot.published) {
        throw new UserInputError(`Bad Input: Bot with id "${id}" is already published`)
      }

      // Is it already schecuduled to be published?
      if (bot.toBePublished) {
        throw new UserInputError(`Bad Input: Bot with id "${id}" is already scheduled to be published`)
      }

      // Mark bot as to publish
      console.log(`Scheduled bot "${bot.name}" to be published`)
      bot.toBePublished = true

      // Save Bot
      await bot.save()

      // Return and resolve
      return resolveBot(bot)
    },
    newBot: async (_, { name, code }, { isAuth, userID }) => {
      // Get my user document
      const me = await getMe(isAuth, userID)

      // Does a bot with this name exist?
      const pre = await Bot.findOne({ name })
      if (pre) {
        throw new UserInputError(`Bad Input: Bot with name "${name}" already exists`)
      }

      // Create the new bot
      const bot = new Bot({ name, code, dateCreated: (new Date()) })
      bot.author = userID

      // Add to user list
      me.createdBots.push(bot.id)
      await me.save()

      // Save bot and resolve query properties
      return bot.save().then(resolveBot)
    },
    removeBot: async (_, { id }, { isAuth, userID }) => {
      // Check auth and that bot is own
      const bot = await ensureOwnBot(id, isAuth, userID)

      // Remove matches that include this bot
      Match.deleteMany({ competitors: { $in: [bot] } })

      // Remove bot then resolve and return old one
      const old = await Bot.findByIdAndDelete(id)
      return resolveBot(old)
    },
    setBot: async (_, { id, name, code }, { isAuth, userID }) => {
      // Check auth and that bot is own
      const bot = await ensureOwnBot(id, isAuth, userID)

      // Are we already published?
      if (bot.published) {
        throw new UserInputError(`Bad Input: Cannot update already published bot with id "${bot.id}"`)
      }

      // Update bot
      bot.name = name
      bot.code = code
      await bot.save()

      // Resolve and return
      return resolveBot(bot)
    }
  }
}

module.exports = botResolvers
