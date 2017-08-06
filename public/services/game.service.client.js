(function () {
    angular
        .module("ttt")
        .factory("gameService", function ($location, $http, moveService) {
            var api = {}

            api.findGameById = findGameById
            api.findAllGames = findAllGames
            api.findAllGamesByUser = findAllGamesByUser
            api.createGame = createGame
            api.robotMove = robotMove
            api.addWinnerToGame = addWinnerToGame

            return api

            function createGame(game) {
                var url = '/api/games'
                return $http.post(url, game)
                    .then(function (res) {
                        return res.data
                    })
            }

            function findGameById(gameId) {
                var url = '/api/games/' + gameId
                return $http.get(url)
                    .then(function (res) {
                        return res.data
                    })
            }

            function findAllGamesByUser(userId) {
                var url = '/api/users/' + userId + '/games'
                return $http.get(url)
                    .then(function (res) {
                        return res.data
                    })
            }

            function findAllGames() {
                var url = '/api/games'
                return $http.get(url)
                    .then(function (res) {
                        return res.data
                    })
            }

            function robotMove(game) {
                return moveService
                    .getAllMovesFromBoard(game.board)
                    .then(function (moves) {
                        var movesStr = movesPositionsToString(moves)
                        var url = 'http://tttapi.herokuapp.com/api/v1/' + movesStr + '/O'
                        return $http.get(url)  // {"game":"---------","player":"0","recommendation":2,"strength":-1}
                            .then(function (obj) {
                                var move = {
                                    position: obj.data.recommendation
                                }
                                return moveService
                                    .makeMove(move, game.board)
                                    .then(function (move) {
                                        return move
                                    })
                            })

                    })

                function movesPositionsToString(moves) {
                    // construct moves array for api call
                    var movesArr = ['-','-','-','-','-','-','-','-','-']
                    for (var i in moves) {
                        movesArr[moves[i].position] = moves[i]._player ? 'X' : 'O'
                    }
                    var movesStr = movesArr.reduce(function (res, item) {
                        return res += item
                    }, "")

                    return movesStr
                }
            }

            function addWinnerToGame(game, winner) {
                var url = '/api/games/' + game._id + '/winner/'
                game.winner = winner
                return $http.post(url, game)
                    .then(function (res) {
                        return res.data
                    })
            }
        })
})()
