const Bot = require('../../model/Bot')
const User = require('../../model/User')
const { find, findOne } = require('../../util/findModel')

const { resolveUser } = require('./props')

const resolvers = {
  Query: {
    users: _ =>
      find(User, {}, resolveUser),

    user: (_, {id, displayName, dateJoined}) =>
      findOne(User, {_id: id, displayName}, resolveUser)
  },
  Mutation: {
    // #TODO: Do Registration stuff here e.g check if name is taken or email is already registered
    newUser: (_, {displayName, email}) =>
      (new User({displayName, email, dateJoined: (new Date())})).save().then(resolveUser),

    // #TODO: Also remove all of their bots and therefore matches
    removeUser: (_, {id}) =>
      User.findByIdAndDelete(id).then(resolveUser),

    // #TODO: Ensure new name isnt taken
    setUser: (_, {id, displayName}) =>
      Bot.findByIdAndUpdate(id, {displayName}, {omitUndefined: true}).then(resolveUser)
  }
}

module.exports = resolvers
