const Imap = require('node-imap')
const simpleParser = require('mailparser').simpleParser
const cheerio = require('cheerio')

login       = ''
password    = ''
host        = 'imap.yandex.ru'

// Подготовка параметров для подключения к серверу
var imap = new Imap({
    user: login,
    password: password,
    host: host,
    port: 993,
    tls: true
});
    
// Объект готов сотрудничать
imap.once('ready', function() {
    
    console.log( __filename, 'mail connect' )

    // Открыть почту( запись разрешена )
    imap.openBox('INBOX', false, function(err, box) {
        if (err) throw err

        console.log( __filename, 'mail search' )
        // Поиск писем от WALLET WAX
        // imap.search([ 'UNSEEN', ['FROM', 'info@wax.io'] ], function(err, results) {
        imap.search([ 'UNSEEN' ], function(err, results) {
            if (err) throw err
                
            console.log( __filename, 'mail result', results.length )
            
            // Если писем нет - закрыть соединение
            if( results.length == 0 ){
                console.log( __filename, 'mail end' )
                imap.end()
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

                            console.log( 'mail: ', mail.subject )

                        })

                    })

                })

                // После прочтения всего списка - завершить соединение с почтой
                f.once('end', function() {
                    
                    console.log( __filename, 'mail imap end')
                    imap.end()

                })

            }
        })
    })
})

// Ошибка при подключении или еще в чём то...
imap.once('error', err => {
    console.log( __filename, 'imap.once error')
})

// Попытка неспеша приконнектиться
imap.connect()

// Cоединение завершается
imap.once('end', () => {
    console.log( __filename, 'imap.once end')
})

// Cоединение закрыто
imap.once('close', err => {
    if( err ) throw err
    global.console.log( __filename, 'imap.once close')
})