require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
    await run();
})();

async function run() {

    // Init the browswer, page, and goto initial page
    const browser = await puppeteer.launch({ headless: false, });
    const page = await browser.newPage();
    await page.goto('https://accounts.craigslist.org/login');

    // Login page
    logPage(await page.title());
    await page.type('#inputEmailHandle', process.env.EMAIL);
    await page.type('#inputPassword', process.env.PASSWORD);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#login')
    ]);


    logPage(await page.title());




    await browser.close();
}

function logPage(title) {
    console.log(`Page: ${title}`);
}