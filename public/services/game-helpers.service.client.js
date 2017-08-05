(function () {
    angular
        .module("ttt")
        .factory("gameHelpers", function () {
            var api = {}

            api.toNumsArray = toNumsArray
            api.resetGame = resetGame
            api.gameInProgress = gameInProgress
            api.moveOnEmptyCell = moveOnEmptyCell
            api.showMessage = showMessage
            api.getOpponentId = getOpponentId
            api.checkWinner = checkWinner

            return api


            function toNumsArray(num) {
                return Array.apply(null, {length: num}).map(Number.call, Number)
            }

            function resetGame() {
                $(".move-made-O, .move-made-X").each(function () {
                    $(this).removeClass("move-made-O")
                    $(this).removeClass("move-made-X")
                })
            }

            function gameInProgress(model) {
                return model.shared.game && !model.result
            }

            function moveOnEmptyCell(position) {
                var $cell = $("td[data-move=" + position + "]")
                return !$cell.hasClass('move-made-X') && !$cell.hasClass('move-made-O')
            }

            function showMessage(model, message) {
                model.message = message
                window.setTimeout(function () {
                    delete model.message
                }, 2000)
            }

            function getOpponentId(game, currentUserId) {
                return game._player1 === currentUserId ? game._player2 : game._player1
            }

            function checkWinner(model, move, currentUser) {
                var n = model.shared.grid,
                    i = Math.floor(move.position/n), j = move.position % n,
                    val = model.isMyTurn ? 1 : -1

                model.rows[i] += val
                model.cols[j] += val

                if (i === j)      model.dia1 += val
                if (i === n-j-1)  model.dia2 += val

                // Someone wins

                var winner

                if (Math.abs(model.rows[i]) === n || Math.abs(model.dia1) === n ||
                    Math.abs(model.cols[j]) === n || Math.abs(model.dia2) === n) {
                    var opponentId = getOpponentId(model.shared.game, currentUser._id)
                    winner = model.isMyTurn ? currentUser._id : opponentId
                }
                // No empty cells left
                else if (model.moves === n * n - 1) {  // total moves becomes n² after this move
                    winner = 'tie'
                }

                return winner
            }

        })
})()
