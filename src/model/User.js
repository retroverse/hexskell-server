const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const User = new Schema({
  displayName: String,
  googleID: String,
  dateJoined: { type: Date, default: Date.now },
  createdBots: [{ type: ObjectId, ref: 'bot' }],
  avatarURL: String
})

module.exports = mongoose.model('user', User)
