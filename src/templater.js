angular.module('templater', [])

.config(['$compileProvider', function($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}])

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
            // не парные элементы
            var empty_elements = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param', 'embed'];

            // Заготовленные шаблоны обертки
            var wrapper = $templates;

            if (iAttrs.tmpl) {
                angular.extend(wrapper, $parse(iAttrs.tmpl)(scope));
            }

            // оборачивание элемента
            var wrap = function(el, temp, lbl) {
                if (wrapper[temp]) {
                    var _id = 'id-' + Date.now() + '-' + parseInt(Math.random() * 1000, 10);
                    // el has class
                    if (/_@\[(.*)\]/g.test(wrapper[temp])) {
                        // если есть классы элемента в шаблоне _@[.btn.btn-default]
                        var el_cls = wrapper[temp].replace(/.+_@\[([^\]]+)\].+/g, '$1');
                        el = getClass(el_cls, el);
                        el = wrapper[temp].replace(/(_@\[[^\]]+\])/g, el);
                    } else {
                        el = wrapper[temp].replace(/_@/g, el);
                    }
                    el = el.replace(/_id/g, _id);

                    // Текст к примеру в лэйбле
                    el = el.replace(/_\$/g, (lbl||''));
                }
                return el;
            }; // wrap


            // получение строки с атрибутами из объекта
            var attr = function(prop) {
                var k, v,
                    res = [' '];

                for (k in prop) {
                    if (k === '_sub_' || k === '_lbl_') continue; // не парсим суб компоненты и описание
                    if (prop[k] === undefined) continue; // только элементы этого объекта

                    v = prop[k];
                    res.push(k + '="' + v + '"');
                }
                return res.join(' ');
            }; // attr

            // функция для получения классов из css нотации
            // @origin массив из классов
            var getClass = function(origin, el) {
                var cls = [],
                    re; // регулярка для поиска и заменны места для классов

                if (origin) {
                    if (typeof origin === 'string') {
                        origin = origin.split('.');
                    }

                    for (var i = 0; i < origin.length; i++) {
                        if (origin[i]) {
                            cls.push(origin[i]);
                        }
                    }
                }

                if (el) {
                    if (/class="[^"]*"/g.test(el)) {
                        cls.push(el.replace(/.*class="([^"]*)".*/g, '$1'));
                        re = /(\sclass="[^"]*")/g;
                    } else {
                        re = /^<[^>\s]+()/g;
                    }
                    cls = clearClass(cls);
                    return el.replace(re, ' class="' + cls.join(' ') + '"');
                }
                cls = clearClass(cls);
                return ' class="' + cls.join(' ') + '"';
            }; // getClass

            // Очищаем пустые и одинаковые названия для классов
            var clearClass = function(arr) {
                var x = {};
                for (var i = arr.length; i--;) {
                    if (arr[i]) {
                        x[arr[i]] = '';
                    }
                }
                return Object.keys(x);
            }; // clearClass

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
                // добавляем классы
                res.push('<' + el + getClass(origin));

                if (['string', 'number', 'boolean'].indexOf(typeof obj) > -1) {
                    res.push('>' + obj);
                } else {
                    if (hasComp(obj)) {
                        // обрабатываем объект как компонент
                        res.push('>' + getSub(obj) + parse(obj));
                    } else {
                        // обрабатываем как атрибуты элемента
                        res.push(attr(obj) + '>' + getSub(obj));
                    }
                }
                // если элемент из тех что не стоит закрывать
                var close_el = el.split(' ').shift();
                if (empty_elements.indexOf(close_el) === -1) {
                    res.push('</' + close_el + '>');
                }

                var r = res.join('');

                return wrap(r, temp, obj._lbl_);
            }; // to_e


            // getSub object
            var getSub = function(obj) {
                if (typeof obj._sub_ === 'object') {
                    return getSub(obj._sub_) + parse(obj._sub_);
                } else if (['string', 'number', 'boolean'].indexOf(typeof obj._sub_) > -1) {
                    return obj._sub_;
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
