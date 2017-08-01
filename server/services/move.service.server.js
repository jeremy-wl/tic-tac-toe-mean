var app = require('../../express')
var moveModel = require('../models/move/move.model.server')

app.get   ('/api/boards/:boardId/moves', getAllMovesFromBoard)
app.post  ('/api/boards/:boardId/moves', createMove)

function createMove(req, res) {
    var boardId = req.params['boardId']
    var move = req.body
    return moveModel
        .createMove(boardId, move)
        .then(function (move) {
            res.json(move)
        })
}

function getAllMovesFromBoard(req, res) {
    var boardId = req.params['boardId']
    return moveModel
        .getAllMovesFromBoard(boardId)
        .then(function (board) {
            res.json(board.moves)
        }, function (err) {
            console.log(err)
        })
}
