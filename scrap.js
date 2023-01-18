const puppeteer = require('puppeteer');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getVisual() {
  try {
    const URL = 'http://localhost:3006';
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'load' });
    await wait(4000);

    await page.screenshot({ path: 'screenshot.png' });
    // await page.pdf({ path: 'page.pdf' });

    await loadMore(page, 30);
    await wait(35000);
    await browser.close();
  } catch (error) {
    console.error(error);
  }
}

async function loadMore(page, iterations = 1, maxIterations = 10) {
  const array = Array.from({ length: iterations }, (_, i) => i);
  for (const item of array) {
    await autoScroll(page);

    // Click on button with text 'Load more'
    const [button] = await page.$x("//button[contains(., 'Load More')]");
    console.log(button);
    if (!button) {
      break;
    }
    await button.click();
    await autoScroll(page);
    await wait(500);
  }
}

async function autoScroll(page) {
  page.evaluate(() => {
    window.scrollTo(0, window.document.body.scrollHeight + 1000);
  });
}

getVisual();
