var app = angular.module('App', [
    'templater' // include Templater
]);

app.controller('TestCtrl', ['$scope', '$timeout', function($scope, $timeout) {

    $scope.demo_list = {
        '1': {
            '-e--[h1]': 'Hello world!'
        },
        '2': {
            '-e--[p.well]': {
                '-e--[span]': 'demo 2'
            }
        },
        '3':{
            '-e--[h3]':'if component',

            '-e--[input.form-control]':{
                'type':'text',
                'ng-model': 'val'
            },

            '-if--[val=="1"]': {
                '-e--[]':'show value {{val}}'
            },

            '-if--[val!="1"]': {
                '-e--[]':'hide value {{val}}'
            }
        },
        '4': {
            '-e--[h3]':'switch component',

            '-e--[select ng-model="selector".form-control]': {
                '-e--[option value="1"]': 'show 1',
                '-e--[option value="2"]': 'show 2',
                '-e--[option value="3"]': 'show 3',
            },
            '-e--[.well]': '{{ selector }}',
            '-switch--[selector]': {
                '-case--[1]': {
                    '-e--[p]': 'selected first item'
                },
                '-case--[2]': {
                    '-e--[p]': 'selected second item'
                },
                '-case--[3]': {
                    '-e--[p]': 'selected third item'
                }
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