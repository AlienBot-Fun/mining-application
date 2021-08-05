// process.on('unhandledRejection',    () => {});
// process.on('rejectionHandled',      () => {});

const path = require('path')
const fs = require('fs')

const puppeteer = require('puppeteer-extra')
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(StealthPlugin())

// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// const { Target } = require('puppeteer')
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const code_email = require( code_email_file )

module.exports = ( account = false, headless_mode = false ) => {

    if( account === false ){
        return new Promise(( resolve, reject ) => {
            resolve( false )
        })
    }

    // Предворительное создание пути до папки с кешем
    let userBrowserUserDir  = path.join( tmp_dir + `/Session_${account.wax_login.replace('.wam', '')}` )
    
    // Предворительное удаление дерриктории с КЭШЕМ
    try {
        fs.rmdirSync( userBrowserUserDir, { maxRetries: 2, recursive: true });
    } catch (error) {
        logger.log('error clear cache', error );
    }

    let session_token = false
    return new Promise(( resolve, reject ) => {
        
        puppeteer.launch({
            userDataDir: userBrowserUserDir,
            defaultViewport: null,
            headless: headless_mode, 
            args: [
                '--start-maximized', 
                '--window-position=120,120', 
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        })
        
        .then( async browser => {

            logger.log( 'Старт процедуры получения токена сессии для аккаунта', account.wax_login )
            const page = await browser.newPage()

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')

            await page.goto('https://all-access.wax.io/')
            await page.waitForTimeout(5000)
            
            let cookies = await page.cookies();
            session_token = cookies.find( coo => coo.name === 'session_token' );
            if( session_token !== undefined && session_token.value !== undefined ){
                logger.log( 'Токен', account.wax_login )
                browser.close().then( () => {
                    resolve( session_token.value )
                })
            }else{

                await page.waitForTimeout(1000)
                            
                const input_log = await page.$("input[name=userName]");
                await input_log.focus();
                await page.keyboard.type( account.username, { delay: 100 });

                const input_pass = await page.$("input[name=password]");
                await input_pass.focus();
                await page.keyboard.type( account.password, { delay: 100 })
                
                await page.waitForTimeout(500)
                const login_submit = await page.$('button.button-primary.full-width.button-large.text-1-5rem.text-bold');
                    login_submit.click()

                await page.waitForTimeout(5000)
                    
                const input_code = await page.$("input[name=code]");
                if( input_code == null ){
                    let cookies = await page.cookies();      
                    logger.log('cookies', cookies);            
                    session_token = cookies.find( coo => coo.name === 'session_token' )
                    browser.close().then( () => {
                        resolve( session_token.value )
                    })
                }else{
                    logger.log('start get code wax')
                    code_email( account.email, account.email_password, account.imap_server, account.imap_port, account.tls ).then( async wax_code => {
                            
                        logger.log('start get code wax -> ', wax_code)
                        
                        const input_code = await page.$("input[name=code]");
                        await input_code.focus();
                        await page.keyboard.type( wax_code, { delay: 100 })
            
                        await page.waitForTimeout(500)
                        const login_submit = await page.$('button.button.primary');
                            login_submit.click()
            
                        await page.waitForTimeout(5000)
                                
                        let cookies = await page.cookies();     
                        session_token = cookies.find( coo => coo.name === 'session_token' )
                        
                        logger.log( 'ssession_token -> ', session_token.value )

                        if( session_token !== false ){
                            browser.close().then( () => {
                                resolve( session_token.value )
                            })
                        }else{
                            browser.close().then( () => {
                                reject()
                            })
                        }
                        
                    }).catch( () => {
                        reject('imap access !!')
                    })
                }

            }

        })
    })
}