// process.on('unhandledRejection',    () => {});
// process.on('rejectionHandled',      () => {});

const path = require('path')
const puppeteer = require('puppeteer')

module.exports = ( account ) => {

    let args = [
        '--start-maximized', 
        '--window-position=120,120', 
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
    ]

    puppeteer.launch({
        userDataDir: path.join( tmp_dir + `/Session_${account.wax_login.replace('.wam', '')}` ),
        headless: false, 
        defaultViewport: null,
        args: args
    })
    
    .then( async browser => {

        const page = await browser.newPage()
            
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
        await page.goto('https://wallet.wax.io', { waitUntil: 'networkidle2' })

        for (let page2 of await browser.pages()) {
            if ( await page2.url() === 'about:blank' ){
                await page2.close()
            }
        }

        await page.waitForTimeout(5000)
        let page_url = await page.url()
        if( page_url.indexOf('all-access.wax.io') > 0 ){
            await page.setCookie({ name: 'session_token', value: account.session_token })
            await page.goto('https://wallet.wax.io')
        }

        if( settings.wallet_aw_tools.toString() === 'on' ){
            
            const page2 = await browser.newPage();        // open new tab
            await page2.goto('https://alienbot.fun/alien_worlds_tools'); 

            await page.waitForTimeout(5000)
            
        }


    })

}