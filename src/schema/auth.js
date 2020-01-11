const Bot = require('../model/Bot')
const User = require('../model/User')

const getMe = async (isAuth, userID) => {
  // Must be logged in
  if (!isAuth) {
    throw Error('Unauthenticated')
  }

  // Find me
  let me = await User.findById(userID)
  if (!me) {
    throw Error('Invalid authentication: no such user')
  }

  return me
}

const ensureOwnBot = async (id, isAuth, userID) => {
  let me = await getMe(isAuth, userID)

  // Is bot creator me?
  let bot = await Bot.findById(id)
  if (!bot) {
    throw Error('No such bot')
  }

  // Find bot author
  let author = await User.findById(bot.author)
  if (author.id !== me.id) {
    throw Error('Unauthorized')
  }

  return bot
}

module.exports = { ensureOwnBot }
