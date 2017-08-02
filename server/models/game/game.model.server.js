var mongoose = require('mongoose')
var gameSchema = require('./game.schema.server')
var userSchema = require('../user/user.schema.server')
var userModel = mongoose.model('user', userSchema)
var gameModel = mongoose.model('game', gameSchema)

gameModel.createGame = createGame
gameModel.addWinnerToGame = addWinnerToGame

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

function addWinnerToGame(game, winner) {
    return gameModel
        .findById(game._id)
        .then(function (game) {
            game._winner = winner
            return game.save()
        })
}
