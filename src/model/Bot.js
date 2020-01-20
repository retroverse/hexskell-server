const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const Bot = new Schema({
  name: String,
  author: { type: ObjectId, ref: 'user' },
  dateCreated: { type: Date, default: Date.now },
  code: String,
  tournamentMatches: [{ type: ObjectId, ref: 'match' }],
  wonTournamentMatches: [{ type: ObjectId, ref: 'match' }],
  published: { type: Boolean, default: false }
})

Bot.virtual('wins').get(async (_, virtual, doc) => {
  const Match = mongoose.model('match')
  const wonMatchIds = doc.wonTournamentMatches || []
  const numWonMatches = await Match.countDocuments({ _id: { $in: wonMatchIds } })
  return numWonMatches
})

module.exports = mongoose.model('bot', Bot)
