const path                                      = require('path')
const fs                                        = require('fs')

const fetch                                     = require("node-fetch")
const { Api, JsonRpc, RpcError, Serialize }     = require('eosjs')

const resources = {
    accounts: {
        list: async () => {
            let accounts = JSON.parse( fs.readFileSync( path.join( data_dir, 'accounts.json' ), 'utf8') )
            return accounts
        },
        save: async ( accounts ) => {
            fs.writeFileSync( path.join( data_dir, 'accounts.json' ), JSON.stringify( accounts, null, 4 ) );
        },
        select: async ( wax_login ) => {
            let accounts = await resources.accounts.list()
            return accounts.find( acc => acc.wax_login === wax_login )
        },
        is_sessionToken: async ( wax_login ) => {
            let account = await resources.accounts.select( wax_login )
            let accounts = require( path.join( data_dir, 'accounts.json' ) )
            return account.session_token !== '' ? true : false
        },
        insert: async ( data ) => {
            let accounts = await resources.accounts.list()
            accounts.push( data )
            resources.accounts.save( accounts )
        },
        delete: async ( wax_login ) => {
            let accounts = await resources.accounts.list()
            let new_accounts = accounts.filter( acc => acc.wax_login !== wax_login )
            resources.accounts.save( new_accounts )
            return new_accounts
        },
        update: async ( wax_login, updata ) => {
            let accounts = await resources.accounts.list()
            let new_accounts = accounts.map( acc => {
                if( acc.wax_login === wax_login ){
                    acc = Object.assign( acc, updata )
                }
                return acc
            })
            resources.accounts.save( new_accounts )
        }
    },
    groups: {
        list: async () => {
            let groups = JSON.parse( fs.readFileSync( path.join( data_dir, 'groups.json' ), 'utf8') )
            return groups
        },
        save: async ( groups ) => {
            fs.writeFileSync( path.join( data_dir, 'groups.json' ), JSON.stringify( groups, null, 4 ) );
        },
        select: async ( id ) => {
            let groups = await resources.groups.list()
            return groups.find( gr => gr.id === id )
        },
        insert: async ( data ) => {
            let groups = await resources.groups.list()
            groups.push( data )
            resources.groups.save( groups )
        },
        delete: async ( id ) => {
            let groups = await resources.groups.list()
            let new_groups = groups.filter( gr => gr.id !== id )
            resources.groups.save( new_groups )
            return new_groups
        },
        update: async ( id, updata ) => {
            let groups = await resources.groups.list()
            let new_groups = groups.map( gr => {
                if( gr.id === id ){
                    gr = Object.assign( gr, updata )
                }
                return gr
            })
            resources.groups.save( new_groups )
        }
    },
    settings: {
        list: async () => {
            let settings = require( path.join( data_dir, 'settings.json' ) )
            return settings
        },
        save: ( settings ) => {
            fs.writeFileSync( path.join( data_dir, 'settings.json' ), JSON.stringify( settings, null, 4 ) );
        },
        select: async ( key ) => {
            let settings = await resources.settings.list()
            return ( settings[key] ) ? settings[key] : false
        },
        update: async ( updata ) => {
            let settings = await resources.settings.list()
            let new_settings = Object.assign( settings, updata )
            resources.settings.save( new_settings )
        }
    },
    shema: {
        list: async () => {
            let shema = require( path.join( data_dir, 'shema.json' ) )
            return shema
        },
        select: async ( key ) => {
            let shema = await resources.shema.list()
            return ( shema[key] ) ? shema[key] : false
        }
    },
    languages: {
        list: async () => {
            let items = require( path.join( lang_dir, 'langs.json' ) )
            return items
        },
        get: async ( select_lang = 'russian' ) => {
            let setting_lang = await resources.settings.select('lang') 
            if( select_lang !== 'russian' ){
                setting_lang = select_lang
            }
            return require( path.join( lang_dir, setting_lang ) )
        }
    },
    blockchain: {
        list: [
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
            'https://wax.eoseoul.io',
            'https://wax.eosphere.io',
            'http://wax.blacklusion.io',
            'http://api-wax.eosarabia.net',
            'http://api-wax.eosauthority.com',
            'http://api.wax.greeneosio.com',
            'http://wax.hkeos.com',
            'http://waxapi.ledgerwise.io',
            'http://api.waxsweden.org'
        ],
        get_random: function(){
            let _ = this
            let index = ((min, max) => {
                var rand = min - 0.5 + Math.random() * (max - min + 1)
                return Math.round(rand)
            })( 0, ( _.list.length - 1 ))
            return _.list[index]
        },
        get_account: function( account ){
            let _ = this
            let rpc = new JsonRpc( _.get_random(), { fetch });
            return new Promise(( resolve, reject ) => { 
                rpc.get_account( account.wax_login ).then( e => {
                    resolve( e )
                }).catch(() => {
                    resolve( false )
                })
            })
        },
        get_table_rows: function( account ) {
            let _ = this
            let rpc = new JsonRpc( _.get_random(), { fetch });
            return new Promise(( resolve, reject ) => { 
                rpc.get_table_rows({
                    json: true, 
                    code: "m.federation", 
                    scope: "m.federation", 
                    table: 'miners', 
                    lower_bound: account.wax_login, 
                    upper_bound: account.wax_login
                }).then( e => {
                    resolve( e )
                }).catch(() => {
                    resolve( false )
                })
            })
        },
        get_transaction: function( trx_id ) {
            let _ = this
            let rpc = new JsonRpc( _.get_random(), { fetch });
            return new Promise(( resolve, reject ) => { 
                rpc.history_get_transaction( trx_id ).then( e => {
                    if( e.traces !== undefined ){
                        let item = e.traces.pop()
                        resolve( item )
                    }
                }).catch(() => {
                    resolve( false )
                })
            })
        }
    }
}

module.exports = resources