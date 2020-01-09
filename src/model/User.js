const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
  displayName: String,
  email: String,
  dateJoined: { type: Date, default: Date.now }
})

module.exports = mongoose.model('user', User)
