var mongoose = require('mongoose')
var gameSchema = require('./game.schema.server')
var userSchema = require('../user/user.schema.server')
var userModel = mongoose.model('user', userSchema)
var gameModel = mongoose.model('game', gameSchema)

gameModel.createGame = createGame

module.exports = gameModel

function createGame(game) {
    return gameModel
        .create(game)
        .then(function (game) {
            userModel.addGamesToPlayer(game._player1, game._id)
            if (game._player2) {
                userModel.addGamesToPlayer(game._player2, game._id)
            }
            return game
        })
}
