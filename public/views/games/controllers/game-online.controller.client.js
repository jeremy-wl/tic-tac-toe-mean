(function () {
    angular
        .module('ttt')
        .controller('gameOnlineController', gameOnlineController)

    function gameOnlineController(currentUser, gameService, gameHelpers, moveService, socket) {
        var model = this
        model.createRoom = createRoom
        model.joinRoom = joinRoom
        model.startGame = startGame
        model.makeMove = makeMove
        model.afterMove = afterMove
        model.gridChanged = gridChanged

        init()

        function init() {
            model.shared = {
                grid: 3,
                players: []
            }

            // window.onbeforeunload = function(event) {
            //     return confirm("Confirm refresh")
            // };

            // $scope.$on('$routeChangeStart', function(event, next, current) {
            //     confirm('Are you sure to leave the page?') ? 1 : event.preventDefault()
            // })


            socket.on('join room', function (username) {  // 2nd player joins, 1st player creates game
                console.log(username + ' joins the room')
                if (username !== currentUser.username) {

                    var _player2 = username

                    var game = {
                        grid: model.shared.grid,
                        _player1: currentUser.username,
                        _player2: _player2
                    }

                    return gameService
                        .createGame(game)
                        .then(function (game) {
                            model.shared.game = game
                            console.log('sharing share initial data')
                            socket.emit('share initial data', model.shared)
                            model.isMyTurn = 1
                        })

                } else {
                    model.isMyTurn = 0  // second person gets the second turn
                }
            })
            socket.on('share initial data', function (data) {
                model.shared = data
                model.gridChanged(data.grid)

                // model.shared.game = data.game
                startGame(model.shared.grid)

                console.log('synced initialized data')

            })

            socket.on('move made', afterMove(model))
        }

        function startGame(grid) {
            gameHelpers.resetGame()
            model.moves = 0

            model.rows = new Array(grid).fill(0)
            model.cols = new Array(grid).fill(0)
            model.dia1 = 0
            model.dia2 = 0
        }

        function createRoom() {
            socket.emit('create room', currentUser.username)
        }

        function joinRoom() {
            socket.emit('join room', currentUser.username)
        }


        /**
         * After a user make a move,
         * 0. check if it is a valid move
         * 1. insert the move in db
         * 2. check if the game ends (the current user wins / the game ties) after this move
         *    - if so
         *      * insert the winner (playerId / 'tie') in db for this game
         *      * set model.result accordingly
         *    - otherwise
         * 3. socket emit
         *    - move
         *    - gameResult (if game end)
         */
        function makeMove(position, isMyTurn) {
            if (isMyTurn && !model.result && gameHelpers.isValidMove(position)) {
                var move = {
                    position: position,
                    _player: currentUser._id
                }
                return moveService
                    .makeMove(move, model.shared.game.board)
                    .then(function (move) {  // TODO: check anyone wins
                        var winner = gameHelpers.checkWinner(model, move, currentUser)
                        if (winner) {
                            return gameService
                                .addWinnerToGame(model.shared.game, winner)
                                .then(function (game) {
                                    move.winner = winner
                                    return move
                                })

                        } else {
                            return move
                        }
                    })
                    .then(function (move) {
                        socket.emit('move made', move)
                    })
            }
        }

        function afterMove(model) {
            return function (move) {
                model.moves++

                var winner = move.winner

                if (winner) {
                    if (winner !== 'tie') model.result = move.winner === currentUser._id ? 'You win :)' : 'You lose :('
                    else                  model.result = "It's a tie."
                }

                var position = move.position
                var cssClass = move._player === model.shared.game._player1 ? 'move-made-X' : 'move-made-O'
                $("td[data-move=" + position + "]").addClass(cssClass)

                model.isMyTurn = !model.isMyTurn
                console.log(!model.result ? 'ongoing' : model.result)
            }
        }

        function gridChanged(newGrid) {
            if (!Number.isInteger(newGrid) || newGrid < 3 || newGrid > 10) {
                if (Number.isInteger(newGrid) && newGrid > 10) {
                    newGrid = 10
                } else {
                    newGrid = 3
                }
            }
            model.rowIndex = gameHelpers.toNumsArray(newGrid)
            model.colIndex = gameHelpers.toNumsArray(newGrid)
        }
    }
})()
