(function () {
    angular
        .module("ttt")
        .factory("moveService", function ($location, $http) {
            var api = {}

            api.makeMove = makeMove

            return api

            function makeMove(move, game) {
                var url = '/api/boards/' + game.board + '/moves'
                return $http.post(url, move)
                    .then(function (res) {
                        return res.data
                    })
            }

        })
})()
