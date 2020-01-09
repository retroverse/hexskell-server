const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const Bot = new Schema({
  name: String,
  author: {type: ObjectId, ref: 'user'},
  dateCreated: { type: Date, default: Date.now },
  code: String,
  homeMatches: [{type: ObjectId, ref: 'match'}],
  awayMatches: [{type: ObjectId, ref: 'match'}]
})

module.exports = mongoose.model('bot', Bot)
