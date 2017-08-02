(function () {
    angular
        .module("ttt")
        .factory("gameHelpers", function () {
            var api = {}

            api.toNumsArray = toNumsArray
            api.resetGame = resetGame
            api.isValidMove = isValidMove
            api.showMessage = showMessage

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

            function isValidMove(position) {
                var $cell = $("td[data-move=" + position + "]")
                return !$cell.hasClass('move-made-X') && !$cell.hasClass('move-made-O')
            }

            function showMessage(model, message) {
                model.message = message
                window.setTimeout(function () {
                    delete model.message
                }, 2000)
            }
        })
})()
