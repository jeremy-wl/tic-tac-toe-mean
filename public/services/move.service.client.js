(function () {
    angular
        .module("ttt")
        .factory("moveService", function ($location, $http) {
            var api = {}

            api.getAllMovesFromBoard = getAllMovesFromBoard
            api.makeMove = makeMove

            return api

            function makeMove(move, boardId) {
                var url = '/api/boards/' + boardId + '/moves'
                return $http.post(url, move)
                    .then(function (res) {
                        return res.data
                    })
            }

            function getAllMovesFromBoard(boardId) {
                var url = '/api/boards/' + boardId + '/moves'
                return $http.get(url)
                    .then(function (res) {
                        return res.data
                    })
            }
        })
})()
