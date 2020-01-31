const { UserInputError } = require('apollo-server-express')
const User = require('../../model/User')
const { find, findOne } = require('../../util/findModel')
const { getMe } = require('../auth')
const { resolveUser } = require('./props')
const { userStatistics, calculateUserStatistics } = require('./statistics')

const resolvers = {
  Query: {
    users: _ =>
      find(User, {}, resolveUser),

    user: (_, { id, displayName, dateJoined }) =>
      findOne(User, { _id: id, displayName }, resolveUser),

    userStatistics,

    me: async (_, args, { isAuth, userID }) => {
      const user = await getMe(isAuth, userID)
      return resolveUser(user)
    },

    myStatistics: async (_, args, { isAuth, userID }) => {
      const user = await getMe(isAuth, userID)
      return calculateUserStatistics(user)
    }
  },
  Mutation: {
    setUser: async (_, { displayName }, { isAuth, userID }) => {
      // Does user exist?
      const user = await getMe(isAuth, userID)

      // Is it the same name?
      if (user.displayName === displayName) {
        throw new UserInputError(`Bad Input: Display name is already "${displayName}"`)
      }

      // Is name taken?
      const existing = await User.findOne({ displayName })
      if (existing) {
        throw new UserInputError(`Bad Input: Display name "${displayName}" is taken`)
      }

      // Update user
      user.displayName = displayName
      await user.save()

      // Resolve and return
      return resolveUser(user)
    }
  }
}

module.exports = resolvers
