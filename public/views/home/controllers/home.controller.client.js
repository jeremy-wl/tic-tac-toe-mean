(function () {
    angular
        .module('ttt')
        .controller('homeController', homeController)

    function homeController() {
        var model = this
        model.local = true
        model.showOnlineButtons = showOnlineButtons
        model.openNewSocket = openNewSocket

        function showOnlineButtons() {
            model.local = !model.local
        }
    }
})()
