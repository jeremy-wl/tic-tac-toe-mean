(function () {
    angular
        .module('ttt')
        .controller('gamesListController', gamesListController)

    function gamesListController(currentUser, gameService) {
        var model = this
        model.findAllGamesByUser = findAllGamesByUser


        init()

        function init() {
            findAllGamesByUser()
        }

        function findAllGamesByUser() {
            if (isAdmin(currentUser)) {
                return gameService
                    .findAllGames()
                    .then(function (games) {
                        model.games = games
                    })
            } else {
                return gameService
                    .findAllGamesByUser(currentUser._id)
                    .then(function (games) {
                        model.games = games
                    })
            }
        }

        function isAdmin(user) {
            return user.roles.indexOf('ADMIN') >= 0
        }
    }
})()
