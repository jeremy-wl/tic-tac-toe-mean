var mongoose = require('mongoose')
var gameSchema = require('./game.schema.server')
var userSchema = require('../user/user.schema.server')
var moveSchema = require('../move/move.schema.server')
var userModel = mongoose.model('user', userSchema)
var gameModel = mongoose.model('game', gameSchema)
var moveModel = mongoose.model('move', moveSchema)

gameModel.createGame = createGame
gameModel.findGameById = findGameById
gameModel.findAllGames = findAllGames
gameModel.findAllGamesByUser = findAllGamesByUser
gameModel.removeGame = removeGame
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

function findGameById(gameId) {
    return gameModel
        .findById(gameId)
        .populate({
            path: 'board',
            model: 'board',
            populate: {
                path: 'moves',
                model: 'move'
            }
        })
        .exec(function (err, game) {
            return game
        })
}

function findAllGames() {
    return gameModel
        .find()
        .populate({
            path: '_player1 _player2 board'
        })
        .exec(function (err, games) {
            return games
        })
}

function findAllGamesByUser(userId) {
    return userModel
        .findById(userId)
        .populate({
            path: 'games',
            model: 'game',
            populate: {
                path: '_player1 _player2 board',
            }
        })
        .exec()
        .then(function (user) {
            return user.games
        })
}

function removeGame(gameId) {
    var game, board, moves, player1, player2

    return gameModel
        .findById(gameId)
        .populate('board')
        .then(function (gameObj) {
            game = gameObj
            board = game.board
            moves = board.moves
            player1 = game._player1
            player2 = game._player2
            return moveModel       // 1. removing all moves object
                .remove({_id: { $in: moves }})
        })
        .then(function () {
            return board.remove()  // 2. removing the board of the game
        })
        .then(function () {
            return userModel.removeGameFromUser(player1, gameId)
        })                         // 3. removing this game from player1.games
        .then(function () {
            if (player2) {  // there is no player2 for a local game
                return userModel.removeGameFromUser(player2, gameId)
            }                      // 4. removing this game from player2.games
        })
        .then(function () {
            return game.remove()   // 5. finally, removing the game object
        })                         //    after all of its sub-docs are removed
        .catch(function (err) {
            console.log(err)
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
