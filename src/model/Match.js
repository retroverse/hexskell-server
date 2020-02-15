const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const Round = new Schema({
  players: { red: { type: ObjectId, ref: 'bot' }, blue: { type: ObjectId, ref: 'bot' } },
  winner: { type: String, lowercase: true, enum: ['red', 'blue'] }, // Bot Id (one of the two above)
  terminalState: { type: String } // JSON STRING of format {red: [[x, y]], blue: [[x, y]]}
})

const BotError = new Schema({
  bot: { type: ObjectId, ref: 'bot' },
  message: String
})

const Match = new Schema({
  competitors: [{ type: ObjectId, ref: 'bot' }],
  rounds: [Round],
  botErrors: [BotError],
  winningCompetitor: { type: ObjectId, ref: 'bot' }
})

module.exports = mongoose.model('match', Match)
