var app = require('../../express')
var boardModel = require('../models/board/board.model.server')
var gameModel = require('../models/game/game.model.server')
var userModel = require('../models/user/user.model.server')

app.get   ('/api/users/:userId/games', isAuthorizedUser, findAllGamesByUser)
app.get  ('/api/games/:gameId', findGameById)
app.get  ('/api/games', isAuthorizedUser, findAllGames)
app.post  ('/api/games', createGame)
app.post  ('/api/games/:gameId/winner', addWinnerToGame)

function createGame(req, res) {
    var obj = req.body
    return boardModel
        .createBoard(obj.grid)
        .then(function (board) {
            var game = {
                _player1: obj._player1,
                _player2: obj._player2,
                board: board._id
            }
            return gameModel.createGame(game)
        }, function (obj) {
            console.log(obj)
        })
        .then(function (game) {
            res.json(game)
        })
}

function findGameById(req, res) {
    var gameId = req.params['gameId']
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
        .then(function (game) {
            res.json(game)
        })
}

function findAllGames(req, res) {
    return gameModel
        .find()
        .populate({
            path: '_player1 _player2 board'
        })
        .exec(function (err, games) {
            res.json(games)
        })
}

function findAllGamesByUser(req, res) {
    var userId = req.params['userId']
    return userModel
        .findById(userId)
        .populate({
            path: 'games',
            model: 'game',
            populate: {
                path: '_player1 _player2 board',
            }
        })
        .exec(function (err, user) {
            res.json(user.games)
        })
}

function addWinnerToGame(req, res) {
    var game = req.body,
        winner = game.winner
    return gameModel
        .addWinnerToGame(game, winner)
        .then(function (game) {
            res.json(game)
        })
}

function isAuthorizedUser(req, res, next) {
    if (req.isAuthenticated() &&
       (req.user.roles.indexOf('ADMIN') >= 0 || req.user._id.toString() === req.params['userId'])) {
        next()
    } else {
        res.sendStatus(401)
    }
}
