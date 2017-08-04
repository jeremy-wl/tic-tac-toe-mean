(function () {
    angular
        .module('ttt')
        .controller('homeController', homeController)

    function homeController(socket, currentUser, $location) {
        var model = this
        model.local = true
        model.showOnlineButtons = showOnlineButtons
        model.createRoom = createRoom
        model.joinRoom = joinRoom

        init()

        function init() {

        }

        function showOnlineButtons() {
            model.local = !model.local
        }

        function createRoom() {
            socket.emit('create room', currentUser.username)
            $location.url('/online')
        }

        function joinRoom() {
            socket.emit('join room', currentUser.username)
            $location.url('/online')
        }
    }
})()
