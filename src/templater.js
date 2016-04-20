angular.module('templater', [])

.provider('$templates', function() {
    var _templates = {};

    return {
        add: function(obj) {
            angular.extend(_templates, obj);
        },

        $get: function() {
            return _templates;
        }
    };
})

.directive('templater', ['$compile', '$parse', '$templates', function($compile, $parse, $templates) {
    return {
        restrict: 'E',
        reqired: 'map',
        scope: '^',
        template: '',
        link: function(scope, iElement, iAttrs) {

            // получение строки с атрибутами из объекта
            var attr = function(prop) {
                var k, v,
                    res = [' '];

                for (k in prop) {
                    if (k === '_sub_') continue; // не парсим суб компоненты
                    if (prop[k] === undefined) continue; // только элементы этого объекта

                    v = prop[k];
                    res.push(k + '="' + v + '"');
                }
                return res.join(' ');
            }; // attr


            // создание условия
            var to_if = function(str, obj) {
                var res = [];
                res.push('<div');
                str = str.replace(/"/g, "'");
                res.push('ng-if="' + str + '">');
                res.push(parse(obj));
                res.push('</div>');
                return res.join(' ');
            }; // to_if


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
            }; // to_switch


            // создание множественного условия
            var to_case = function(condition, val, obj) {
                return to_if(condition + '==' + val, obj);
            }; // to_case


            // создаем div можно передавать только классы
            var to_e = function(str, obj, temp) {
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
                        res.push(getSub(obj) + parse(obj));
                    } else {
                        // обрабатываем как атрибуты элемента
                        res.push(attr(obj) + '>' + getSub(obj));
                    }
                }
                res.push('</' + el.split(' ').shift() + '>');

                var r = res.join('');

                if (wrapper[temp]) {
                    var _id = 'id-' + Date.now() + '-' + parseInt(Math.random() * 1000);
                    r = wrapper[temp].replace(/_@/g, r);
                    r = r.replace(/_id/g, _id);
                }
                return r;
            }; // to_e


            // getSub object
            var getSub = function(obj) {
                if (typeof obj['_sub_'] === 'object') {
                    return getSub(obj['_sub_']) + parse(obj['_sub_']);
                } else if (['string', 'number', 'boolean'].indexOf(typeof obj['_sub_']) > -1) {
                    return obj['_sub_'];
                }
                return '';
            }; // getSub


            // проверка есть ли в объекте компонент, проверяется по первому символу черточке
            var hasComp = function(obj) {
                var arr = Object.keys(obj);
                for (var i = arr.length; i--;) {
                    if (arr[i][0] === '-') {
                        return true;
                    }
                }
                return false;
            }; // hasComp



            // регулярка для парсинга элемента
            var reg = /-(.+)--\[([^\]]*)\](\[([^\]]*)\])?.*/g;

            /**
             * Парсер
             * @param  {object} tmpl нотация шаблонизатора
             * @return {string} html
             */
            var parse = function(tmpl) {
                if (['string', 'number', 'boolean'].indexOf(typeof obj) > -1) {
                    return obj;
                }

                var k, val, hasProp = {}.hasOwnProperty;
                var html_tmpl = [];

                for (k in tmpl) {
                    if (!hasProp.call(tmpl, k)) continue;
                    val = tmpl[k];
                    //
                    switch (k.replace(reg, '$1')) {
                        case 'if':
                            html_tmpl.push(to_if(k.replace(reg, '$2'), val, k.replace(reg, '$4')));
                            break;
                        case 'switch':
                            html_tmpl.push(to_switch(k.replace(reg, '$2'), val, k.replace(reg, '$4')));
                            break;
                        case 'e':
                            html_tmpl.push(to_e(k.replace(reg, '$2'), val, k.replace(reg, '$4')));
                            break;
                    }
                }
                return html_tmpl.join('');
            }; // parse


            // Заготовленные шаблоны обертки
            var wrapper = $templates;

            if (iAttrs.tmpl) {
                angular.extend(wrapper, $parse(iAttrs.tmpl)(scope));
            }


            // получаем объект для шаблона
            scope.$watch(iAttrs.map, function(val) {
                var map = $parse(iAttrs.map)(scope);
                var template = parse(map);
                if (!template) {
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
