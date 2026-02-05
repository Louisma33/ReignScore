const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// iPhone 14 Pro Max Resolution: 1290 x 2796 (approx, logically 430 x 932 @ 3x)
// To get crisp "retina" screenshots, we set deviceScaleFactor to 3
const devices = [
    {
        name: 'iPhone_14_Pro_Max',
        width: 430,
        height: 932,
        deviceScaleFactor: 3,
        mobile: true
    }
];

const WAIT_TIME_MS = 5000; // Increased wait time for assets/fonts to settle
const URL = 'http://localhost:8083';

(async () => {
    console.log('Launching browser for Hi-Res Capture...');
    // Launch puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched. Processing new features screenshots...');

    for (const device of devices) {
        console.log(`\nProcessing ${device.name}...`);
        const page = await browser.newPage();

        // precise viewport with device scale factor for retina quality
        await page.setViewport({
            width: device.width,
            height: device.height,
            isMobile: device.mobile,
            deviceScaleFactor: device.deviceScaleFactor
        });

        // Set User Agent to resemble a real iPhone running iOS 17
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

        try {
            // 1. Home Screen (Dashboard "Project Dial")
            console.log(`Navigating to Home...`);
            await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
            await new Promise(r => setTimeout(r, WAIT_TIME_MS));

            // Wait for specific chart elements if possible, or just extra time
            // Taking a screenshot
            await page.screenshot({ path: `feature_home_${device.name}.png` });
            console.log(`✅ Saved feature_home_${device.name}.png`);

            // 2. Advisor Screen
            console.log(`Navigating to Advisor...`);
            await page.goto(`${URL}/advisor`, { waitUntil: 'networkidle0' });
            await new Promise(r => setTimeout(r, WAIT_TIME_MS));

            // Simulate focus to ensure keyboard doesn't pop up randomly but UI is active
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
