(function () {
    angular
        .module('ttt')
        .controller('gamesListController', gamesListController)

    function gamesListController(currentUser, gameService, $timeout) {
        var model = this
        model.getGamesInfo = getGamesInfo
        model.user = currentUser

        init()

        function init() {
            getGamesInfo()
        }

        function getGamesInfo() {
            var promise = isAdmin(currentUser) ?
                gameService.findAllGames() :
                gameService.findAllGamesByUser(currentUser._id)
            return promise
                .then(function (games) {
                    games.forEach(function (game) {
                        if      (game._winner === 0)  game.result = 'Ties'
                        else if (game._winner === 3)  game.result = 'Lost'  // lost to robot
                        else {
                            if (game._winner === 1 && currentUser._id === game._player1._id ||
                                game._winner === 2 && currentUser._id === game._player2._id)
                                game.result = 'Wins'
                            else
                                game.result = 'Lost'
                        }
                    })
                    model.games = games
                                            // https://stackoverflow.com/a/22541080/3949193
                    $timeout(function () {  // executes callback after DOM has finished rendering
                        $('td:contains(Wins)').css('color', 'green')
                        $('td:contains(Lost)').css('color', 'red')
                        $('td:contains(Ties)').css('color', 'blue')
                    })
                })
        }

        function isAdmin(user) {
            return user.roles.indexOf('ADMIN') >= 0
        }
    }
})()
