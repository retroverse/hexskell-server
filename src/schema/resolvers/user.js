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
      findOne(User, {_id: id, displayName}, resolveUser)
  },
  Mutation: {
    newUser: async (_, {displayName, email}) => {
      // Is email already registered?
      let usersWithEmail = await User.find({email})
      if (usersWithEmail.length > 0) {
        throw Error(`Email "${email}" is already registered`)
      }

      // Is display name taken?
      let usersWithName = await User.find({displayName})
      if (usersWithName.length > 0) {
        throw Error(`Display name "${displayName}" is unavailable`)
      }

      // Create user
      let user = new User({
        displayName,
        email,
        dateJoined: (new Date())
      })

      // Save user
      await user.save()

      // Resolve and return
      return resolveUser(user)
    },

    setUser: async (_, {displayName}, {isAuth, userID}) => {
      // Does user exist?
      let user = await getMe(isAuth, userID)

      // Is it the same name?
      if (user.displayName === displayName) {
        throw Error(`Display name is already "${displayName}"`)
      }

      // Is name already taken?
      let usersWithName = await User.find({displayName})
      if (usersWithName.length > 0) {
        throw Error(`Display name "${displayName}" is unavailable`)
      }

      // Update user
      let updatedUser = await Bot.findByIdAndUpdate(userID, {displayName}, {omitUndefined: true})

      // Resolve an dreturn
      return resolveUser(updatedUser)
    }
  }
}

module.exports = resolvers
