var mongoose = require('mongoose')

var moveSchema = mongoose.Schema({
    dateCreated: {
        type: Date,
        default: Date.now
    },
    _player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    position: Number
})

module.exports = moveSchema
