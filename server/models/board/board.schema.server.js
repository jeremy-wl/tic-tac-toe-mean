var mongoose = require('mongoose')

var boardSchema = mongoose.Schema({
    dateCreated: {
        type: Date,
        default: Date.now
    },
    grid: Number,
    moves: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'move'
    }]
})

module.exports = boardSchema
