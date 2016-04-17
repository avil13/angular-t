var app = angular.module('App', [
    'templater' // include Templater
]);

app.controller('TestCtrl', ['$scope', function($scope) {

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
        $scope.active = key;
        $scope.map_object = $scope.demo_list[key];
    };
}]);