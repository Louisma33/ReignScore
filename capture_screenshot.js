const puppeteer = require('puppeteer');

const devices = [
    { name: 'iPhone_14', width: 390, height: 844 },
    { name: 'iPhone_SE', width: 375, height: 667 },
    { name: 'Pixel_7', width: 412, height: 915 },
    { name: 'iPad', width: 820, height: 1180 }
];

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('Browser launched. Processing devices...');

        for (const device of devices) {
            console.log(`\nProcessing ${device.name}...`);
            const page = await browser.newPage();

            // Set viewport for the specific device
            await page.setViewport({ width: device.width, height: device.height });

            console.log(`Navigating to http://localhost:8082 for ${device.name}...`);
            // Increased timeout to 90s for slow bundling
            await page.goto('http://localhost:8082', { waitUntil: 'networkidle0', timeout: 90000 });

            // Wait for app to fully render logic
            await new Promise(r => setTimeout(r, 3000));

            const filename = `preview_${device.name}.png`;
            console.log(`Taking screenshot: ${filename}...`);
            await page.screenshot({ path: filename, fullPage: true });
            console.log(`✅ Screenshot saved to ${filename}`);

            await page.close();
        }

        console.log('\nAll screenshots completed successfully.');
        await browser.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
