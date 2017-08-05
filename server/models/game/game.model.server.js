var mongoose = require('mongoose')
var gameSchema = require('./game.schema.server')
var userSchema = require('../user/user.schema.server')
var userModel = mongoose.model('user', userSchema)
var gameModel = mongoose.model('game', gameSchema)

gameModel.createGame = createGame
gameModel.addWinnerToGame = addWinnerToGame

module.exports = gameModel

function createGame(game) {
    var gameObj
    return gameModel
        .create(game)
        .then(function (game) {
            gameObj = game
            return userModel.addGamesToPlayer(gameObj._player1, gameObj._id)
        })
        .then(function () {
            if (gameObj._player2) {
                return userModel.addGamesToPlayer(gameObj._player2, gameObj._id)
            }
        })
        .then(function () {
            return gameObj
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
