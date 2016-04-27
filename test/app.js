// Create app
var app = angular.module('App', [
    'templater' // include Templater
]);

// Config
app.config(['$templatesProvider', function ($templatesProvider){
    // add template wrapper
    $templatesProvider.add({
        formInput: '<div class="form-group"><label for="_id">Text input</label>_@[.form-control]</div>'
    });
}]);
// Demo
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
        '3': {
            '-e--[h3]': 'if component',

            '-e--[input.form-control]': {
                'type': 'text',
                'ng-model': 'val'
            },

            '-if--[val=="1"]': {
                '-e--[]': 'show value {{val}}'
            },

            '-if--[val!="1"]': {
                '-e--[]': 'hide value {{val}}'
            }
        },
        '4': {
            '-e--[h3]': 'switch component',

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
        },
        '5': {
            '-e--[span]': {
                'style': 'color:#933',
                '_sub_': {
                    '_sub_': 'red text',
                    '-e--[span]': {
                        'style': 'color:#393',
                        '_sub_': 'green text'
                    }
                }
            }
        },
        '6': {
            '-e--[input.form-control][formInput]-1':{
                'id': '_id',
                'value': 'My text'
            },
            '-e--[input][formInput]-2':{
                'id': '_id',
                'value': 'My text'
            },
        },
        '7': {
            '-e--[hr]':{
                '_sub_': 'Hello world'
            }
        }
    };

    $scope.active = '';

    $scope.map_object = {};

    $scope.use = function(key) {
        console.time("Execution time took");

        $scope.map_object = $scope.demo_list[key];
        $scope.active = key;
        $timeout(function() {
            $scope.html = document.getElementById('templater').innerHTML;
        });

        console.timeEnd("Execution time took");
    };


}]);
