var mongoose = require('mongoose')
var gameSchema = require('./game.schema.server')
var gameModel = mongoose.model('game', gameSchema)

gameModel.createGame = createGame

module.exports = gameModel

function createGame(game) {
    return gameModel.create(game)
}
