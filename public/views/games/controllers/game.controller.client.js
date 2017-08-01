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
            if (isLocal) {
                grid = 3
            }
            var game = {
                grid: grid,
                playerId: currentUser._id
            }
            gameService
                .createGame(game)
                .then(function (game) {
                    model.game = game
                    model.isMyTurn = Math.floor(Math.random() * 2);  // 0 or 1, randomly decides the turn
                })
        }

        function makeMove(position, isMyTurn) {
            if (isMyTurn) {
                var move = {
                    position: position,
                    _player: currentUser._id
                }
                moveService
                    .makeMove(move, model.game)
                    .then(function (move) {
                        $("td[data-move=" + position + "]").addClass('move-made')
                        model.isMyTurn = 0
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
    }
})()
