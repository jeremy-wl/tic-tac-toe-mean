(function () {
    angular
        .module("ttt")
        .factory("gameService", function ($location, $http, currentUser) {
            var api = {}

            api.createGame = createGame

            return api

            function createGame(isSingle, grid) {
                var game = {
                    isSingle: isSingle,
                    grid: grid,
                    player1: currentUser._id
                }
                var url = '/api/games'
                return $http.post(url, game)
                    .then(function (res) {
                        return res.data
                    })
            }

        })
})()
