const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('Browser launched. Opening new page...');
        const page = await browser.newPage();
        // Set viewport to iPhone 14 Pro resolution (approx)
        await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

        const baseUrl = 'http://localhost:8081';

        // Define the 6 key screens for ASO
        const screens = [
            { name: '1_dashboard', path: '/' }, // Main Dashboard
            { name: '2_simulator', path: '/simulator' }, // Score Simulator
            { name: '3_noble_plan', path: '/premium' }, // Noble Membership
            { name: '4_reign_guard', path: '/settings/reign-guard' }, // Dispute Management
            { name: '5_card_optimizer', path: '/(tabs)/insights' }, // Insights/Optimizer (Best approximation)
            { name: '6_rewards', path: '/challenges' } // Research/Gamification
        ];

        for (const screen of screens) {
            const url = `${baseUrl}${screen.path}`;
            console.log(`Navigating to ${screen.name} (${url})...`);

            try {
                // Increased timeout for initial bundle load
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

                // Small delay to ensure animations finish
                await new Promise(r => setTimeout(r, 2000));

                console.log(`Taking screenshot: ${screen.name}.png`);
                await page.screenshot({ path: `${screen.name}.png`, fullPage: false }); // Mobile view usually doesn't need fullPage if viewport is set
            } catch (e) {
                console.error(`Failed to capture ${screen.name}:`, e.message);
            }
        }

        console.log('All screenshots captured.');
        await browser.close();
    } catch (error) {
        console.error('Error running screenshot script:', error);
        process.exit(1);
    }
})();
