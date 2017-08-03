(function () {
    angular
        .module('ttt')
        .controller('gameOnlineController', gameOnlineController)

    function gameOnlineController(currentUser, gameService, gameHelpers, moveService, socket) {
        var model = this
        model.ready = ready
        model.startGame = startGame
        model.makeMove = makeMove
        model.moved = moved
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

            socket.emit('join game', currentUser.username)
            socket.on('joins room', function (username) {
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
                        $('.game-settings').children().each(function() {
                            $(this).remove()
                        })
                        $('.game-settings').append('Waiting for your opponent to get ready ...')
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

            socket.on('move made', moved(model))

            model.gridChanged(model.shared.grid)
            console.log(model.shared)
        }

        function ready() {
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

                return gameService
                    .createGame(game)
                    .then(function (game) {
                        // model.shared.game = game
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

        function makeMove(position, isMyTurn) {
            if (isMyTurn && !model.result && gameHelpers.isValidMove(position)) {
                var move = {
                    position: position,
                    _player: currentUser._id
                }
                return moveService
                    .makeMove(move, model.shared.game.board)
                    .then(function () {
                        socket.emit('move made', move)
                    })
            }
        }

        function moved(model) {
            return function (moveObj) {
                var position = moveObj.position
                var cssClass = moveObj._player === model.shared.game._player1 ? 'move-made-X' : 'move-made-O'
                $("td[data-move=" + position + "]").addClass(cssClass)
                model.moves++

                var n = model.shared.grid,
                    i = Math.floor(position/n), j = position % n,
                    val = model.isMyTurn ? 1 : -1

                model.rows[i] += val
                model.cols[j] += val

                if (i === j)      model.dia1 += val
                if (i === n-j-1)  model.dia2 += val

                // Someone wins
                if (Math.abs(model.rows[i]) === n || Math.abs(model.dia1) === n ||
                    Math.abs(model.cols[j]) === n || Math.abs(model.dia2) === n) {
                    model.result = model.isMyTurn ? 'You win!' : 'You lose!'
                    var opponentId = gameHelpers.getOpponentId(model.shared.players, currentUser._id)
                    var winner = model.isMyTurn ? currentUser._id : opponentId
                    return gameService
                        .addWinnerToGame(model.shared.game, winner)
                        .then(function (game) {
                            return model.result  // if it is my turn, i win; otherwise, robot wins (i lose)
                        })
                }
                // No empty cells left
                if (model.moves === n * n) {
                    model.result = "It's a tie."
                    return gameService
                        .addWinnerToGame(model.shared.game, 'tie')
                        .then(function (game) {
                            return model.result
                        })
                }
                model.isMyTurn = !model.isMyTurn
                console.log('ongoing')
                // .then(moved(model))
                //         .then(function (gameResult) {
                //             console.log(gameResult)
                //             var grid = model.shared.grid
                //             if (model.moves >= grid * grid) {
                //                 throw "Already made last move!"
                //             }
                //         })
                //         .catch(function (err) {
                //             console.log(err)
                //         })

            }
        }

        function gridChanged(newGrid) {
            if (!Number.isInteger(newGrid) || newGrid < 3 || newGrid > 10) {
                if (Number.isInteger(newGrid) && newGrid > 10) {
                    newGrid = 10
                } else {
                    newGrid = 3
                }
                // gameHelpers.showMessage(model, 'Please enter a number between 3 to 10')
            }

            socket.emit('change grid', newGrid)
        }
    }
})()
