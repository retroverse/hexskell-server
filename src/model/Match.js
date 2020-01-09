const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const BoardState = new Schema({
  pieces: {
    red: [{x: Number, y: Number}],
    blue: [{x: Number, y: Number}]
  }
})

const Round = new Schema({
  redPlayer: ObjectId, // Bot Id
  bluePlayer: ObjectId, // Bot Id
  winner: {type: String, lowercase: true, enum: ['red', 'blue']}, // Bot Id (one of the two above)
  terminalState: BoardState
})

const Match = new Schema({
  homeCompetitor: ObjectId, // bot Id
  awayCompetitor: ObjectId, // bot Id
  rounds: [Round]
})

module.exports = mongoose.model('match', Match)
