var app = angular.module('App', [
    'templater' // include Templater
]);

app.controller('TestCtrl', ['$scope', '$timeout', function($scope, $timeout) {

    $scope.demo_list = {
        '1': {
            '-e--[h1]': 'Hello world!'
        },
        '2': {
            '-e--[p]':{
                '-e--[span]': 'demo 2'
            }
        }
    };

    $scope.active = '';

    $scope.map_object = {};

    $scope.use = function(key) {
        $scope.map_object = $scope.demo_list[key];
        $scope.active = key;
        $timeout(function() {
            $scope.html = document.getElementById('templater').innerHTML;
        });
    };
}]);