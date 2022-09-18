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

/** The main app method. */
async function run() {

    // Init the browser, page, and go to the initial page.
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(loginUrl);

    // Close all pages besides the one we want (e.g. about:blank)
    await closeExtraPages(browser, page);

    // Login page
    logPage(await page.title());
    await page.type('#inputEmailHandle', process.env.EMAIL);
    await page.type('#inputPassword', process.env.PASSWORD);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#login')
    ]);

    // Check for an auth error
    if (await hasAuthError(page)) {
        logAuthError();
    }
    else {
        // Account page
        logPage(await page.title());
        await renewItems(browser, page);
    }

    await browser.close();
}

/** Close all pages besides the one we want (e.g. about:blank) */
async function closeExtraPages(browser, page) {
    const itemPages = (await browser.pages())
        .filter(p => p != page);
    itemPages.forEach(async p => await p.close());
}

/** Checks for an authentication error on Craigslist. */
async function hasAuthError(page) {
    return await page.$eval('.submit-onetime-link-button', () => true).catch(() => false);
}

/** Renews any renewable items. */
async function renewItems(browser, page) {
    const renewButtons = await page.$$(`input[value="${buttonValue}"][type="submit"]`);

    let count = 0;
    let itemCount = 0;
    // Use the shift key to open each item in a new window.
    // This allows us to click each button on the account page without having to navigate back after each click.
    await page.keyboard.down('Shift');
    for (const button of renewButtons) {
        await button.click();
        ++itemCount;
        ++count;
        // if (count >= 10) {
        //     break;
        // }
    }
    await page.keyboard.up('Shift');

    // Determine the item page count by filtering the account page out of all pages.
    const itemPageCount = (await getAllPages(browser, itemCount + 1))
        .filter(p => p != page)
        .length;

    logRenewedItems(itemCount, itemPageCount);
}

/** Gets all open pages. */
async function getAllPages(browser, expectedPageCount) {
    const startTime = new Date();
    let currentTime;
    let pages;

    // Continually get the pages in the browser until we have all of them.
    // To prevent an infinite loop, set a time limit and return all pages obtained at that point if the time limit is met.
    do {
        pages = await browser.pages();
        currentTime = new Date();
        // console.log(`iteration: ${currentTime - startTime}, pages ${pages.length}`);
    } while (pages.length < expectedPageCount && currentTime - startTime <= pageLoadWaitMs);

    return pages;
}

// #region Logging
/** Logs the current page's title. */
function logPage(title) {
    console.log(`Page: ${title}`);
}

/** Logs info about the renewed items and any warnings. */
function logRenewedItems(itemCount, itemPageCount) {
    const warningCount = itemCount - itemPageCount;
    console.log(`\nItems renewed: ${itemCount}`);
    console.log(`Warnings: ${warningCount}\n`);

    if (warningCount > 0) {
        console.log('The number of warnings indicate how many items may have failed to renew. Re-run the app or renew manually.\n');
    }
}

/** Logs an auth error with instructions. */
function logAuthError() {
    console.log('\n\nThere was an error authenticating.\n\n'
        + 'If this is your first time using the app, make sure your email and password are correct in the .env file.\n'
        + 'If your email and password are correct, try running the app again. Sometimes Craigslist flags logs authentication attemps as suspicious.\n'
    );
}
// #endregion Logging
