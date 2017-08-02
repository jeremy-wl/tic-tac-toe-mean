var app = require('../../express')
var boardModel = require('../models/board/board.model.server')
var gameModel = require('../models/game/game.model.server')

app.post  ('/api/games', createGame)
app.post  ('/api/games/:gameId/winner', addWinnerToGame)

function createGame(req, res) {
    var obj = req.body
    return boardModel
        .createBoard(obj.grid)
        .then(function (board) {
            var game = {
                _player1: obj.playerId,
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

function addWinnerToGame(req, res) {
    var game = req.body,
        winner = game.winner
    return gameModel
        .addWinnerToGame(game, winner)
        .then(function (game) {
            res.json(game)
        })
}
