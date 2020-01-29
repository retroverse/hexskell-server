const { UserInputError } = require('apollo-server-express')
const Fuse = require('fuse.js')
const Bot = require('../../model/Bot')
const Match = require('../../model/Match')
const { find, findOne } = require('../../util/findModel')
const { ensureOwnBot, getMe } = require('../auth')
const { resolveBot } = require('./props')
const { performTournament } = require('../../tournament')

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

      // Get bots based on filters
      // Defaults to returning first 10 bots
      const { docs: bots, totalPages, page } = await Bot.paginate(
        filter,
        {
          offset: input.offset || 0,
          limit: input.amount || 10,
          sort
        }
      )

      // Perform fuzzy search with fuse.js
      let finalBots = bots
      if (input.search) {
        const fuse = new Fuse(bots, {
          threshold: 0.6,
          sort: !input.sortBy,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: [
            'name'
          ]
        }) // "list" is the item array
        finalBots = fuse.search(input.search)
      }

      // Resolve props
      const resolvedBots = await finalBots.map(resolveBot)

      return {
        bots: resolvedBots,
        totalPages,
        currentPage: page
      }
    },
    bot: (_, { id, name }) => findOne(Bot, { _id: id, name }, resolveBot)
  },
  Mutation: {
    unpublishBot: async (_, { id }, { isAuth, userID }) => {
      // Get bot
      const bot = await ensureOwnBot(id, isAuth, userID)

      // Remove matches that include this bot
      await Match.deleteMany({ competitors: { $in: [bot] } })

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

      // Get already published bots
      const publishedBots = await Bot.find({ published: true })

      // Compete bot against every other
      // (THIS WILL TAKE QUITE A WHILE)
      // #TODO: Schedule this for later to prevent hang on request
      console.log(`Starting tournament for ${bot.name}`)
      const matchResults = await performTournament(bot, publishedBots)

      // Save all matches
      const matches = await Promise.all(matchResults.map(async result => {
        // Create and save match document
        const match = new Match({ ...result })
        return match.save()
      }))

      await Promise.all(matches.map(async match => {
        // Store each match in each bots list of tournament matches
        const competitors = await Bot.find({ _id: { $in: match.competitors } })
        await Promise.all(competitors.map(async competitor => {
          competitor.tournamentMatches.push(match)
          await competitor.save()
        }))

        // Award wins if not a tie
        if (match.winningCompetitor) {
          const winningCompetitor = await Bot.findById(match.winningCompetitor)
          console.log(`Awarded a win to ${winningCompetitor.name}`)
          winningCompetitor.wonTournamentMatches.push(match)
          await winningCompetitor.save()
        }
      }))

      // Mark bot as published
      bot.published = true

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
