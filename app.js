
process.on('unhandledRejection', () => {});
process.on('rejectionHandled', () => {});
var prm = Promise.reject(new Error(' '));
setTimeout(() => { prm.catch((err) => { console.log( err.message ) }) }, 0);

//process.on('unhandledRejection', ( err )    => { });
//process.on('rejectionHandled', ( err )      => { });
// process.on('unhandledRejection', ( err )    => { console.trace('unhandledRejection', err ); });
// process.on('rejectionHandled', ( err )      => { console.trace('rejectionHandled', err ); });

//Promise.reject(new Error(''))
//setTimeout(() => { prm.catch((err)          => { console.trace('prm', err ); }) }, 0)

// process.on('uncaughtException', function (err) {
//     console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
//     console.error(err.stack)
//     process.exit(0)
// })

// environment variable application
require('dotenv').config()

const path              = require('path')
const fs                = require('fs')
const bytenode          = require('bytenode')
const v8                = require('v8')

const { app, BrowserWindow }    = require('electron')
const Twig                      = require('twig')
const TwigElectron              = require('electron-twig')

global.base_dir         = path.join( __dirname )
global.components_dir   = path.join( __dirname, 'components' )
global.frontend_dir     = path.join( __dirname, 'frontend' )
global.backend_dir      = path.join( __dirname, 'backend' )
global.lang_dir         = path.join( __dirname, 'lang' )
global.data_dir         = path.join( __dirname, 'data' )
global.tmp_dir          = path.join( __dirname, 'tmp' )

global.helpers          = require( path.join( components_dir, 'helpers' ) )
global.resources        = require( path.join( components_dir, 'resources' ) )

v8.setFlagsFromString('--no-lazy');

// Если нет файла с аккаунтами - создать пустой
let accounts_file = path.join( data_dir, 'accounts.json' )
let accounts_dist_file = path.join( data_dir, 'accounts.dist.json' )
if( !fs.existsSync( accounts_file ) ) fs.copyFile( accounts_dist_file, accounts_file, () => {} )

// Если нет файла с группами - создать пустой
let groups_file = path.join( data_dir, 'groups.json' )
let groups_dist_file = path.join( data_dir, 'groups.dist.json' )
if( !fs.existsSync( groups_file ) ) fs.copyFile( groups_dist_file, groups_file, () => {} )

// Если нет файла с настройками - создать пустой
let settings_file = path.join( data_dir, 'settings.json' )
let settings_dist_file = path.join( data_dir, 'settings.dist.json' )
if( !fs.existsSync( settings_file ) ) fs.copyFile( settings_dist_file, settings_file, () => {})

if( process.env.LOG_MESSAGE ){
    global.log_message = ( filename = '--', header = '', message = '', params = false ) => {
        console.log( filename, header, message, params );
    }
}else{
    global.log_message = ( th, header, message ) => {
        
    }
}

global.controller_file          = path.join( backend_dir, 'controller.jsc' )
global.scheduler_file           = path.join( backend_dir, 'scheduler.jsc' )
global.bender_file              = path.join( backend_dir, 'bender.jsc' )
global.wallet_file              = path.join( backend_dir, 'wallet.jsc' )
global.token_reddit_file        = path.join( backend_dir, 'token_reddit.jsc' )
global.token_email_file         = path.join( backend_dir, 'token_email.jsc' )
global.code_email_file          = path.join( backend_dir, 'code_email.jsc' )

if( process.env.DEV ){

    // 1.
    bytenode.compileFile( './sources/code_email.src.js',     './backend/code_email.jsc');
    bytenode.compileFile( './sources/token_email.src.js',    './backend/token_email.jsc');
    bytenode.compileFile( './sources/token_reddit.src.js',   './backend/token_reddit.jsc');
    bytenode.compileFile( './sources/wallet.src.js',         './backend/wallet.jsc');
    
    // 2. 
    bytenode.compileFile( './sources/bender.src.js',        './backend/bender.jsc');
    
    // 3.
    bytenode.compileFile( './sources/scheduler.src.js',     './backend/scheduler.jsc');
    
    // 4.
    bytenode.compileFile( './sources/controller.src.js',   './backend/controller.jsc');

    global.sources_dir = path.join( __dirname, 'sources' )

    global.controller_file          = path.join( sources_dir, 'controller.src.js' )
    global.scheduler_file           = path.join( sources_dir, 'scheduler.src.js' )
    global.bender_file              = path.join( sources_dir, 'bender.src.js' )
    global.wallet_file              = path.join( sources_dir, 'wallet.src.js' )
    global.token_reddit_file        = path.join( sources_dir, 'token_reddit.src.js' )
    global.token_email_file         = path.join( sources_dir, 'token_email.src.js' )
    global.code_email_file          = path.join( sources_dir, 'code_email.src.js' )

}

// Расширения для ТВИГа
require( path.join( components_dir, 'twig' ))( Twig )

let mainWindow;

async function createWindow() {

    let settings    = await resources.settings.list()
    let languages   = await resources.languages.list()
    let lang        = await resources.languages.get()

    mainWindow = new BrowserWindow({ 
        width: 730,
        height: 750,
        minWidth: 730,
        minHeight: 750,
        icon: path.join( base_dir, 'icon.ico' ),
        webPreferences: { 
            nodeIntegration: true,
			enableRemoteModule: true
        } 
    });

    if( process.env.DEV === 'TRUE' ){
        mainWindow.openDevTools();
    }else{
        mainWindow.setMenu(null);
    }

    mainWindow.loadFile(`${frontend_dir}/index.twig`)
    TwigElectron.view = {
        settings: settings,
        lang: lang,
        langs: languages
    }
    
    // Закрытие окна
    mainWindow.on('close', data => {
        mainWindow = null;
    });

    require( controller_file )( mainWindow )

}

// Нажали - закрыть приложение
app.on('window-all-closed', data => {
    if ( process.platform !== 'darwin' ) app.quit()
});

// Запуск по готовности...
app.on('ready', createWindow);