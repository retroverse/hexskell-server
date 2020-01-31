const mongoose = require('mongoose')
const paginate = require('mongoose-paginate-v2')
const fuzzy = require('mongoose-fuzzy-searching')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const Bot = new Schema({
  name: String,
  author: { type: ObjectId, ref: 'user' },
  dateCreated: { type: Date, default: Date.now },
  code: String,
  tournamentMatches: [{ type: ObjectId, ref: 'match' }],
  wonTournamentMatches: [{ type: ObjectId, ref: 'match' }],
  tiedTournamentMatches: [{ type: ObjectId, ref: 'match' }],
  approxNumWins: { type: Number, default: 0 }, // Not necessarily up to date, (use .wins async virtual for accuracy), used for sorting
  published: { type: Boolean, default: false },
  toBePublished: { type: Boolean, default: false }
})

// Keep approximate track of number of wins (for sorting purposes only)
Bot.pre('save', async function () {
  const Match = mongoose.model('match')
  const wonMatchIds = this.wonTournamentMatches || []
  const numWonMatches = await Match.countDocuments({ _id: { $in: wonMatchIds } })
  this.approxNumWins = numWonMatches
})

Bot.virtual('wins').get(async (_, virtual, doc) => {
  const Match = mongoose.model('match')
  const wonMatchIds = doc.wonTournamentMatches || []
  const numWonMatches = await Match.countDocuments({ _id: { $in: wonMatchIds } })
  return numWonMatches
})

Bot.virtual('ties').get(async (_, virtual, doc) => {
  const Match = mongoose.model('match')
  const tiedMatchIds = doc.tiedTournamentMatches || []
  const numTiedMatches = await Match.countDocuments({ _id: { $in: tiedMatchIds } })
  return numTiedMatches
})

// Use mongoose pagination
Bot.plugin(paginate)
Bot.plugin(fuzzy, { fields: ['name'] })

module.exports = mongoose.model('bot', Bot)
