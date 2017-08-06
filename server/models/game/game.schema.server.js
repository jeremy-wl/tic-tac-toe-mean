var mongoose = require('mongoose')

var gameSchema = mongoose.Schema({
    dateCreated: {
        type: Date,
        default: Date.now
    },
    _player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    _player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    _winner: {                     //   in a local game, if             in an online game, if
        type: Number,              // - I (player1) wins: winner = 1   - player1 wins: winner = 1
        enum: [0,1,2,3]  // - robot       wins: winner = 3   - player2 wins: winner = 2
    },                             // - ties:             winner = 0   - ties:         winner = 0
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board'
    }
})

module.exports = gameSchema
