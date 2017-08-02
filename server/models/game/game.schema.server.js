var mongoose = require('mongoose')

var gameSchema = mongoose.Schema({
    dateCreated: {
        type: Date,
        default: Date.now
    },
    _player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    _player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    _winner: String,                            // if robot wins, _winner = 'robot'
    board: {                                    // if it's a tie, _winner = 'tie'
        type: mongoose.Schema.Types.ObjectId,   // otherwise, _winner = the string representation of the playerId
        ref: 'boardModel'
    }
})

module.exports = gameSchema
