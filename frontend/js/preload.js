const { ipcRenderer } = require('electron');
const electron = require('electron').remote
const Excel = electron.require('exceljs')
const shema = electron.require('./data/shema')

$(function(){
    
    window.UI = new Object({

        // Языковые настройки
        lang: {},

        // Общие настройки
        settings: {},

        // Настройки токена
        access_data: { status: 'off' },

        // Автозапуск функций
        init: () => {

            // Получение языкового перевода
            UI.helpers.lang()

            // Список групп - нужен именно тут
            UI.groups.get_list( false )

            // Получение общих настроек приложения
            UI.helpers.settings()
            
            // Интерактивные элементы
            UI.tools.interactive()

            // Интерактивные элементы
            UI.tools.access_token( true )

            // Инициализация планировщика
            UI.planner.init()

        },
        
        // Работа планировщика
        planner: {

            // Состояние майнинга
            status: 'STOP',

            accounts: [],

            // Инициализация ( Действия при запуске приложения - НЕ ПЛАНИРОВЩИКА )
            init: function(){

                // Построить список из десятка первых попавшихся аккаунтов
                let groups_grid = UI.groups.get_grid()
                ipcRenderer.invoke( 'accounts' ).then( accounts => {
                    let accounts_list = accounts.slice(0, 10)
                    if( accounts_list.length > 0 ){
                        UI.helpers.tpl('layouts/home/list_wait.twig', { 
                            items: accounts_list,
                            groups: groups_grid,
                            lang: UI.lang
                        }).then( html => {
                            $('.javascript-list-wait').html( html )
                        })
                    }
                })
                
                // Прослушивание списка данных
                ipcRenderer.on( 'planner_data', (event, data) => {

                    // Формирование списка ожидающих клайма
                    UI.planner.building_wait_listing( data )

                    // Формирование списка аккаунтов в процессе клайма
                    UI.planner.building_work_listing( data )

                })

                // Прослушивание мета данных
                ipcRenderer.on( 'planner_meta', (event, data) => {
                    
                    // Контроль счётчика...
                    $('.javascript-controlInterval').text( data.interval_starting > 60 ? '>60' : data.interval_starting )

                })

                // Установка первоначальных настроек управления
                UI.planner.tools.init()

            },

            // Управление кнопками, списками и парметрами
            tools: {

                init: () => {
                    
                    // Установка и активация параметров майнинга
                    setTimeout(() => {

                        $(`select[name="window_interval"] option[value="${UI.settings.count_opened_window}"]`).prop( 'selected', true ).removeAttr( 'disabled' )
                        $(`select[name="account_interval"] option[value="${UI.settings.account_interval}"]`).prop( 'selected', true ).removeAttr( 'disabled' )

                        $(`select[name="window_interval"]`).removeAttr('disabled')
                        $(`select[name="account_interval"]`).removeAttr('disabled')

                    }, 2000);

                },

                // Нажал кнопку - запустить всё
                runAll: async () => {
                        
                    // Получение списка аккаунтов
                    await UI.accounts.get_list()

                    // Получение списка групп
                    await UI.groups.get_list()
                        
                    ipcRenderer.invoke( 'accounts' ).then( accounts => {
                        
                        console.log( 'accounts', accounts );

                        let list = accounts
                            // list = list.filter( it => it.session_token !== '' )
                            list = list.filter( it => it.status == 'active' )

                        // console.log('162', list, list.length, UI.access_data.status );

                        if( UI.access_data.status === 'on' && list.length > 0 ){
                            
                            // Запуск планировщика
                            ipcRenderer.send( 'planner_command', 'START' )

                            $('a.javascript-playment-run').removeAttr('disabled')
                            $('a.javascript-playment-stop').removeAttr('disabled')
                            $('a.javascript-playment-run').attr("disabled", "disabled")

                            // Состояние старта
                            UI.planner.status = 'START'

                        }else{

                            UI.helpers.alert( 'error', UI.lang.registry.no_mining )

                        }

                    })


                },

                // Нажал кнопку - остановить всё
                stopedAll: () => {

                    // Состояние стопа
                    UI.planner.status = 'STOP'
                    
                    // Прекращение подачи аккаунтов в майнинг
                    ipcRenderer.send( 'planner_command', 'STOP' )

                    $('a.javascript-playment-run').removeAttr('disabled')
                    $('a.javascript-playment-stop').removeAttr('disabled')
                    $('a.javascript-playment-stop').attr("disabled", "disabled")

                },

                // Изменение параметра - переодичность отправки аккаунта в работу
                selectWindowInterval: function( element ){     
                    let value = $( element ).val()
                    UI.settings.account_interval = value
                    ipcRenderer.send('set_meta', {
                        key: 'count_opened_window',
                        value: value
                    })
                },

                // Изменение параметра - Максимальное количество потоков майнинга
                selectAccountInterval: function( element ){
                    let value = $( element ).val()
                    UI.settings.count_opened_window = value
                    ipcRenderer.send('set_meta', {
                        key: 'account_interval',
                        value: value
                    })                      
                }

            },
    
            // Сбор и обработка списка под ожидание
            building_work_listing: accounts => {

                // console.log('planner_data -> building_wait_listing', accounts );

                let list = accounts.filter( acc => acc.bender.status.mining == true )
                    list = list.filter( acc => acc.status == 'active' )

                    // Сортировка по времени старта
                    list.sort( ( a, b ) => {
                        if ( a.bender.timeout < b.bender.timeout ) return 1 
                        if ( a.bender.timeout > b.bender.timeout ) return -1
                        return 0
                    })
					
                let groups_grid = UI.groups.get_grid()

                // console.log('planner_data -> building_work_listing', list );

                UI.helpers.tpl('layouts/home/list_work.twig', { 
                    items: list,
                    groups: groups_grid,
                    lang: UI.lang
                }).then( html => {
                    $('.javascript-list-work').html( html )
                })

            },

            // Сбор и обработка списка под процесс майнинга
            building_wait_listing: accounts => {

                // console.log('planner_data -> building_wait_listing', accounts );

                let list = accounts.filter( acc => acc.bender.status.mining == false )
                    // list = list.filter( acc => acc.bender.status.mining == false )

                    // list = list.filter( acc => acc.cpu >= acc.maxCPU )
                    // list = list.filter( acc => acc.session_token )

                    list = list.filter( acc => acc.status == 'active' )
                    
                    // Сортировка по времени старта
                    list.sort( ( a, b ) => {
                        if ( a.climetime > b.climetime ) return 1 
                        if ( a.climetime < b.climetime ) return -1
                        return 0
                    })
                    
                let groups_grid = UI.groups.get_grid()

                // console.log('planner_data -> building_wait_listing', list );

                UI.helpers.tpl('layouts/home/list_wait.twig', { 
                    items: list,
                    groups: groups_grid,
                    lang: UI.lang
                }).then( html => {
                    $('.javascript-list-wait').html( html )
                })

            },

            // Просмотр информации аккаунта
            show_account_modal: wax_login => {

            },

            // Просмотр информации аккаунта ( Который находится в процессе майнинга )
            show_account_modal_worked: wax_login => {

            }

        },

        // Кнопочная навигация
        tools: {
           
            // Засекретить конфидициальные данные
            hidden_btn: elm => {
                if( $( elm ).hasClass('checked') ){
                    $( elm ).removeClass('checked')
                    $( elm ).find('i').removeClass('fa-eye')
                    $( elm ).find('i').addClass('fa-eye-slash')
                    $('body').addClass('text-blur')
                }else{
                    $( elm ).addClass('checked')
                    $( elm ).find('i').removeClass('fa-eye-slash')
                    $('body').removeClass('text-blur')
                    $( elm ).find('i').addClass('fa-eye')
                }
            },

            // Открыть Страницу с кошельком 
            wallet: ( wax_login ) => {
                ipcRenderer.send( 'wallet_auth', wax_login )
            },

            // Получить новый сессион токен для аккаунта
            session_token: ( wax_login ) => {
                ipcRenderer.send( 'session_token', wax_login )
            },

            // Интерактивные элементы
            interactive: () => {

                $('[data-toggle=tooltip]').tooltip()

                // Обработка ссылок
                $('body').on('click', 'button[external], a[external]', function( event ){
                    event.preventDefault()
                    ipcRenderer.send( 'link', $(this).attr('external') )
                    return false
                })
                
                // Попытка сохранить настройки
                $('form#form-settings').on('submit', function( e ){
                    e.preventDefault()
                    let data = $(this).serializeArray()
                    if( UI.planner.status === 'STOP' ){
                        ipcRenderer.invoke('save_settings', data).then( response => {
                            if( response.status === 'success' ){

                                $('.javascript-status-settings').text( response.message )

                                // Проработка ключа токена
                                UI.tools.access_token( true )

                            }
                        })
                    }

                    else{
                            
                        UI.helpers.alert( 'error', UI.lang.registry.no_saved )

                    }
                    return false
                })

                // Попытка загрузить список групп
                $('#import-groups').on('change', function( evt ){
                    var files = evt.target.files
                    var f = ( files.length > 0 ) ? files[0] : false;
                    if( f !== false ){
                        var reader_item = new FileReader();
                        reader_item.readAsArrayBuffer( f )
                        reader_item.onload = (function (f) {
                            return async function (e){
                                
                                let wb = new Excel.Workbook();
                                var buffer = reader_item.result;

                                wb.xlsx.load(buffer).then( async workbook => {

                                    let workSheet = workbook.getWorksheet("groups");
                                    let count = workSheet.actualRowCount

                                    let columns = workSheet.getRow(1).values
                                    let rows = workSheet.getRows(2, count)

                                    Promise.all(rows.map( row => {
                                        var add = {}
                                        row.values.map( ( e, i ) => {
                                            var set_value = e
                                                set_value = ( {}.toString.call( e ) === '[object Number]' ) ? Number( e ) : set_value
                                                set_value = ( {}.toString.call( e ) === '[object Object]' ) ? '' : set_value
                                                set_value = ( {}.toString.call( e ) === '[object Array]' ) ? '' : set_value
                                                set_value = ( {}.toString.call( e ) === '[object String]' ) ? set_value.toString() : set_value
                                                console.log( '----', columns[i], e, {}.toString.call( e ), set_value );
                                            add[columns[i]] = set_value 
                                        })
                                        if( add.id !== undefined ){
                                            return add
                                        }
                                    }))
                                    .then( async results => {
                                        var results = results.filter( element => element !== null && element !== undefined )

                                        ipcRenderer.invoke( 'groups_import', results ).then( response => {
                                            if( response.status === 'success' ){
                                                UI.groups.get_list( true )
                                            }
                                        })

                                    })

                                })
                                
                            }
                        })(f);
                    }
                })

                // Попытка загрузить список аккаунтов
                $('#import-accounts').on('change', function( evt ){
                    var files = evt.target.files
                    var f = ( files.length > 0 ) ? files[0] : false;
                    if( f !== false ){
                        var reader_item = new FileReader();
                        reader_item.readAsArrayBuffer( f )
                        reader_item.onload = (function (f) {
                            return async function (e){

                                let wb = new Excel.Workbook();
                                var buffer = reader_item.result;

                                wb.xlsx.load(buffer).then( async workbook => {

                                    let workSheet = workbook.getWorksheet("accounts");
                                    let count = workSheet.actualRowCount

                                    let columns = workSheet.getRow(1).values
                                    let rows = workSheet.getRows(2, count)

                                    Promise.all(rows.map( row => {
                                        var add = {}
                                        row.values.map( ( e, i ) => {
                                            var set_value = e
                                                set_value = ( {}.toString.call( e ) === '[object Number]' ) ? Number( e ) : set_value
                                                set_value = ( {}.toString.call( e ) === '[object Object]' ) ? '' : set_value
                                                set_value = ( {}.toString.call( e ) === '[object Array]' ) ? '' : set_value
                                                set_value = ( {}.toString.call( e ) === '[object String]' ) ? set_value.toString() : set_value
                                            add[columns[i]] = set_value 
                                        })
                                        if( add.wax_login ){
                                            return add
                                        }
                                    }))
                                    .then( async results => {
                                        
                                        var results = results.filter( element => element !== null && element !== undefined )

                                        UI.helpers.is_account_insert( results.length ).then( iai => {

                                            // Если можно добавлять аккаунты....
                                            if( iai ){

                                                ipcRenderer.invoke( 'accounts_import', results ).then( response => {
                                                        
                                                    // Пересборка списка
                                                    UI.accounts.get_list( true )
                                                                
                                                    // Сонхронизация списка аккаунтов
                                                    UI.accounts.sync_accountList()
                                                
                                                })

                                                .catch( () => {

                                                    // Пересборка списка
                                                    UI.accounts.get_list( true )
                                                                
                                                    // Сонхронизация списка аккаунтов
                                                    UI.accounts.sync_accountList()
                                                    
                                                })

                                            }

                                            // Упёрлись в лимит
                                            else{
                                                UI.helpers.alert('error', UI.lang.registry.limited )
                                            }

                                        })

                                    })
 
                                })
                                     
                            }
                        })(f);
                    }
                })

                // Поиск аккаунта в списке
                $('input#account-search').on('keyup', function() {
                    var value = $(this).val()
                    var acc = UI.accounts.list.slice(0)
                    var list = acc.map( it => it.wax_login )
                    if( value.length > 1 ){
                        $(`.javascript-listingContent-accounts tr[data-waxlogin]`).addClass('d-none')
                        list = list.filter( it => {
                            if( it.indexOf( value ) > -1 ){
                                $(`.javascript-listingContent-accounts tr[data-waxlogin="${it}"]`).removeClass('d-none')
                            }
                        })
                    }else{                        
                        $(`.javascript-listingContent-accounts tr[data-waxlogin]`).removeClass('d-none')
                    }
                })

            },

            // Проверка токена для доступа
            access_token: ( build = true ) => {
                ipcRenderer.invoke('access_token').then( info => {
                    if( info.status !== undefined && info.status === 'success' ){
                        UI.access_data = info.result
                        UI.access_data.status = 'on'
                    }else{
                        UI.access_data = { status: 'off' }
                    }
                    if( build ){
                        UI.tools.access_token_rebuild()
                    }
                })
            },

            // Переделка интерфейса под текущию среду доступа
            access_token_rebuild: () => {

                let title = `AlienBot PRO ★ ${UI.lang.pages.home.title}`
                let content = `
                    <p class="mb-0 w-100">${UI.lang.registry.no}</p>
                    <button external="https://alienbot.fun/account/nodes/form" class="btn btn-sm btn-success">${UI.lang.registry.no_btn}</button>
                `

                if( UI.access_data.status === 'on' ){
                    title = 'AlienBot PRO ★ ' + UI.access_data.header
                    content = `
                        <p class="mb-0 w-100">${UI.lang.registry.ok} ${UI.access_data.count} <span class="ml-2 mr-2">  ★  </span> ${UI.lang.registry.ok2} ${UI.access_data.balance} WAX</p>
                        <button external="https://alienbot.fun/account/nodes/form/${UI.access_data.hash}" class="btn btn-sm btn-success" >${UI.lang.registry.ok_btn}</button>
                    `
                }

                $('title').text( title )
                $('.javascript-status_bar').html( content )

            }

        },

        // Вспомогательные инструменты
        helpers: {

            // Получение/Рендеринг и храннения файлов шаблона
            tpl_list: [],
            tpl: async ( pathname, data ) => {

                let _ = UI.helpers

                const tplstring_1 = await new Promise((resolve, reject) => {
                    let isisset = _.tpl_list.filter( e => e.name === pathname );
                    if ( isisset.length == 0 ) {
                        ipcRenderer.invoke( 'tpl', { tplname: pathname } ).then( tplstring => {
                            _.tpl_list.push({ name: pathname, string: tplstring })
                            resolve( tplstring )
                        })
                    }else{
                        resolve( isisset[0].string );
                    }
                })

                return await new Promise((resolve_1, reject_1) => {
                    let template = Twig.twig({ data: tplstring_1 });
                    // console.log('data', data);
                    let renderer = template.render( data )
                    resolve_1( renderer );
                })

            },

            // Загрузка контента для всплываюшего окна
            ajax: ( pathname, data = {}, callback = false ) => {
                ipcRenderer.invoke( 'tpl', { tplname: pathname } ).then( tplstring => {
                    let template = Twig.twig({ data: tplstring });
                    let content = template.render( data )
                    $('#pageModal .modal-content').html( content )
                    $('#pageModal').modal('show')
                    if( callback ) callback()
                })
            },
            
            // Получение языковых настроек
            lang: async () => {
                ipcRenderer.invoke('lang').then( lang => {
                    UI.lang = lang
                })
            },

            // Получение общих настроек
            settings: async () => {
                ipcRenderer.invoke('settings').then( settings => {
                    UI.settings = settings
                })
            },

            // Показать уведомление с текстом
            alert: ( type, message, completed ) => {
                
                var lang        = UI.lang
                var completed   = completed || false
                var type        = type || 'error'
                var mess        = message || lang.bell.alert.default

                if( type === 'success' ){
                    iziToast.success({
                        title: lang.bell.alert.success,
                        message: mess,
                        position: 'bottomCenter'
                    })
                }

                if( type === 'error' ){
                    iziToast.error({
                        title: lang.bell.alert.error,
                        message: mess,
                        position: 'bottomCenter'
                    })
                }

                if( completed ){
                    completed()
                }

            },

            // Показать уведомление с подтверждением
            confirm: ( answer, callback, buttons ) => {
                
                var lang        = UI.lang
                var answer      = answer || 'Вопрос?'
                var btns        = buttons || lang.bell.confirm.buttons;
                var callback    = callback || function( status ){
                    if( status === true  ) {}
                    if( status === false ) {}
                }

                iziToast.show({
                    theme:      'dark',
                    icon:       'icon-person',
                    title:      lang.bell.confirm.header,
                    message:    answer,
                    position:   'center', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
                    progressBarColor: 'rgb(0, 255, 184)',
                    buttons: [
                        ['<button>'+btns[0]+'</button>', function (instance, toast) {
                            instance.hide({
                                transitionOut: 'fadeOutUp',
                                onClosing: function(instance, toast, closedBy){
                                    callback(true);
                                }
                            }, toast, 'buttonName');
                        }, true],
                        ['<button>'+btns[1]+'</button>', function (instance, toast) {
                            instance.hide({
                                transitionOut: 'fadeOutUp',
                                onClosing: function(instance, toast, closedBy){
                                    callback(false);
                                }
                            }, toast, 'buttonName');
                        }]
                    ]
                })

                return true

            },
            
            // Вернуть время в таймстамп
            time: () => {
                return (Math.round(new Date().getTime()/1000)) 
            },

            // Вернуть отформатированную дату
            timetoFormat: ( timestamp ) => {        
                var d = new Date( timestamp * 1000 )
                var date = {
                    d : d.getDate() < 10 ? '0'+d.getDate() : d.getDate(),
                    m : d.getMonth() < 10 ? '0'+d.getMonth() : d.getMonth(),
                    y : d.getFullYear(),
                    h : d.getHours() < 10 ? '0'+d.getHours() : d.getHours(),
                    i : d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes()
                }
                return `${date.d}.${date.m}.${date.y} ${date.h}:${date.i}`        
            },

            // Можно ли еще добавить НН ое колво аккаунтов....
            is_account_insert: async function( setCount = false ){

                // Если есть рабочий доступ ...
                if( UI.access_data.status !== undefined && UI.access_data.status === 'on' ){
                    
                    if( setCount !== false ){
                        // ( +setCount ) Переданное колво аккаунтов < Допустимого ( При импорте )
                        return ( setCount < UI.access_data.count ) ? true : false;
                    }
                    
                    else{
                        // ( +1 ) Текущее колво аккаунтов < Допустимого ( При добавлении )
                        return ( Number( UI.accounts.list.length ) < Number( UI.access_data.count ) ) ? true : false;
                    }

                }
                
                // Если рабочего доступа нет...
                else{
                    return false
                }  
            }

        },

        // Работа со списком групп
        groups : {

            // Получение и хранение списка
            list: [],
            get_list: ( rendered = false ) => {
                ipcRenderer.invoke( 'groups' ).then( groups => {
                    // console.log('ipcRenderer.invoke( groups )', groups );
                    UI.groups.list = groups
                    if( rendered ){
                        UI.groups.rendered()
                    }
                })
            },

            // Удаление группы из списка
            delete: ( group_id, rendered = true ) => {
                UI.helpers.confirm( UI.lang.pages.group.listing_js_removed, function( ok ){
                    if( ok ){
                        ipcRenderer.invoke( 'groups_remove', group_id ).then( groups => {
                            UI.groups.list = groups
                            if( rendered ){
                                UI.groups.rendered()
                            }
                        })
                    }
                })           
            },

            // Сформировать и получить сетку групп
            get_grid: () => {
                let groups_grid = {}
                UI.groups.list.map( g => {
                    groups_grid[ g.id ] = g.header
                })
                return groups_grid
            },

            // Пересобрать сисок в интерфейсе
            rendered: () => {
                UI.helpers.tpl('layouts/groups/listing.twig', { 
                    groups: UI.groups.list,
                    lang: UI.lang
                }).then( html => {
                    $('.javascript-listingContent-groups').html( html )
                    $('[data-toggle=tooltip]').tooltip()
                })
            },

            // Попытка имортировать список групп
            import : () => {
                UI.helpers.confirm( UI.lang.pages.group.js_isImportant, function( ok ){
                    if( ok ){
                        $('#import-groups').trigger('click')
                    }
                })
            },

            // Поытка экспортировать список групп
            export: async () => {

                ipcRenderer.invoke( 'groups' ).then( groups => {
                    if( groups.length > 0 ){

                        var workbook = new Excel.Workbook();
                        var worksheet = workbook.addWorksheet('groups');
                        
                        let columns = []
                        let shemaGroupsKeys = Object.keys( shema.groups )
                            shemaGroupsKeys.forEach( kk => {
                                columns.push({
                                    header: kk, key: kk,width: 10
                                })
                            })
                        worksheet.columns = columns

                        Promise.all(groups.map( gr => {
                            worksheet.addRow( gr )
                        }))
                        .then( async () => {

                            let fileData = await workbook.xlsx.writeBuffer();
                            ipcRenderer.send( 'download', { fileName: 'alienbot-groups-export.xlsx', fileData: fileData } )

                        })
                                                
                    }
                })

            },
                        
            // Добавить/Изменить новую группу
            edit: ( group_id = 0 ) => {

                let item = UI.groups.list.find( gr => +gr.id == group_id ) || {}
                let header = item.id !== undefined ? UI.lang.pages.group.header_edit : UI.lang.pages.group.header_create

                UI.helpers.ajax( 'layouts/groups/forma.twig', { 
                    header: header,
                    item: item,
                    lang: UI.lang 
                }, () => {
                    $('input[name=worktime]').inputmask('99:99-99:99')
                    $('form#form-group').on('submit', function( e ){
                        e.preventDefault()

                        let is_created = +$('input[name=id]').val() > 0 ? false : true
                        let data = $(this).serializeArray()

                        ipcRenderer.invoke( 'group_edit', { is_created:is_created, data: data } ).then( response => {

                            $('form#form-group .javascript-status').text( response.mess )

                            // Обновление+рендеринг списка
                            UI.groups.get_list( true )
                            
                            // Спрятать окошко
                            $('#pageModal').modal('hide')

                        })

                        return false

                    })
                })
            },

            // Скачивание шаблона для групп
            export_pattern: () => {
                ipcRenderer.send( 'download_file', { 
                    fileName: 'alienbot-groups-pattern.xlsx', 
                    filePath: 'data/alienbot-groups-pattern.xlsx', 
                    fileExt: '.xlsx'
                })
            }

        },

        // Работа со списком аккаунтов
        accounts : {
            
            // Получение и хранение списка
            list: [],
            get_list: ( rendered = false ) => {
                ipcRenderer.invoke( 'accounts' ).then( accounts => {
                    UI.accounts.list = accounts
                    if( rendered ){
                        UI.accounts.rendered()
                    }
                })
            },

            // Удаление аккаунта из списка
            delete: ( wax_login, rendered = true ) => {
                UI.helpers.confirm( UI.lang.pages.accounts.js_isRemoved, function( ok ){
                    if( ok ){
                        ipcRenderer.invoke( 'account_remove', wax_login ).then( accounts => {
                            UI.accounts.list = accounts

                            // Пересбор списка аккаунтов
                            if( rendered ){
                                UI.accounts.rendered()
                            }

                            // Сонхронизация списка аккаунтов
                            UI.accounts.sync_accountList()

                        })
                    }
                })           
            },

            // Пересобрать сисок в интерфейсе
            rendered: () => {
                UI.helpers.tpl('layouts/accounts/listing.twig', { 
                    accounts: UI.accounts.list,
                    groups: UI.groups.list,
                    groups_grid: UI.groups.get_grid(),
                    lang: UI.lang
                }).then( html => {
                    $('.javascript-listingContent-accounts').html( html )
                    $('[data-toggle=tooltip]').tooltip()
                })
            },
            
            // Поытка экспортировать список аккаунтов
            export: async () => {

                ipcRenderer.invoke( 'accounts' ).then( accounts => {
                    if( accounts.length > 0 ){

                        var workbook = new Excel.Workbook();
                        var worksheet = workbook.addWorksheet('accounts');
                        
                        let columns = []
                        let shemaAccountsKeys = Object.keys( shema.accounts )
                            shemaAccountsKeys.forEach( kk => {
                                columns.push({
                                    header: kk, key: kk,width: 10
                                })
                            })
                        worksheet.columns = columns

                        Promise.all(accounts.map( acc => {
                            worksheet.addRow( acc )
                        }))
                        .then( async () => {

                            let fileData = await workbook.xlsx.writeBuffer();
                            ipcRenderer.send( 'download', { fileName: 'alienbot-accounts-export.xlsx', fileData: fileData } )

                        })
                        
                    }
                })

            },

            // Попытка имортировать список аккаунтов
            import : () => {
                UI.helpers.confirm( UI.lang.pages.accounts.js_isImportant, function( ok ){
                    if( ok ){
                        $('#import-accounts').trigger('click')
                    }
                })
            },

            // Скачивание шаблона для аккаунтов
            export_pattern: () => {
                ipcRenderer.send( 'download_file', { 
                    fileName: 'alienbot-accounts-pattern.xlsx', 
                    filePath: 'data/alienbot-accounts-pattern.xlsx', 
                    fileExt: '.xlsx' 
                })
            },

            // Добавить/Изменить новый аккаунт
            edit: async ( wax_login = false ) => {

                let groups = UI.groups.list
                let item = UI.accounts.list.find( acc => acc.wax_login == wax_login ) || {}
                let ids = UI.accounts.list.map( acc => acc.wax_login ) || []
                let header = item.wax_login !== undefined ? UI.lang.pages.accounts.edited : UI.lang.pages.accounts.created

                UI.helpers.ajax( 'layouts/accounts/forma.twig', { 
                    header: header,
                    item: item,
                    groups: groups,
                    settings: UI.settings,
                    lang: UI.lang
                }, () => {

                    $('form#form-account').on('submit', function( e ){
                        e.preventDefault()
                        
                        let is_created = $(this).attr('data-iscreted')
                        let data = $(this).serializeArray()

                        let item_data = data.find( item => item.name == 'wax_login' )
                        let isset_list = ( ids.indexOf( item_data.value ) === -1 ) // true - если нет повторения по списку

                        if ( 

                            // Если это добавление, и логин уникален для списка
                            ( is_created === 'created' && item_data.value !== '' && isset_list )
                             | 
                            // Если это редактирование, и логин изменился ( Но все-же он уникален для списка )
                            ( is_created !== 'created' && is_created !== item_data.value && isset_list )
                             | 
                            // Если это редактирование, и логин НЕ изменился
                            ( is_created !== 'created' && is_created === item_data.value )
                            
                        ) {

                            UI.helpers.is_account_insert().then( iai => {
                                
                                // Если можно добавлять аккаунты....
                                if( iai ){

                                    ipcRenderer.invoke( 'account_edit', { is_created:is_created, data: data } ).then( response => {

                                        $('form#form-account .javascript-status').text( response.mess )

                                        // Обновление+рендеринг списка
                                        UI.accounts.get_list( true )

                                        // Спрятать окошко
                                        $('#pageModal').modal('hide')

                                        // Сонхронизация списка аккаунтов
                                        UI.accounts.sync_accountList()

                                    })

                                }

                                // Упёрлись в лимит
                                else{
                                    UI.helpers.alert('error', UI.lang.registry.limited )
                                }

                            })

                        }
                        
                        else{
                            $('body .modal-content').animate({ scrollTop: $('input[name="wax_login"]').offset().top }, {
                                duration: 370,
                                easing: "linear"
                            })
                            $('input[name="wax_login"]').css('outline', '1px solid red')
                            setTimeout(() => { $('input[name="wax_login"]').css('outline', 'none') }, 3000);
                        }

                        return false

                    })
                })
            },

            // Изменение заголовка блока при изменении режима авторизации
            check_tokenMode: elm => {
                let title = $( elm ).attr('data-title')
                    $('.javascript-block-title').text( title )
                return true
            },

            // Синхронизация списка аккаунтов с сервером alienbot
            sync_accountList : async () => {

                $('#server-preload').removeClass('d-none')
                try {
                    ipcRenderer.invoke( 'accounts' ).then( accounts_list => {

                        let accounts = [] /* [ 'abcde.wam', 'edscv.wam', .. ] */
                        if( accounts_list.length > 0 ){
                            accounts = accounts_list.map( acc => acc.wax_login )
                        }
                           
                        fetch(`https://api.alienbot.fun/accounts`, {
                            method: 'post',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: UI.settings.token, accounts: accounts })
                        })
                        .then( res => res.json() )
                        .then( r => {
                            $('#server-preload').addClass('d-none')
                            return r; // { status: 'success' }
                        }) 

                        .catch( err => {
                            $('#server-preload').addClass('d-none')
                            return { status: 'error', message: 'Server not fount' }
                        })

                    })
                    .catch( err => {
                        $('#server-preload').addClass('d-none')
                        return { status: 'error', message: 'Server not fount' }
                    })
                } catch (error) {
                    $('#server-preload').addClass('d-none')
                    return { status: 'error', message: 'Undefined error' }
                }        

            }

        }

    });

    UI.init()


})


// $('body .status-bar-item').on('click', () => {
//     ipcRenderer.send('asynchronous-message', 'ping')
// })

// ipcRenderer.on('worked_list', (event, data) => {
//     console.log( 'worked_list', data );
// });

// ipcRenderer.on('sessions_list', (event, data) => {
//     console.log( 'sessions_list', data );
// });

// Прослушивать ....
// ipcRenderer.on('asynchronous-message', (event, data) => {
    // Выполнять ...

// Что то сообщить на сервер ...
// ipcRenderer.send('asynchronous-message', 'ping')

// Что то отправить и дождаться ответа... принять его
// ipcRenderer.invoke('my-invokable-ipc', [...args]).then( result => {
//     console.log( 'result', result );
// })

