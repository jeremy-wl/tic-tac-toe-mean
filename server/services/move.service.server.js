var app = require('../../express')
var moveModel = require('../models/move/move.model.server')

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
