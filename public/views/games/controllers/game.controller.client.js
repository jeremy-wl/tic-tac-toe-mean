(function () {
    angular
        .module('ttt')
        .controller('gameController', gameController)

    function gameController() {
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
                model.grid = 3
            }
        }

        function makeMove(move) {
            $("td[data-move=" + move +"]").addClass('move-made')
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
