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
            model.rows = toNumsArray(model.grid)
            model.cols = toNumsArray(model.grid)
        }

        function startGame(isLocal, grid) {
            resetGame()
            model.moves = 0
            if (isLocal) {
                grid = 3
            }
            var game = {
                grid: grid,
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
                            .then(function (move) {
                                model.isMyTurn = 1
                                $("td[data-move=" + move.position + "]").addClass('move-made-O')
                                model.moves++
                            })
                    }
                })
        }

        function makeMove(position, isMyTurn) {
            if (isMyTurn && model.moves < 9) {  // TODO: should not make move if wins/loses
                var move = {
                    position: position,
                    _player: currentUser._id
                }
                return moveService
                    .makeMove(move, model.game.board)
                    .then(function (move) {
                        $("td[data-move=" + position + "]").addClass('move-made-X')
                        model.isMyTurn = 0
                        model.moves++
                        // robot move
                        if (model.moves < 9) {
                            return gameService.robotMove(model.game)
                        } else {
                            resolve()
                        }
                    })
                    .then(function (move) {
                        model.isMyTurn = 1
                        model.moves++
                        $("td[data-move=" + move.position + "]").addClass('move-made-O')
                    })
            }
        }

        function toNumsArray(num) {
            return Array.apply(null, {length: num}).map(Number.call, Number)
        }

        function gridChanged(newGrid) {
            if (newGrid < 3 || newGrid > 10) {
                if (newGrid < 3) {
                    newGrid = 3
                } else if (newGrid > 10) {
                    newGrid = 10
                }
                model.message = 'Please enter a number between 3 to 10'
                window.setTimeout(function () {
                    delete model.message
                }, 2000)
            }

            model.rows = toNumsArray(newGrid)
            model.cols = toNumsArray(newGrid)
        }

        function resetGame() {
            $(".move-made-O, .move-made-X").each(function () {
                $(this).removeClass("move-made-O")
                $(this).removeClass("move-made-X")
            })
        }
    }
})()
