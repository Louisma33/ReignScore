const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const devices = [
    { name: 'iPhone_14', width: 390, height: 844 }
];

const WAIT_TIME_MS = 3000;
const URL = 'http://localhost:8082';

(async () => {
    console.log('Launching browser...');
    // Launch puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched. Processing new features screenshots...');

    for (const device of devices) {
        console.log(`\nProcessing ${device.name}...`);
        const page = await browser.newPage();
        await page.setViewport({ width: device.width, height: device.height, isMobile: true });
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');

        try {
            // 1. Home Screen (capture Ask AI button)
            console.log(`Navigating to Home...`);
            await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
            await new Promise(r => setTimeout(r, WAIT_TIME_MS));
            await page.screenshot({ path: `feature_home_${device.name}.png` });
            console.log(`✅ Saved feature_home_${device.name}.png`);

            // 2. Advisor Screen
            console.log(`Navigating to Advisor...`);
            await page.goto(`${URL}/advisor`, { waitUntil: 'networkidle0' });
            await new Promise(r => setTimeout(r, WAIT_TIME_MS));
            // Type a message to show interactivity UI state
            // await page.type('input[type="text"]', 'How can I fix my credit?'); 
            // (Skipping typing interaction to minimize flakiness, just capturing UI)
            await page.screenshot({ path: `feature_advisor_${device.name}.png` });
            console.log(`✅ Saved feature_advisor_${device.name}.png`);

            // 3. Referrals Screen
            console.log(`Navigating to Referrals...`);
            await page.goto(`${URL}/referrals`, { waitUntil: 'networkidle0' });
            await new Promise(r => setTimeout(r, WAIT_TIME_MS));
            await page.screenshot({ path: `feature_referrals_${device.name}.png` });
            console.log(`✅ Saved feature_referrals_${device.name}.png`);

        } catch (error) {
            console.error(`Error capturing ${device.name}:`, error);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('All feature screenshots completed.');
})();
