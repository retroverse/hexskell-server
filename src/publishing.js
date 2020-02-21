const Bot = require('./model/Bot')
const Match = require('./model/Match')
const { performTournament } = require('./tournament')

const sequence = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))

const beginPublishChecks = (interval) => {
  const f = () => {
    performPublishCheck()
      .then(() => setTimeout(f, interval))
  }
  f()
}

const performPublishCheck = async () => {
  const botsToBePublished = await Bot.find({ toBePublished: true })
  if (botsToBePublished.length > 0) { console.log(`Found ${botsToBePublished.length} bots to be published`) }
  await sequence(botsToBePublished.map(bot => _ => publish(bot))) // Bit of magic here to make them go in sequence
}

const unpublish = async (bot) => {
  // Remove matches that include this bot
  const { deletedCount } = await Match.deleteMany({ competitors: { $in: [bot] } })
  console.log(`Deleted (${deletedCount}) matches where '${bot.name}' was a competitor`)
}

const publish = async (bot) => {
  // Get already published bots
  const publishedBots = await Bot.find({ published: true })

  // Compete bot against every other (may take a while)
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
      // Add to list of matches
      competitor.tournamentMatches.push(match)

      // Add to list of tied matches?
      if (!match.winningCompetitor) {
        competitor.tiedTournamentMatches.push(match)
      }

      await competitor.save()
    }))

    // Award wins if not a tie
    if (match.winningCompetitor) {
      // Get winning competitor
      const winningCompetitor = await Bot.findById(match.winningCompetitor)

      // Add match to list of won matches
      console.log(`Awarded a win to ${winningCompetitor.name}`)
      winningCompetitor.wonTournamentMatches.push(match)

      // Save competitor
      await winningCompetitor.save()
    }
  }))

  // Save bot
  bot.published = true
  bot.toBePublished = false
  await bot.save()

  console.log('Tournament complete - bot saved')
}

module.exports = {
  publish,
  unpublish,
  performPublishCheck,
  beginPublishChecks
}
