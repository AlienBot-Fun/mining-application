const Imap = require('node-imap')
module.exports = ( login, password, host, port = false, tls = 'on' ) => {
    return new Promise(( resolve, reject ) => {
        var status = 'error'
        var set_port = ( port !== false ) ? port : settings.imap_port
        var connected = {
            user: login,
            password: password,
            host: host,
            port: set_port,
            tls: ( tls == 'on' ) ? true : false
        }
        var imap = new Imap( connected );
        imap.once('ready', function() {
            status = 'success'
            imap.end()
        })
        imap.once('error', err => {
            resolve( status )
        })
        imap.connect()
        imap.once('end', () => {})
        imap.once('close', err => {
            resolve( status )
        })
    })
}