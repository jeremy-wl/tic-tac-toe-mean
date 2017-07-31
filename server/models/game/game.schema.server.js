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
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'boardModel'
    }
})

module.exports = gameSchema
