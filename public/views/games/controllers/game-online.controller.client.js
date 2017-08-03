(function () {
    angular
        .module('ttt')
        .controller('gameOnlineController', gameOnlineController)

    function gameOnlineController(currentUser, gameService, gameHelpers, moveService, socket) {
        var model = this
        model.ready = ready
        model.startGame = startGame
        model.makeMove = makeMove
        model.gridChanged = gridChanged

        init()

        function init() {
            model.shared = {
                grid: 3,
                ready: []
            }

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
                if (model.shared.ready.length > 0) {
                    $('.game-settings-grid').remove()
                }
            })

            socket.on('getting ready', function (ready) {
                model.shared.ready = ready
                if (ready.length === 1) {
                    if (ready.indexOf(currentUser.username) < 0) {  // the other player is ready
                        $('.game-settings-grid').remove()
                    } else {                                        // i am ready
                        $('.game-settings').children().each(function() {
                            $(this).remove()
                        })
                        $('.game-settings').append('Waiting for your opponent to get ready ...')
                    }
                } else if (ready.length >= 2) {                     // both ready
                    $('.game-settings').remove()
                }
            })

            model.gridChanged(model.shared.grid)
            console.log(model.shared)
        }

        function ready() {
            if (model.shared.ready.indexOf(currentUser.username) < 0) {
                model.shared.ready.push(currentUser.username)
            }
            socket.emit('getting ready', model.shared.ready)
        }

        function startGame(grid) {
            gameHelpers.resetGame()
            model.moves = 0

            model.rows = new Array(grid).fill(0)
            model.cols = new Array(grid).fill(0)
            model.dia1 = 0
            model.dia2 = 0

            var game = {
                grid: grid,
                playerId: currentUser._id
            }
            return gameService
                .createGame(game)
                .then(function (game) {
                    model.game = game
                    model.isMyTurn = Math.floor(Math.random() * 2);  // 0 or 1, randomly decides the turn
                    if (!model.isMyTurn) {
                        return gameService
                            .robotMove(game)
                            .then(moved(model))
                    }
                })
        }

        function makeMove(position, isMyTurn) {
            if (isMyTurn && !model.game.result && gameHelpers.isValidMove(position)) {
                var move = {
                    position: position,
                    _player: currentUser._id
                }
                return moveService
                    .makeMove(move, model.game.board)
                    .then(moved(model))
                    .then(function (gameResult) {
                        console.log(gameResult)
                        if (model.moves < 9) {
                            return gameService.robotMove(model.game)
                        } else {
                            throw "Already made last move!"
                        }
                    })
                    .then(moved(model))
                    .then(function (gameResult) {
                        console.log(gameResult)
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
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
            socket.on('change grid', function (grid) {
                model.shared.grid = grid
                model.rowIndex = gameHelpers.toNumsArray(grid)
                model.colIndex = gameHelpers.toNumsArray(grid)
            })
        }

    }
})()