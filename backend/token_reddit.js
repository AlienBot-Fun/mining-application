
// process.on('unhandledRejection', ( err )    => { });
// process.on('rejectionHandled', ( err )      => { });

const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')

// const puppeteer = require('puppeteer-extra')
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(StealthPlugin())

// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// const { Target } = require('puppeteer')
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))


module.exports = ( account, headless_mode = false ) => {

    // Предворительное создание пути до папки с кешем
    let userBrowserUserDir  = path.join( tmp_dir + `/Session_${account.wax_login.replace('.wam', '')}` )
    
    // Предворительное удаление дерриктории с КЭШЕМ
    try {
        fs.rmdirSync( userBrowserUserDir, { maxRetries: 2, recursive: true });
    } catch (error) {
        console.log('error clear cache', error );
    }

    // Предворительное создание пути до папки с кешем
    return new Promise(( resolve, reject ) => {
        
        logger.log( 'reddit start get token from' + account.wax_login + ' headless-mode: ' +  headless_mode ) 
        puppeteer.launch({
            userDataDir: userBrowserUserDir,
            headless: headless_mode, 
            args: [
                '--window-size=1024,768'
            ]
        })
        .then( async browser => {

            const page = await browser.newPage()
            await page.setViewport({ 
                width: 1024, 
                height: 768 
            })

            logger.log( 'next to wallet.wax.io' ) 
            await page.goto('https://wallet.wax.io')
            await page.waitForTimeout( 2000 )
                        
            logger.log( 'next to www.reddit.com/login' ) 
            await page.goto('https://www.reddit.com/login')
            await page.waitForTimeout( 5000 )
            
            // Закрыть всплывашки в обратной последовательности
            let pages_list = await browser.pages()
                pages_list = pages_list.reverse()

            for await( var page_item of pages_list ) {
                if ( !await page_item.isClosed() ) {
                    var url_item = await page_item.url()
                    if ( url_item.indexOf('reddit') === -1 ) {
                        page_item.close()
                    }
                }
            }

            logger.log( 'get cookies www.reddit.com' ) 
            var cookies_reddit = await page.cookies();       
            var session_reddit = cookies_reddit.find( coo => coo.name === 'reddit_session' )
            
            logger.log( 'cookies www.reddit.com ', session_reddit ) 
            if( !session_reddit ){

                logger.log( 'form www.reddit.com' ) 

                let input_log = await page.$("input[name=username]");
                await input_log.focus();
                await page.keyboard.type( account.username, { delay: 100 });
    
                let input_pass = await page.$("input[name=password]");
                await input_pass.focus();
                await page.keyboard.type( account.password, { delay: 100 })
                
                let login_submit = await page.$('button[type=submit]');
                        login_submit.click()
                                
                await page.waitForTimeout( 3000 )
                                
                await page.goto('https://www.reddit.com/login')
                await page.waitForTimeout( 8000 )

                logger.log( page.url() + ' is logined ? reddit.com/login ' + account.wax_login  ) 

                // Если мы еще не на странице авторизованного чувака - значит авторизация неправильная
                if( await page.url().indexOf('reddit.com/login') !== -1 ){

                    logger.log( 'reddit not authorization ' + account.wax_login ) 

                    browser.close().then( () => {
                        reject()
                    })

                }

            }

            // Если всё в порядке ( или прошли только что авторизацию )
            logger.log( 'next page wallet.wax.io ' + account.wax_login )
                                
            await page.goto('https://wallet.wax.io')
            await page.waitForTimeout( 5000 )

            logger.log( 'get cookies wallet.wax.io', session_reddit ) 
            // Есть ли куки внутри...
            var cookies_wax = await page.cookies();  
            var session_wax = cookies_wax.find( coo => coo.name === 'session_token' )
            
            logger.log( 'get cookie wallet.wax.io', session_wax ) 

            // Если куки уже есть....
            if( session_wax !== undefined ){

                logger.log(`session_token getting from ${account.wax_login} = ` + session_wax.value ) 

                browser.close().then( () => {
                    resolve( session_wax.value )
                })

            }

            // Если нужно добывать куки...
            else{

                logger.log( 'click social button reddit' ) 

                // Жмак социаль-реддит
                let social_reddit = await page.$('#reddit-social-btn');
                social_reddit.click()
                await page.waitForTimeout( 5000 )

                logger.log( 'click social button reddit LOGIN' ) 

                // Жмак логин ок на реддит
                let btn_authorize = await page.$('input[name="authorize"]');
                btn_authorize.click()
                await page.waitForTimeout( 15000 )
                                
                // Есть ли куки внутри...
                var cookies_wax = await page.cookies();  
                var session_wax = cookies_wax.find( coo => coo.name === 'session_token' )
                
                logger.log( 'session_wax cookie value', session_wax ) 

                // Если куки уже есть....
                if( session_wax !== false ){

                    logger.log( `session_token getting from ${account.wax_login}`, session_wax.value ) 

                    browser.close().then( () => {
                        resolve( session_wax.value )
                    })

                }

            }
            
        })

    })

}
