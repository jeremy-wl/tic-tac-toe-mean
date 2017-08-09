var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
    roles: [{
       type: String,
       default: 'PLAYER',
       enum: ['PLAYER', 'ADMIN']
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
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: [validateEmail, 'Please fill in a valid email address'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill in a valid email address.']
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'game'
    }]
})

function validateEmail(email) {
    var re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    return re.test(email)
}

module.exports = userSchema
