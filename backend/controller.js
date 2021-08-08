'use strict';
const { dialog, shell, ipcMain }        = require('electron')
const fs                        = require('fs')
const path                      = require('path')
const fetch                     = require('node-fetch');

const wallet                    = require( wallet_file );
const alcor                     = require( alcor_file );
const token_reddit              = require( token_reddit_file )
const token_email               = require( token_email_file )
const test_email                = require( test_email_file )
const Scheduler                 = require( scheduler_file )

const Controller = new Object({

    // Ссылка на окно
    ElectronMainWindow: false,

    // Запск/Автозапуск
    init: function( ElectronMainWindow ){

        // Ссылка на окно
        this.ElectronMainWindow = ElectronMainWindow

        // Запуск планировщика
        Scheduler.init( this.ElectronMainWindow )
    },

    tpl: async ( event, data ) => {
    
        let tplname = data.tplname
        let tplstring = await new Promise((resolve, reject) => {
            fs.open( base_dir + '/frontend/' + tplname, 'r', function(err, fileToRead){
                if (!err){
                    fs.readFile(fileToRead, {encoding: 'utf-8'}, function(err,data){
                        if (!err){
                            resolve( data )
                        }
                    })
                }else{
                    resolve( base_dir + '/frontend/' + tplname )
                }
            })
        })
        return tplstring

        // console.log( 'asynchronous-message', event, arg ) // prints "ping"
    //     // Что то ответить...
    //     // event.reply( 'asynchronous-reply', 'pong')
    },
        
    // Получение языкового перевода
    lang : async function ( event, data ) {
        let language = await resources.settings.select('lang')
        return require( lang_dir + '/' + language )
    },

    // Получение всех настроек
    settings : async function ( event, data ) {
        return await resources.settings.list()
    },

    // Хочет получить списсок всех аккаунтов
    accounts: async ( event, data ) => {
        return await resources.accounts.list()
    }, 

    // Хочет получить списсок всех групп
    groups: async ( event, data ) => {
        let groups_list = await resources.groups.list()
        return groups_list
    },

    // Авторизация в кабинете wallet_wax
    wallet_auth: async ( event, data ) => { 
        let account = await resources.accounts.select( data )
        wallet( account )
    },

    // Открыть сайт с WAX Alcor-Exchange
    alcor_auth: async ( event, data ) => { 
        let account = await resources.accounts.select( data )
        alcor( account )
    },

    // Авторизация в кабинете wallet_wax
    session_token: async ( event, data, trycount = 0 ) => {
        
        let _ = this
        let account = await resources.accounts.select( data )
        
        // Сохранение и установка токена
        let save_sessionToken = async ( token ) => {

            // Обновление в базе
            await resources.accounts.update( account.wax_login, {
                session_token: token
            })
        }

        // Действия при неудаче получения токена
        let reject_sessionToken = async ( _env_trycount = 0 ) => {

            // Пытаться еще несколько раз получать код
            if( Number( trycount ) <= _env_trycount ){
                _.session_token( event, data, ( +_env_trycount + 1 ) )
            }

            // Отключить аккаунт и прекратить попытки
            else{
                await resources.accounts.update( account.wax_login, {
                    status: 'disabled'
                })
            }

        }

        // Получение токена сессии при помощи настроек почты
        if( account.token_mode === 'mail' ){

            // Режим запуска    
            let headless_mode = true
            if( settings.mail_visible === 'on' ){
                headless_mode = false
            }

            try {
                    
                // Авторизация в кошеле при помощи обычной почты
                token_email( account, headless_mode ).then( async token => {

                    logger.log( 'token_email success', token )

                    // Сохранение и установка токена

                    await save_sessionToken( token )

                }).catch( async err => {

                    logger.log( 'token_email error' )

                    // Действия при неудачном получении токена
                    await reject_sessionToken( settings.mail_trycount )

                })

            } catch (error) {
                logger.log( 'error', error );
            }


        }

        // Получение токена сессии при помощи настроек реддита
        if( account.token_mode === 'reddit' ){

            // Режим запуска    
            let headless_mode = true
            if( settings.reddit_visible.toString() === 'on' ){
                headless_mode = false
            }

            token_reddit( account, headless_mode ).then( async token => {
                
                // Сохранение и установка токена
                await save_sessionToken( token )

            }).catch( async err => {

                logger.log( 'token_reddit error' )

                // Действия при неудачном получении токена
                await reject_sessionToken( settings.reddit_trycount )

            })
            
        }

    },

    // Попытка перейти по внешней ссылке
    external_link: ( event, linkText ) => {
        shell.openExternal( linkText )
    },

    // Попытка получить информацию о текущем токене
    access_token: async ( event, data ) => {
        let access_token = await resources.settings.select('token')
        let response = { status: 'error', message: 'Undefined error' }
            response = await new Promise(( resolve, reject ) => {
                try {
                    fetch(`https://api.alienbot.fun/info`, {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: access_token })
                    })
                    .then( res => res.json() )
                    .then( r => {
                        resolve( r );
                    })
                    .catch( err => {
                        resolve({ status: 'error', message: 'Server not fount' });
                    });
                } catch (error) {
                    resolve({ status: 'error', message: 'Undefined error' });
                }
            })

        return response

    },

    // Попытка сохранить настройки
    save_settings: async ( event, data ) => {

        let lang = await resources.languages.get()
        let shema = await resources.shema.select('settings')
        let response = { status: 'error' }

        try {

            let seting_save = {}
            data.map( i => {
                if( shema[ i.name ] !== undefined ){
                    let set_value = i.value
                    if( shema[ i.name ].type === 'integer' ){
                        set_value = +i.value
                    }
                    seting_save[ i.name ] = set_value
                }                
            })

            await resources.settings.update( seting_save )
            response = { status: 'success', message: lang.pages.settings.saveOK }

        } catch (error) {}

        return response

    },
    
    // Попытка загрузить список групп
    groups_import : async ( event, import_data ) => {
        
        let response    = { status: 'error' }
        let shema       = await resources.shema.select('groups')
        await resources.groups.save([])

        var shema_keys  = Object.keys( shema )
            import_data = import_data.filter( element => element !== null && element !== undefined )
            import_data = import_data.filter( element => element.id !== null && element.id !== undefined )
            import_data = helpers.clear_two_array( import_data, shema_keys )
            import_data = import_data.map( row => {
                var add = {}
                for (var key in row) {
                    if (Object.hasOwnProperty.call(row, key)) {
                        var value = row[key];
                        if( shema[ key ] !== undefined ){
                            var set_value = value
                            if( shema[ key ].type === 'integer' ){
                                set_value = +value
                            }
                            add[ key ] = set_value
                        }  
                    }
                }
                return add
            })

        await resources.groups.save( import_data )
            response    = { status: 'success' }

        return response

    },

    // Попытка загрузить список аккаунтов
    accounts_import : async ( event, import_data ) => {
        
        let response    = { status: 'error' }
        let shema       = await resources.shema.select('accounts')
        await resources.accounts.save([])

        var shema_keys  = Object.keys( shema )
            import_data = import_data.filter( element => element !== null && element !== undefined )
            import_data = import_data.filter( element => element.wax_login !== null && element.wax_login !== undefined )
            import_data = helpers.clear_two_array( import_data, shema_keys )
            import_data = import_data.map( row => {
                var add = {}
                for (var key in row) {
                    if (Object.hasOwnProperty.call(row, key)) {
                        var value = row[key];
                        if( shema[ key ] !== undefined ){
                            var set_value = value
                            if( shema[ key ].type === 'integer' ){
                                set_value = +value
                            }
                            add[ key ] = set_value
                        }  
                    }
                }
                return add
            })

        await resources.accounts.save( import_data )
            response    = { status: 'success' }

        return response

    },

    // Попытка удалить указанную группу
    groups_remove : async ( event, group_id ) => {

        // Удаление группы из списка
        let new_groups = await resources.groups.delete( +group_id )

        // Обновление списка аккаунтов
        let accounts = await resources.accounts.list()
        let new_accounts = accounts.map( acc => {
            if( +acc.group_id === +group_id ){
                acc.group_id = 0
            }
            return acc
        })
        resources.accounts.save( new_accounts )

        return new_groups

    },
    
    // Попытка удалить указанный аккаунт
    account_remove : async ( event, wax_login ) => {

        // Удаление аккаунта из списка
        let new_accounts = await resources.accounts.delete( wax_login )

        return new_accounts

    },
    
    // Попытка изменить/добавить группу
    group_edit : async ( event, { is_created, data } ) => {

        let lang        = await resources.languages.get()
        let response    = { status: 'error', message: lang.errors.error_message }

        let shema       = await resources.shema.select('groups')
        let groups      = await resources.groups.list()
        let groups_ids  = groups.map( gr => +gr.id )
        
        let db_array = {}        
        for (let name in shema) {
            if (Object.hasOwnProperty.call(shema, name)) {
                let params = shema[name];
                let get = data.find( e => e.name === name )
                if( get.value ){
                    db_array[name] = params.type === 'integer' ? Number( get.value ) : get.value.toString()
                }
            }
        }

        // Добавление данных
        if( is_created ) {
            db_array['id'] = helpers.get_id( groups_ids )
            await resources.groups.insert( db_array )
            response = { status: 'success', message: lang.pages.group.created }
        }
        
        // Обновление данных
        else{
            await resources.groups.update( +db_array.id, db_array )
            response = { status: 'success', message: lang.pages.group.edited }
        }

        return response

    },

    // Попытка изменить/добавить аккаунт
    account_edit : async ( event, { is_created, data } ) => {

        let lang        = await resources.languages.get()
        let response    = { status: 'error', message: lang.errors.error_message }

        let shema       = await resources.shema.select('accounts')
        
        let db_array = {}        
        for (let name in shema) {
            if (Object.hasOwnProperty.call(shema, name)) {
                try {
                    let params = shema[name]
                    let get = data.find( e => e.name === name )
                    if( get['value'] !== undefined ){
                        let get_value = get.value.toString()
                        if( params.type === 'integer' ){
                            if( +get.value == 0 ){
                                get_value = 0
                            }
                            get_value = Number( get.value )
                        }
                        db_array[name] = get_value
                    }
                } catch (error) {}
            }
        }

        // Добавление данных
        if( is_created === 'created' ) {
            await resources.accounts.insert( db_array )
            response = { status: 'success', message: lang.pages.accounts.created_message }
        }
        
        // Обновление данных
        else{
            await resources.accounts.update( is_created, db_array )
            response = { status: 'success', message: lang.pages.accounts.edited_message }
        }

        return response

    },

    // Скачивание буффера
    download : async ( event, data ) => {
        dialog.showSaveDialog({
            defaultPath: '~/' + data.fileName
        }).then( filename => {
            fs.writeFile( filename.filePath, data.fileData , err => {})
        })
    },

    // Скачивание буффера
    download_file : async ( event, data ) => {
        dialog.showSaveDialog({
            defaultPath: '~/' + data.fileName,
            filters: [
                { name: 'Мои файлы', extensions: data.fileExt },
                { name: 'Все файлы', extensions: ['*'] }
            ]
        }).then( filename => {
            fs.writeFile( filename.filePath, fs.readFileSync( path.join( base_dir, data.filePath ) ), err => {})
        })
    },

    // Проверка работоспособности ящика
    account_email_mathed : async ( event, data ) => {

        var status = await new Promise(( resolve, reject ) => {
            test_email( data.email, data.password, data.server, data.port, data.tls ).then( r => {
                resolve( r )
            }).catch( r => {
                resolve('error')
            })
        })

        return {
            status: status,
            message: ( status == 'success' ? 'success' : 'error' )
        }
    }

    
})

