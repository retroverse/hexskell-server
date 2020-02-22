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
  message: String,
  player: { type: String, lowercase: true, enum: ['red', 'blue'] },
  round: Number
})

const BotLogs = new Schema({
  bot: { type: ObjectId, ref: 'bot' },
  message: String,
  player: { type: String, lowercase: true, enum: ['red', 'blue'] },
  round: Number,
  turn: Number,
  logNumber: Number, // Which log in the given turn this is, can be used to sort for chronological order
})


const Match = new Schema({
  competitors: [{ type: ObjectId, ref: 'bot' }],
  rounds: [Round],
  botErrors: [BotError],
  botLogs: [BotLogs],
  winningCompetitor: { type: ObjectId, ref: 'bot' }
})

module.exports = mongoose.model('match', Match)
