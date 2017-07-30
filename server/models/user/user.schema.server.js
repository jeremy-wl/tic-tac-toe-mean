var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
    roles: [{
       type: String,
       default: 'PLAYER',
       enum: ['PLAYER', 'ADMIN', 'ROBOT']
    }],
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String
    },
    firstName: String,
    lastName: String,
    google: {
        id: String,
        token: String
    },
    facebook: {
        id: String,
        token: String
    },
    email: String,
    dateCreated: {
        type: Date,
        default: Date.now
    },
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gameModel'
    }]
})

module.exports = userSchema
