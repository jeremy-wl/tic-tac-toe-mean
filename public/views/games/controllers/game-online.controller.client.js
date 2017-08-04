(function () {
    angular
        .module('ttt')
        .controller('gameOnlineController', gameOnlineController)

    function gameOnlineController(currentUser, gameService, gameHelpers, moveService, socket) {
        var model = this
        model.getReady = getReady
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


            socket.on('join room', function (username) {
                console.log(username + ' joins the room')
                if (username !== currentUser.username) {
                    console.log('sharing share initial data')
                    socket.emit('share initial data', model.shared)
                    model.isMyTurn = 1
                } else {
                    model.isMyTurn = 0  // second person gets the second turn
                }
            })
            socket.on('share initial data', function (data) {
                model.shared = data
                model.gridChanged(data.grid)
                console.log('synced initialized data')
                if (model.shared.players.length > 0) {
                    $('.game-settings-grid').remove()
                }
            })

            socket.on('getting ready', function (sharedData) {
                model.shared.players = sharedData.players
                var players = sharedData.players
                if (players.length === 1) {
                    if (players.indexOf(currentUser._id) < 0) {  // the other player is ready
                        $('.game-settings-grid').remove()
                    } else {                                        // i am ready
                        var $gameSettings = $('.game-settings')
                        $gameSettings.children().each(function() {
                            $(this).remove()
                        })
                        $gameSettings.append('Waiting for your opponent to get ready ...')
                    }
                } else if (players.length >= 2) {                     // both ready
                    $('.game-settings').remove()
                    gameHelpers.showMessage(model, 'The game starts!')
                    model.shared.game = sharedData.game
                    startGame(model.shared.grid)
                }
            })

            socket.on('change grid', function (grid) {
                model.shared.grid = grid
                model.rowIndex = gameHelpers.toNumsArray(grid)
                model.colIndex = gameHelpers.toNumsArray(grid)
            })

            socket.on('move made', afterMove(model))

            model.gridChanged(model.shared.grid)
        }

        function getReady() {
            if (model.shared.players.indexOf(currentUser._id) < 0) {
                model.shared.players.push(currentUser._id)
                socket.emit('getting ready', model.shared)
            }

            if (model.shared.players.length === 2) {

                var _opponentId = gameHelpers.getOpponentId(model.shared.players, currentUser._id)
                var _player1 =  model.isMyTurn ? currentUser._id : _opponentId
                var _player2 = !model.isMyTurn ? currentUser._id : _opponentId

                var game = {
                    grid: model.shared.grid,
                    _player1: _player1,
                    _player2: _player2
                }

                socket.emit('game start')

                return gameService
                    .createGame(game)
                    .then(function (game) {
                        model.shared.game = game
                        socket.emit('getting ready', model.shared)
                    })
            }
        }

        function startGame(grid) {
            gameHelpers.resetGame()
            model.moves = 0

            model.rows = new Array(grid).fill(0)
            model.cols = new Array(grid).fill(0)
            model.dia1 = 0
            model.dia2 = 0
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

            socket.emit('change grid', newGrid)
        }
    }
})()
