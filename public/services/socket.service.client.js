(function () {
    angular
        .module("ttt")
        .factory("socket", function ($rootScope) {
            // https://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
            var socket = io.connect()
            var api = {}

            api.on = on
            api.emit = emit

            return api

            function on(eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            }

            function emit(eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        })
})()
