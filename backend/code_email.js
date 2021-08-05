const Imap = require('node-imap')
const simpleParser = require('mailparser').simpleParser
const cheerio = require('cheerio')

module.exports = ( login = '', password = '', host = '', port = false, tls = 'on' ) => {
    
    var set_port = ( port !== false ) ? port : settings.imap_port

    return new Promise(( resolve, reject ) => {
        
        var connected = {
            user: login,
            password: password,
            host: host,
            port: set_port,
            tls: ( tls == 'on' ) ? true : false
        }
        var imap = new Imap( connected );
        
        // Сбор списка кодов от ВАКСа
        var mail_codes = []
        var chech_code = ( trycount = 0 ) => {
            
            logger.log( 'mail connect' )

            // Открыть почту( запись разрешена )
            imap.openBox('INBOX', false, function(err, box) {
                if (err) throw err
    
                logger.log( 'mail search' )
                // Поиск писем от WALLET WAX
                // imap.search([ 'UNSEEN', ['FROM', 'info@wax.io'] ], function(err, results) {
                imap.search([ 'UNSEEN' ], function(err, results) {
                    if (err) throw err
                        
                    logger.log( 'mail result', results.length )
                    
                    // Если писем нет - закрыть соединение
                    if( results.length == 0 ){
                        if( trycount < Number( settings.mail_timeout ) ){
                            trycount++
                            setTimeout(() => {
                                chech_code( trycount )
                            }, 2000)
                        }else{
                            logger.log( 'mail end' )
                            imap.end()
                        }
                    }
                    
                    // Если письма есть - начать их разбор
                    else{
                                                    
                        // Чтение списка результатов ( отмечаем как прочитанное )
                        let f = imap.fetch( results, { bodies: '', markSeen: true } )
    
                        // Разбор вновь поступившего сообщения
                        f.on('message', ( msg, seqno ) => {
                            
                            // Разбор тела сообщения...
                            msg.on('body', function( stream, info ) {
                                
                                // Парсинг кода тела html письма
                                simpleParser(stream, ( err, mail ) => {
    
                                    // Сбор кодов подтверждения в единый массив для последующего разбора
                                    if( mail.subject === 'WAX Login Verification Code' ){
                                        let $ = cheerio.load( mail.html );
                                        try {
                                            var get_code = $('p:contains("Login Verification Code")').next().text() || 0
                                            if( !mail_codes.find( itm => itm.code.toString() === get_code.toString() ) ){
                                                                         
                                                logger.log( 'mail code', get_code.toString() )

                                                mail_codes.push({
                                                    date: new Date( mail.date ).getTime(),
                                                    code: get_code.toString()
                                                })

                                            }
                                        } catch (error) {}
                                    }
    
                                })
    
                            })
    
                        })
    
                        // После прочтения всего списка - завершить соединение с почтой
                        f.once('end', function() {
                            
                            logger.log( 'mail imap end')
                            imap.end()

                        })
    
                    }
                })
            })
        }


        // Объект готов сотрудничать
        imap.once( 'ready', chech_code )
        
        // Ошибка при подключении или еще в чём то...
        imap.once('error', err => {
            logger.log( 'imap.once error', err )
            reject( false )
        })
        
        // Попытка неспеша приконнектиться
        setTimeout( () => {
            imap.connect()
        }, settings.mail_timeout )
    
        // Cоединение завершается
        imap.once('end', () => {
            logger.log( 'imap.once end')
        })
    
        // Cоединение закрыто
        imap.once('close', err => {
            if( err ) throw err
            logger.log( 'imap.once close')

            setTimeout( () => {
                if( mail_codes.length == 0 ){
                    reject( false )
                }

                // Единственное письмо с кодом...
                else if( mail_codes.length == 1 ){
                    logger.log( 'mail code result', mail_codes[0].code )
                    resolve( mail_codes[0].code )
                }
                
                // Несколько писем с кодами....
                else if( mail_codes.length > 1 ){
        
                    mail_codes.sort( ( a, b ) => {
                        if ( a.date > b.date ) return 1 
                        if ( a.date < b.date ) return -1
                        return 0
                    })
                    
                    var code = mail_codes.pop().code

                    logger.log( 'mail code result', code )
                    resolve( code )
        
                }

            }, 1000)   
    
        })
    
    })

}