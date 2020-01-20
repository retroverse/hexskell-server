const { UserInputError } = require('apollo-server-express')
const Bot = require('../../model/Bot')
const Match = require('../../model/Match')
const { find, findOne } = require('../../util/findModel')
const { ensureOwnBot, getMe } = require('../auth')
const { resolveBot } = require('./props')
const { performTournament } = require('../../tournament')

const botResolvers = {
  Query: {
    bots: (_, {published}) => find(Bot, {published}, resolveBot),
    bot: (_, {id, name}) => findOne(Bot, {_id: id, name}, resolveBot)
  },
  Mutation: {
    unpublishBot: async (_, {id}, {isAuth, userID}) => {
      // Get bot
      let bot = await ensureOwnBot(id, isAuth, userID)

      // Remove matches that include this bot
      await Match.deleteMany({competitors: {$in: [bot]}})

      // Set bot to be unpublished
      bot.published = false
      await bot.save()

      // Resolve and return
      return resolveBot(bot)
    },
    publishBot: async (_, {id}, {isAuth, userID}) => {
      // Get bot
      let bot = await ensureOwnBot(id, isAuth, userID)

      // Is it already published?
      if (bot.published) {
        throw new UserInputError(`Bad Input: Bot with id "${id}" is already published`)
      }

      // Get already published bots
      let publishedBots = await Bot.find({published: true})

      // Compete bot against every other
      // (THIS WILL TAKE QUITE A WHILE)
      // #TODO: Schedule this for later to prevent hang on request
      console.log(`Starting tournament for ${bot.name}`)
      let matchResults = await performTournament(bot, publishedBots)

      // Save all matches
      let matches = await Promise.all(matchResults.map(async result => {
        // Create and save match document
        let match = new Match({...result})
        return match.save()
      }))

      await Promise.all(matches.map(async match => {
        // Store each match in each bots list of tournament matches
        let competitors = await Bot.find({_id: {$in: match.competitors}})
        await Promise.all(competitors.map(async competitor => {
          competitor.tournamentMatches.push(match)
          await competitor.save()
        }))

        // Award wins if not a tie
        if (match.winningCompetitor) {
          let winningCompetitor = await Bot.findById(match.winningCompetitor)
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
    newBot: async (_, {name, code}, {isAuth, userID}) => {
      // Get my user document
      let me = await getMe(isAuth, userID)

      // Does a bot with this name exist?
      let pre = await Bot.findOne({name})
      if (pre) {
        throw new UserInputError(`Bad Input: Bot with name "${name}" already exists`)
      }

      // Create the new bot
      let bot = new Bot({name, code, dateCreated: (new Date())})
      bot.author = userID

      // Add to user list
      me.createdBots.push(bot.id)
      await me.save()

      // Save bot and resolve query properties
      return bot.save().then(resolveBot)
    },
    removeBot: async (_, {id}, {isAuth, userID}) => {
      // Check auth and that bot is own
      let bot = await ensureOwnBot(id, isAuth, userID)

      // Remove matches that include this bot
      Match.deleteMany({'competitors': {$in: [bot]}})

      // Remove bot then resolve and return old one
      let old = await Bot.findByIdAndDelete(id)
      return resolveBot(old)
    },
    setBot: async (_, {id, name, code}, {isAuth, userID}) => {
      // Check auth and that bot is own
      let bot = await ensureOwnBot(id, isAuth, userID)

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
