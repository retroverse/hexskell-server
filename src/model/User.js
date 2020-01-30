const mongoose = require('mongoose')
const fuzzy = require('mongoose-fuzzy-searching')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const User = new Schema({
  displayName: String,
  googleID: String,
  dateJoined: { type: Date, default: Date.now },
  createdBots: [{ type: ObjectId, ref: 'bot' }],
  avatarURL: String
})

// Add fuzzy seraching plugin
User.plugin(fuzzy, { fields: ['displayName'] })

module.exports = mongoose.model('user', User)
