const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const Bot = new Schema({
  name: String,
  authorUser: ObjectId, // User Id
  dateCreated: { type: Date, default: Date.now },
  code: String,
  homeMatches: [ObjectId], // Match Id
  awayMatches: [ObjectId] // Match Id
})

module.exports = mongoose.model('bot', Bot)
