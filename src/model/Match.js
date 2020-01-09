const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const Round = new Schema({
  redPlayer: {type: ObjectId, ref: 'bot'},
  bluePlayer: {type: ObjectId, ref: 'bot'},
  winner: {type: String, lowercase: true, enum: ['red', 'blue']}, // Bot Id (one of the two above)
  terminalState: {
    pieces: {
      red: [{x: Number, y: Number}],
      blue: [{x: Number, y: Number}]
    }
  }
})

const Match = new Schema({
  homeCompetitor: {type: ObjectId, ref: 'bot'},
  awayCompetitor: {type: ObjectId, ref: 'bot'},
  rounds: [Round]
})

module.exports = mongoose.model('match', Match)
