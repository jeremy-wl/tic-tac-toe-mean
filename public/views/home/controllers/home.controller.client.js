(function () {
    angular
        .module('ttt')
        .controller('homeController', homeController)

    function homeController() {
        var model = this
        model.local = true
        model.showOnlineButtons = showOnlineButtons

        function showOnlineButtons() {
            model.local = !model.local
        }
    }
})()
