var mongoose = require('mongoose')
var boardSchema = require('./board.schema.server')
var boardModel = mongoose.model('board', boardSchema)

boardModel.createBoard = createBoard
boardModel.findBoardById = findBoardById
boardModel.addMoveToBoard = addMoveToBoard

module.exports = boardModel

function createBoard(grid) {
    return boardModel.create({ grid: grid })
}

function findBoardById(boardId) {
    return boardModel.findById(boardId)
}

function addMoveToBoard(boardId, move) {
    return boardModel
        .findById(boardId)
        .then(function (board) {
            board.moves.push(move._id)
            return board.save()
        })
}
