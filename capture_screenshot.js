const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('Launching browser...');
        // Launch browser - headless: 'new' is the new mode
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('Browser launched. Opening new page...');
        const page = await browser.newPage();

        // Set viewport to resemble a desktop or tablet
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to http://localhost:8081...');
        // Increased timeout to 60s for slow bundling
        await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('Page loaded. Taking screenshot...');
        await page.screenshot({ path: 'local_preview.png', fullPage: true });

        console.log('Screenshot saved to local_preview.png');
        await browser.close();
    } catch (error) {
        console.error('Error taking screenshot:', error);
        process.exit(1);
    }
})();
