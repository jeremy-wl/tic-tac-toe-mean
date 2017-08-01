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
                            .then(moved(model))
                    }
                })
        }

        function makeMove(position, isMyTurn) {
            if (isMyTurn && isValidMove(position)) {  // TODO: should not make move if wins/loses
                var move = {
                    position: position,
                    _player: currentUser._id
                }
                return moveService
                    .makeMove(move, model.game.board)
                    .then(moved(model))
                    .then(function () {
                        if (model.moves < 9) {
                            return gameService.robotMove(model.game)
                        } else {
                            throw "Already made last move!"
                        }
                    })
                    .then(moved(model))
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
                var cssClass = model.isMyTurn ? 'move-made-X' : 'move-made-O'
                $("td[data-move=" + move.position + "]").addClass(cssClass)
                model.isMyTurn = !model.isMyTurn
                model.moves++
            }
        }
    }
})()
