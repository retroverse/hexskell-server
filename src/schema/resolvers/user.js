const Bot = require('../../model/Bot')
const User = require('../../model/User')
const { find, findOne } = require('../../util/findModel')
const { getMe } = require('../auth')

const { resolveUser } = require('./props')

const resolvers = {
  Query: {
    users: _ =>
      find(User, {}, resolveUser),

    user: (_, {id, displayName, dateJoined}) =>
      findOne(User, {_id: id, displayName}, resolveUser),

    me: async (_, args, {isAuth, userID}) => {
      let user = await getMe(isAuth, userID)
      return resolveUser(user)
    }
  },
  Mutation: {
    setUser: async (_, {displayName}, {isAuth, userID}) => {
      // Does user exist?
      let user = await getMe(isAuth, userID)

      // Is it the same name?
      if (user.displayName === displayName) {
        throw Error(`Display name is already "${displayName}"`)
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
