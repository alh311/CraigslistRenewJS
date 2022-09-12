require('dotenv').config();
const puppeteer = require('puppeteer');

const loginUrl = 'https://accounts.craigslist.org/login';

(async () => {
    await run();
})();

async function run() {

    // Init the browswer, page, and goto initial page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(loginUrl);

    // Close all pages besides the one we want (e.g. about:blank)
    let itemPages = (await browser.pages()).filter(p => p != page);
    itemPages.forEach(async p => await p.close());

    // Login page
    logPage(await page.title());
    await page.type('#inputEmailHandle', process.env.EMAIL);
    await page.type('#inputPassword', process.env.PASSWORD);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#login')
    ]);

    // Auth Error
    // TODO: better error message and better code structure.
    const hasError = await page.$eval('.submit-onetime-link-button', () => true).catch(() => false);
    if (hasError) {
        console.log('There was an error authenticating.')
        await browser.close();
        return;
    }

    // Account page
    logPage(await page.title());
    const renewButtons = await page.$$('input[value="display"][type="submit"]');

    let count = 0;
    await page.keyboard.down('Shift');
    for (const button of renewButtons) {
        await button.click();
        ++count;
        if (count >= 5) {
            break;
        }
    }
    await page.keyboard.up('Shift');

    // TODO: find a better way to wait on the pages to open before asking browser for all the pages.
    await sleep(1000);

    itemPages = (await browser.pages()).filter(p => p != page);

    console.log(`Pages: ${itemPages.length}`)
    for (const p of itemPages) {
        console.log(await p.$eval('#titletextonly', el => el.innerText));
    }

    await browser.close();
}

function logPage(title) {
    console.log(`Page: ${title}`);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
