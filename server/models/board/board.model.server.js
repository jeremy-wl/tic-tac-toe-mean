var mongoose = require('mongoose')
var boardSchema = require('./board.schema.server')
var boardModel = mongoose.model('board', boardSchema)

boardModel.createBoard = createBoard

module.exports = boardModel

function createBoard(grid) {
    return boardModel.create({ grid: grid })
}
