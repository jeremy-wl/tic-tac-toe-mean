(function () {
    angular
        .module("ttt")
        .factory("gameService", function ($location, $http) {
            var api = {}

            api.createGame = createGame

            return api

            function createGame(game) {
                var url = '/api/games'
                return $http.post(url, game)
                    .then(function (res) {
                        return res.data
                    })
            }

        })
})()
