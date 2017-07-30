(function () {
    angular
        .module("ttt")
        .config(configuration)

    function configuration($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home/home.view.client.html',
                controller: 'homeController',
                controllerAs: 'model'
            })
    }
})()
