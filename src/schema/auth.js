const Bot = require('../model/Bot')
const User = require('../model/User')

const {
  AuthenticationError,
  UserInputError,
  ForbiddenError
} = require('apollo-server-express')

const isLoggedIn = async (isAuth) => {
  if (!isAuth) {
    throw new AuthenticationError('Invalid Authentication: must authenticate')
  }
}

const getMe = async (isAuth, userID) => {
  // Must be logged in
  await isLoggedIn(isAuth)

  // Find me
  const me = await User.findById(userID)
  if (!me) {
    throw new AuthenticationError('Invalid Authentication: no such user')
  }

  return me
}

const ensureOwnBot = async (id, isAuth, userID) => {
  const me = await getMe(isAuth, userID)

  // Is bot creator me?
  const bot = await Bot.findById(id)
  if (!bot) {
    throw new UserInputError(`Bad Input: No such bot with id "${id}"`)
  }

  // Find bot author
  const author = await User.findById(bot.author)
  if (author.id !== me.id) {
    throw new ForbiddenError(`Forbidden: Bot with id "${id}" is not owned by user with id "${me.id}"`)
  }

  return bot
}

module.exports = { ensureOwnBot, getMe }
