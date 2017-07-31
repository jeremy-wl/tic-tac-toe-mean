(function () {
    angular
        .module("ttt")
        .config(configuration)

    function configuration($routeProvider) {
        $routeProvider
            .when('/game', {
                templateUrl: 'views/games/templates/game.view.client.html',
                controller: 'gameController',
                controllerAs: 'model',
                resolve: {
                    currentUser: checkLoggedIn
                }
            })
    }

    function checkLoggedIn(userService, $q, $location) {
        var deferred = $q.defer()

        userService
            .checkLoggedIn()
            .then(function (user) {
                if (user == '0') {
                    deferred.reject()
                    $location.url('/login')
                } else {
                    deferred.resolve(user)
                }
            })

        return deferred.promise
    }

})()
