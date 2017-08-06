(function () {
    angular
        .module('ttt')
        .controller('gameLocalController', gameLocalController)

    function gameLocalController(currentUser, gameService, gameHelpers, moveService) {
        var model = this
        model.startGame = startGame
        model.makeMove = makeMove

        init()

        function init() {
            model.grid = 3
            model.rowIndex = gameHelpers.toNumsArray(model.grid)  // [0,1,2,3,...] for iteration in view
            model.colIndex = gameHelpers.toNumsArray(model.grid)
        }

        function startGame(grid) {
            gameHelpers.resetGame(model)
            model.moves = 0

            model.rows = new Array(grid).fill(0)
            model.cols = new Array(grid).fill(0)
            model.dia1 = 0
            model.dia2 = 0

            var game = {
                grid: grid,
                _player1: currentUser._id
            }
            return gameService
                .createGame(game)
                .then(function (game) {
                    model.game = game
                    model.isMyTurn = Math.floor(Math.random() * 2);  // 0 or 1, randomly decides the turn
                    if (!model.isMyTurn) {
                        return gameService
                            .robotMove(game)
                            .then(moved(model))
                    }
                })
        }

        function makeMove(position, isMyTurn) {
            if (isMyTurn && !model.game.result && gameHelpers.moveOnEmptyCell(position)) {
                var move = {
                    position: position,
                    _player: currentUser._id
                }
                return moveService
                    .makeMove(move, model.game.board)
                    .then(moved(model))
                    .then(function (gameResult) {
                        console.log(gameResult)
                        if (model.moves < 9) {
                            return gameService.robotMove(model.game)
                        } else {
                            throw "Already made last move!"
                        }
                    })
                    .then(moved(model))
                    .then(function (gameResult) {
                        console.log(gameResult)
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
            }

        }

        function moved(model) {
            return function (move) {
                var position = move.position
                var cssClass = model.isMyTurn ? 'move-made-X' : 'move-made-O'
                $("td[data-move=" + position + "]").addClass(cssClass)
                model.moves++

                var n = model.grid,
                    i = Math.floor(position/n), j = position % n,
                    val = model.isMyTurn ? 1 : -1

                model.rows[i] += val
                model.cols[j] += val

                if (i === j)      model.dia1 += val
                if (i === n-j-1)  model.dia2 += val

                // Someone wins
                if (Math.abs(model.rows[i]) === n || Math.abs(model.dia1) === n ||
                    Math.abs(model.cols[j]) === n || Math.abs(model.dia2) === n) {
                    model.game.result = model.isMyTurn ? 'You win!' : 'You lose!'
                    var winner = model.isMyTurn ? model.game._player1 : 'robot'
                    return gameService
                        .addWinnerToGame(model.game, winner)
                        .then(function (game) {
                            return model.game.result  // if it is my turn, i win; otherwise, robot wins (i lose)
                        })
                }
                // No empty cells left
                if (model.moves === n * n) {
                    model.game.result = "It's a tie."
                    return gameService
                        .addWinnerToGame(model.game, 'tie')
                        .then(function (game) {
                            return model.game.result
                        })
                }
                model.isMyTurn = !model.isMyTurn
                return 'ongoing'
            }
        }
    }
})()
