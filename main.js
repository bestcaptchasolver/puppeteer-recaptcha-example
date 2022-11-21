// Setup
// -------------------------------
// npm install bestcaptchasolver
// npm install puppeteer

const bcs = require("bestcaptchasolver");
const pup = require("puppeteer");

const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'

// set access token
bcs.set_access_token(ACCESS_TOKEN)

const login = 'carmen';
const password = 'pasSw0rd';

async function main() {
    const balance = await bcs.account_balance()
    console.log('Balance: $' + balance)
    console.log('Solving recaptcha...');
    let captchaID = await bcs.submit_recaptcha({
        page_url: 'https://bestcaptchasolver.com/automation/login',
        site_key: '6LfGJmcUAAAAALGtIb_FxC0LXm_GwOLyJAfbbUCN'
    });
    // retrieve the token using the ID
    const response = await bcs.retrieve_captcha(captchaID)
    console.log('Captcha solved')
    if (response.status === 'error') {
        console.log('Error occurred: ', response.error)
        return
    }
    if (!response.gresponse) {
        console.log('Unknown error')
        return
    }

    console.log('Starting browser...')
    const browser = await pup.launch({
        executablePath: '/usr/bin/chromium',
        headless: false
    })

    console.log('Creating new tab')
    const tab = await browser.newPage()

    console.log('Changing window size')
    await tab.setViewport({width: 1360, height: 1000})

    console.log('Loading target page...')
    await tab.goto('https://bestcaptchasolver.com/automation/login', {waitUntil: "networkidle0"})
    console.log('Page loaded')

    console.log('Filling login input')
    await tab.$eval('#user', (element, login) => {
        element.value = login
    }, login)

    console.log('Filling password input')
    await tab.$eval('#password', (element, password) => {
        element.value = password
    }, password)

    console.log('Setting g-response in page...')
    await tab.$eval('#g-recaptcha-response', (element, token) => {
        element.value = token
    }, response.gresponse)

    console.log('Submitting form with gresponse...')
    await Promise.all([
        tab.click('.btn-dark'),
        tab.waitForNavigation({waitUntil: "networkidle0"})
    ])

    console.log('Taking screenshot...')
    await tab.screenshot({path: 'screenshot.png'})

    await browser.close();
    console.log('Browser closed')
}

main()
