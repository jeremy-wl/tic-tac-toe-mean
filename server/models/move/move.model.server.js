var mongoose = require('mongoose')
var moveSchema = require('./move.schema.server')
var boardSchema = require('../board/board.schema.server')
var moveModel = mongoose.model('move', moveSchema)
var boardModel = mongoose.model('board', boardSchema)

moveModel.getAllMovesFromBoard = getAllMovesFromBoard
moveModel.createMove = createMove

module.exports = moveModel

function createMove(boardId, move) {
    var res
    return moveModel
        .create(move)
        .then(function (move) {
            res = move
            return boardModel.addMoveToBoard(boardId, move)
        })
        .then(function (board) {
            return res
        })
}

function getAllMovesFromBoard(boardId) {
    return boardModel
        .findById(boardId)
        .populate('moves')
        .exec(function (err, board) {
            return board
        })
}
