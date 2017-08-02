(function () {
    angular
        .module('ttt')
        .controller('gameController', gameController)

    function gameController(currentUser, gameService, moveService) {
        var model = this
        model.startGame = startGame
        model.makeMove = makeMove
        model.gridChanged = gridChanged
        init()

        function init() {
            model.grid = 3
            model.rowIndex = toNumsArray(model.grid)  // [0,1,2,3,...] for iteration in view
            model.colIndex = toNumsArray(model.grid)
        }

        function startGame(isLocal) {
            resetGame()
            model.moves = 0
            if (isLocal)  model.grid = 3

            model.rows = new Array(model.grid).fill(0)
            model.cols = new Array(model.grid).fill(0)
            model.dia1 = 0
            model.dia2 = 0

            var game = {
                grid: model.grid,
                playerId: currentUser._id
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
            if (isMyTurn && !model.game.result && isValidMove(position)) {
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

            function isValidMove(position) {
                var $cell = $("td[data-move=" + position + "]")
                return !$cell.hasClass('move-made-X') && !$cell.hasClass('move-made-O')
            }
        }

        function toNumsArray(num) {
            return Array.apply(null, {length: num}).map(Number.call, Number)
        }

        function gridChanged(newGrid) {
            if (!Number.isInteger(newGrid) || newGrid < 3 || newGrid > 10) {
                if (Number.isInteger(newGrid) && newGrid > 10) {
                    newGrid = 10
                } else {
                    newGrid = 3
                }
                showMessage(model, 'Please enter a number between 3 to 10')
            }

            model.rowIndex = toNumsArray(newGrid)
            model.colIndex = toNumsArray(newGrid)
        }

        function showMessage(model, message) {
            model.message = message
            window.setTimeout(function () {
                delete model.message
            }, 2000)
        }

        function resetGame() {
            $(".move-made-O, .move-made-X").each(function () {
                $(this).removeClass("move-made-O")
                $(this).removeClass("move-made-X")
            })
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
