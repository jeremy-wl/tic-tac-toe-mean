(function () {
    angular
        .module('ttt')
        .controller('gamesShowController', gamesShowController)

    function gamesShowController(gameService, userService, gameHelpers, currentUser, $routeParams) {
        var model = this
        model.user = currentUser
        model.findGameById = findGameById
        model.prevMove = prevMove
        model.nextMove = nextMove
        model.logout = userService.logout

        init()

        function init() {
            model.currentMove = 0

            var gameId = $routeParams['gameId']
            findGameById(gameId)

        }

        function findGameById(gameId) {
            return gameService
                .findGameById(gameId)
                .then(function (game) {
                    model.game = game

                    model.grid = model.game.board.grid
                    model.rowIndex = gameHelpers.toNumsArray(model.grid)  // [0,1,2,3,...] for iteration in view
                    model.colIndex = gameHelpers.toNumsArray(model.grid)

                    model.moves = model.game.board.moves
                })
        }

        function prevMove() {
            if (model.currentMove === 0)  return
            var position = model.moves[--model.currentMove].position
            var cssClass = model.currentMove % 2 === 0 ? 'move-made-X' : 'move-made-O'
            $("td[data-move=" + position + "]").removeClass(cssClass)

            // Removing the last system message appended
            $('div.col-md-6 > ul > li:last-child').remove()
            $('div.col-md-6 > ul > li:last-child').addClass('active')
        }

        function nextMove() {
            if (model.currentMove === model.moves.length)  return

            // Appending the current move to the system message
            var xORo = model.currentMove % 2 === 0 ? 'X' : 'O'
            var who = model.moves[model.currentMove]._player === currentUser._id ? ' (You)' : ' (Opponent)'
            var position = model.moves[model.currentMove].position
            var row = Math.floor(position / model.grid) + 1,
                col = Math.floor(position % model.grid) + 1;
            var message = xORo + who + ' made a move at Row ' + (row) + ', Column ' + col
            gameHelpers.appendMessage(message)

            var position = model.moves[model.currentMove].position
            var cssClass = model.currentMove++ % 2 === 0 ? 'move-made-X' : 'move-made-O'
            $("td[data-move=" + position + "]").addClass(cssClass)
        }
    }
})()
