module.exports = {
    
    timer_convert : function( countdown ) {
        var countdown = (function (countdown){
            var countdown = countdown || false;
            if(countdown){
                if(countdown > 0){
                    return countdown;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        })(countdown);
        if(countdown){
            var secs = countdown % 60;
            var countdown1 = (countdown - secs) / 60;
            var mins = countdown1 % 60;
            countdown1 = (countdown1 - mins) / 60;
            var hours = countdown1 % 24;
            var days = (countdown1 - hours) / 24;
            return {
                d: (days < 10)?'0'+days:days,
                h: (hours < 10)?'0'+hours:hours,
                m: (mins < 10)?'0'+mins:mins,
                s: (secs < 10)?'0'+secs:secs
            };
        }else{
            return false;
        }
    },
    
    get_params : function( str )
    {

        let param = obj => Object.entries(obj).map( pair => Array.isArray(pair[1]) ?
                pair[1].map( x => `${encodeURIComponent(pair[0])}[]=${encodeURIComponent(x)}`).join('&') :
                typeof pair[1] === 'object' ?
                Object.entries(pair[1]).map(x=>`${encodeURIComponent(pair[0])}[${x[0]}]=${encodeURIComponent(x[1])}`).join('&') :
                pair.map(encodeURIComponent).join('=')).join('&')

        return param( str )

    },

    md5 : function( str )
    {
        const md5 = require('md5')
        return md5( str )
    },

    unique : function()
    {

        let uuid = require("uuid")
        let id = uuid.v4()
        
        return id.toString()

    },

    clear_one_array : function( obj = {}, labels = false )
    {

        let new_object = {};

        if( labels === false )
        {
            new_object = obj
        }

        else
        {

            let old_object = { ...obj }

            for (var key in labels )
            {
                let val = labels[ key ]
                if ( old_object[ val ] !== undefined ) {
                    new_object[ val ] = old_object[ val ]
                }
            }

        }

        return new_object

    },

    clear_two_array : function( arr = [], labels = false )
    {

        let _ = this, items = []

        if( labels === false )
        {
            items = arr
        }

        else
        {

            for ( let i in arr )
            {

                let old_object = {...arr[ i ]}
                let new_object = _.clear_one_array( old_object, labels )

                items.push( new_object )

            }

            return items

        }

    },

    num2word : function( array, integer ){

        if (array === undefined || array === null) {
            return;
        }

        words = array
        num = Number(integer)
        set = '-'

        num = num % 100
        if (num > 19)
        {
            num = num % 10
        }

        if( num.toString() == '1' )
        {
            set = words[0];
        }

        if( ['2','3','4'].indexOf( num.toString() ) != -1 )
        {
            set = words[1];
        }

        if( set === '-' )
        {
            set = words[2];
        }

        return set;

    },

    time : function()
    {
        return (Math.round(new Date().getTime()/1000))
    },

    date_format : function( set_format = 'hh:mm:ss.SSS' )
    {
        var format = require( 'date-format' )
        return format.asString( set_format, new Date() )
    },

    get_blockchainPoint: function(){

        let base_api = [
            'https://wax.pink.gg',
            'https://wax.cryptolions.io',
            'https://wax.dapplica.io',
            'https://api.wax.liquidstudios.io',
            'https://wax.eosn.io',
            'https://api.wax.alohaeos.com',
            'https://wax.greymass.com',
            'https://wax-bp.wizardsguild.one',
            'https://apiwax.3dkrender.com',
            'https://wax.eu.eosamsterdam.net',
            'https://wax.csx.io',
            'https://wax.eoseoul.io',
            'https://wax.eosphere.io',
            'https://api.waxeastern.cn'
        ]

        let index = ((min, max) => {
            var rand = min - 0.5 + Math.random() * (max - min + 1)
            return Math.round(rand)
        })( 0, ( base_api.length - 1 ))

        return base_api[index]
    },

    get_id: ( list ) => {
        // let list = [1,2,3,4,5]
        let response_id = false
        let i = 1
        do{
            if( list.indexOf( i ) == -1 ){
                response_id = i
                break;
            }
            i++
        }
        while( i < 1000000000 )
        return response_id
    },

    delay: (ms) => {    
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}