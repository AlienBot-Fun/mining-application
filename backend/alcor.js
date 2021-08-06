// process.on('unhandledRejection',    () => {});
// process.on('rejectionHandled',      () => {});

const path = require('path')
const puppeteer = require('puppeteer')

module.exports = ( account ) => {

    let args = [
        '--start-maximized',
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

        await page.setCookie({ name: 'session_token', value: account.session_token })
        await page.waitForTimeout(5000)

        await page.goto('https://wax.alcor.exchange/swap?output=WAX-eosio.token&input=TLM-alien.worlds', { waitUntil: 'networkidle2' })

    })

}