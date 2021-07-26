module.exports = function( Twig )
{
    Twig.extendFilter('get_numeric', function( value ){
        if (value === undefined || value === null) {
            return ''
        }
        return value.replace(/[^+\d]/g,'')
    });

    /*{{ ['год','года','лет']|num2word(35) }}*/
    Twig.extendFilter( 'num2word', function( array, integer ){
        return helpers.num2word( array, integer )
    });

    /*{{ 1609314492|view_date('d,m,y,t') }} // 30 Декабря в 10:48, 2020*/
    Twig.extendFilter( 'view_date', function( timestamp, format = 'd,m,y,t' ){
        let date_short = [ 'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря' ];
        let date_full = [ 'Янв', 'Фев', 'Мар', 'Апр', 'Мая', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ];
        let date_time_v = " в ";
        var f = format[0].split(',');
        var s = '';
        var d = new Date( timestamp );
        var date = {
            d : d.getDate(),
            m : d.getMonth(),
            y : d.getFullYear(),
            h : d.getHours(),
            i : d.getMinutes()
        };
        if( f.indexOf( 'd' ) != -1 ){
            s += ( date.d < 10 ) ? '0'+date.d.toString() : date.d;
        }
        if( f.indexOf( 'm' ) != -1 ){
            s += ' ' + date_short[date.m]
        }
        if( f.indexOf( 't' ) != -1 ){
            var _h = ( date.h > 9 ) ? date.h : '0'+date.h.toString();
            var _i = ( date.i > 9 ) ? date.i : '0'+date.i.toString();
            s += ( date_time_v + _h + ":" + _i );
        }
        if( f.indexOf( 'y' ) != -1 ){
            var _y = date.y;
            s += (", " + _y);
        }
        return s;
    });

   /*{{ print_r( global ) }}*/
    Twig.extendFunction('print_r', function(...args) {
        const argsCopy = [...args];
        const state = this;
        const EOL = '\n';
        const indentChar = '  ';
        let indentTimes = 0;
        let out = '';
        const indent = function (times) {
            let ind = '';
            while (times > 0) {
                times--;
                ind += indentChar;
            }
            return ind;
        };
        const displayVar = function (variable) {
            out += indent(indentTimes);
            if (typeof (variable) === 'object') {
                dumpVar(variable);
            } else if (typeof (variable) === 'function') {
                out += 'function()' + EOL;
            } else if (typeof (variable) === 'string') {
                out += 'string(' + variable.length + ') "' + variable + '"' + EOL;
            } else if (typeof (variable) === 'number') {
                out += 'number(' + variable + ')' + EOL;
            } else if (typeof (variable) === 'boolean') {
                out += 'bool(' + variable + ')' + EOL;
            }
        };
        const dumpVar = function (variable) {
            let i;
            if (variable === null) {
                out += 'NULL' + EOL;
            } else if (variable === undefined) {
                out += 'undefined' + EOL;
            } else if (typeof variable === 'object') {
                out += indent(indentTimes) + typeof (variable);
                indentTimes++;
                out += '(' + (function (obj) {
                    let size = 0;
                    let key;
                    for (key in obj) {
                        if (Object.hasOwnProperty.call(obj, key)) {
                            size++;
                        }
                    }
                    return size;
                })(variable) + ') {' + EOL;
                for (i in variable) {
                    if (Object.hasOwnProperty.call(variable, i)) {
                        out += indent(indentTimes) + '[' + i + ']=> ';
                        displayVar(variable[i]);
                    }
                }
                indentTimes--;
                out += indent(indentTimes) + '}' + EOL;
            } else {
                displayVar(variable);
            }
        };
        if (argsCopy.length === 0) {
            argsCopy.push(state.context);
        }
        argsCopy.forEach(variable => {
            dumpVar(variable);
        });
        return '<pre>' + out + '<pre>';
    });

    /*{% set items = [{ 'fruit' : 'apple'}, {'fruit' : 'orange' }] %} {% set fruits = items|array_column('fruit') %}*/
    Twig.extendFilter('array_column', function( array, column ){
        if (array === undefined || array === null) {
            return;
        }
        return array.map(x => x[column]);
    });
    
}
