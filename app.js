require('dotenv').config();
const puppeteer = require('puppeteer');

// Craigslist's auth page.
const loginUrl = 'https://accounts.craigslist.org/login';

// This can be set to 'display' for debugging purposes.
const buttonValue = 'display';

// The amount of time to wait for all pages to load after renewing items.
const pageLoadWaitMs = 10000;

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

    // Check for an auth error
    const hasError = await page.$eval('.submit-onetime-link-button', () => true).catch(() => false);
    if (hasError) {
        console.log('\n\nThere was an error authenticating.\n\n'
            + 'If this is your first time using the app, make sure your email and password are correct in the .env file.\n'
            + 'If your email and password are correct, try running the app again. Sometimes Craigslist flags logs authentication attemps as suspicious.'
        );
        await browser.close();
        return;
    }

    // Account page
    logPage(await page.title());
    const renewButtons = await page.$$(`input[value="${buttonValue}"][type="submit"]`);


    let count = 0;
    let pageCount = 1;
    await page.keyboard.down('Shift');
    for (const button of renewButtons) {
        await button.click();
        ++pageCount;
        ++count;
        if (count >= 5) {
            break;
        }
    }
    await page.keyboard.up('Shift');

    itemPages = (await getAllPages(browser, pageCount))
        .filter(p => p != page);

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

async function getAllPages(browser, expectedPageCount) {
    const startTime = new Date();
    let currentTime;
    let pages;

    // Continually get the pages in the browser until we have all of them.
    // To prevent an infinite loop, set a time limit and return all pages obtained at that point if the time limit is met.
    do {
        pages = await browser.pages();
        currentTime = new Date();
    } while (pages.length < expectedPageCount && currentTime - startTime <= pageLoadWaitMs)

    return pages;
}