module.exports = function( ElectronMainWindow ){

    // Автозапуск
    Controller.init( ElectronMainWindow )

    // Получение шаблона
    ipcMain.handle( 'tpl', Controller.tpl )

    // Получение языкового перевода
    ipcMain.handle( 'lang', Controller.lang )

    // Получение общих настроек
    ipcMain.handle( 'settings', Controller.settings )

    // Получение всего списка пользователей
    ipcMain.handle( 'accounts', Controller.accounts )

    // Получение всего списка групп
    ipcMain.handle( 'groups', Controller.groups )

    // Попытка авторизоваться в кошельке вакс
    ipcMain.on( 'wallet_auth', Controller.wallet_auth )

    // Открытие Alcor-exchange
    ipcMain.on( 'alcor_auth', Controller.alcor_auth )

    // Попытка получения нового токена для аккаунта
    ipcMain.on( 'session_token', Controller.session_token )

    // Попытка перейти по внешней ссылке
    ipcMain.on( 'link', Controller.external_link )

    // Спровоцировать скачивание
    ipcMain.on( 'download', Controller.download )

    // Спровоцировать скачивание
    ipcMain.on( 'download_file', Controller.download_file )

    // Попытка получить информацию о текущем доступе
    ipcMain.handle( 'access_token', Controller.access_token )

    // Попытка сохранить настройки
    ipcMain.handle( 'save_settings', Controller.save_settings )

    // Попытка загрузить список групп
    ipcMain.handle( 'groups_import', Controller.groups_import )

    // Попытка загрузить список аккаунтов
    ipcMain.handle( 'accounts_import', Controller.accounts_import )

    // Попытка удалить группу
    ipcMain.handle( 'groups_remove', Controller.groups_remove )
    
    // Попытка удалить аккаунт
    ipcMain.handle( 'account_remove', Controller.account_remove )

    // Добавить/Изменить новую группу
    ipcMain.handle( 'group_edit', Controller.group_edit )

    // Добавить/Изменить новый аккаунт
    ipcMain.handle( 'account_edit', Controller.account_edit )

    // Проверка работоспособности почтового ящика
    ipcMain.handle( 'account_email_mathed', Controller.account_email_mathed )

}

// Прослушивать клиента...
// ipcMain.on('tpl', ( event, data ) => {
//     // Что то делать...
    // console.log( 'asynchronous-message', event, arg ) // prints "ping"
//     // Что то ответить...
//     // event.reply( 'asynchronous-reply', 'pong')
// })

// Послать запрос напрямую клиенту неожиданным способом...
// mainWindow.webContents.send('ping', 'whoooooooh!1')

// // Принять запрос от клиента и что то сообщить в обраточку
// ipcMain.handle('my-invokable-ipc', async (event, name) => {
//     const result = 'NIKOLAY' + name
//     return result
// })
