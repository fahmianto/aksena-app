const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  
  try {
    console.log("Navigating to http://localhost:5190 ...");
    await page.goto('http://localhost:5190', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log("Page loaded (domcontentloaded). Waiting 5 seconds just in case...");
    await new Promise(r => setTimeout(r, 5000));
  } catch (err) {
    console.log("Nav error:", err.message);
  }
  
  await browser.close();
})();
