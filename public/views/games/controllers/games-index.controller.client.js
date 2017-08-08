(function () {
    angular
        .module('ttt')
        .controller('gamesListController', gamesListController)

    function gamesListController(currentUser, gameService, $routeParams, $location, $timeout) {
        var model = this
        model.getGamesInfo = getGamesInfo
        model.user = currentUser

        init()

        function init() {
            var userId = $routeParams['userId']
            getGamesInfo(userId)
        }

        function getGamesInfo(userId) {
            var promise

            if (isAdmin(currentUser) && !userId) {
                promise = gameService.findAllGames()
            } else {
                if (!userId)  userId = currentUser._id
                promise = gameService.findAllGamesByUser(userId)
            }

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
                .catch(function (err) {
                    console.log(err)
                    $location.url('/')
                })
        }

        function isAdmin(user) {
            return user.roles.indexOf('ADMIN') >= 0
        }
    }
})()
