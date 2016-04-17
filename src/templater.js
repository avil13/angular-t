angular
.module('templater', [])
.directive('templater', ['$compile', '$parse', function($compile, $parse) {
    return {
        restrict: 'E',
        reqired: 'map',
        scope: '^',
        template: '',
        link: function(scope, iElement, iAttrs) {

            // получение строки с атрибутами из объекта
            var attr = function(prop) {
                var k, v,
                    res = [' '],
                    hasProp = {}.hasOwnProperty;

                for (k in prop) {
                    if (!hasProp.call(prop, k)) continue;
                    v = prop[k];
                    res.push(k + '="' + v + '"');
                }
                return res.join(' ');
            };

            // создание условия
            var to_if = function(str, obj) {
                var res = [];
                res.push('<div');
                str = str.replace(/"/g, "'");
                res.push('ng-if="' + str + '">');
                res.push(parse(obj));
                res.push('</div>');
                return res.join(' ');
            };

            // создание множественного условия
            var to_switch = function(str, obj) {
                var res = [];
                var k, v, hasProp = {}.hasOwnProperty;

                for (k in obj) {
                    if (!hasProp.call(obj, k)) continue;
                    v = obj[k];
                    con = k.replace(reg, '$2');
                    res.push(to_case(str, con, v));
                }

                return res.join(' ');
            };

            // создание множественного условия
            var to_case = function(condition, val, obj) {
                return to_if(condition + '==' + val, obj);
            };

            // создаем div можно передавать только классы
            var to_e = function(str, obj) {
                var res = [];
                var origin = str.split('.'); // тут массив для названий классов
                var el = origin.shift() || 'div'; // название элемента
                var cls = [];
                // есть классы?
                if (origin.length) {
                    for (var i = 0; i < origin.length; i++) {
                        if (origin[i]) {
                            cls.push(origin[i]);
                        }
                    }
                    // добавляем классы
                    res.push('<' + el + ' class="' + cls.join(' ') + '"');
                } else {
                    // не добавляем классы
                    res.push('<' + el);
                }

                if (['string', 'number', 'boolean'].indexOf(typeof obj) > -1) {
                    res.push('>' + obj);
                } else {
                    if (hasComp(obj)) {
                        // обрабатываем объект как компонент
                        res.push('>');
                        res.push(parse(obj));
                    } else {
                        // обрабатываем как атрибуты элемента
                        res.push(attr(obj) + '>');
                    }
                }
                res.push('</' + el.split(' ').shift() + '>');
                return res.join(' ');
            };

            // проверка есть ли в объекте компонент, проверяется по первому символу черточке
            var hasComp = function(obj) {
                var arr = Object.keys(obj);
                for (var i = arr.length; i--;) {
                    if (arr[i][0] === '-') {
                        return true;
                    }
                }
                return false;
            };



            // регулярка для парсинга элемента
            var reg = /-(.+)--\[(.+)\].*/g;

            /**
             * Парсер
             * @param  {object} tmpl нотация шаблонизатора
             * @return {string} html
             */
            var parse = function(tmpl) {
                if (typeof tmpl !== 'object') {
                    console.error('Not Object', tmpl);
                }

                var k, val, hasProp = {}.hasOwnProperty;
                var html_tmpl = [];

                for (k in tmpl) {
                    if (!hasProp.call(tmpl, k)) continue;
                    val = tmpl[k];
                    //
                    switch (k.replace(reg, '$1')) {
                        case 'if':
                            html_tmpl.push(to_if(k.replace(reg, '$2'), val));
                            break;
                        case 'switch':
                            html_tmpl.push(to_switch(k.replace(reg, '$2'), val));
                            break;
                        case 'e':
                            html_tmpl.push(to_e(k.replace(reg, '$2'), val));
                            break;
                    }
                }
                return html_tmpl.join('');
            };

            // получаем объект для шаблона
            scope.$watch(iAttrs.map, function(val) {
                var map = $parse(iAttrs.map)(scope);
                var template = parse(map);
                if(!template){
                    iElement.html('');
                    return false;
                }
                var content = $compile(template)(scope);
                iElement.html('');
                iElement.append(content);
                console.log('==>', template);
            });
        }
    };
}]);
