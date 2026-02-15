const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = 'com.williaml33.ReignScore';
const ASSETS_DIR = 'C:\\Users\\1040g\\Downloads\\PlayStoreAssets';

async function main() {
    console.log('🔐 Authenticating with Google...');
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    const authClient = await auth.getClient();
    const publisher = google.androidpublisher({ version: 'v3', auth: authClient });

    try {
        console.log('📝 Creating edit...');
        const editRes = await publisher.edits.insert({ packageName: PACKAGE_NAME });
        const editId = editRes.data.id;
        console.log(`✅ Edit created: ${editId}\n`);

        // Clear ALL existing images first
        const imageTypes = ['icon', 'featureGraphic', 'phoneScreenshots', 'sevenInchScreenshots', 'tenInchScreenshots'];
        for (const type of imageTypes) {
            try {
                await publisher.edits.images.deleteall({
                    packageName: PACKAGE_NAME,
                    editId: editId,
                    language: 'en-US',
                    imageType: type,
                });
                console.log(`🗑️  Cleared existing ${type}`);
            } catch (e) {
                // No existing images, that's fine
            }
        }
        console.log('');

        // Upload Icon (exact 512x512)
        console.log('🖼️  Uploading app icon (512x512)...');
        await publisher.edits.images.upload({
            packageName: PACKAGE_NAME,
            editId: editId,
            language: 'en-US',
            imageType: 'icon',
            media: {
                mimeType: 'image/png',
                body: fs.createReadStream(path.join(ASSETS_DIR, 'app_icon_exact_512.png')),
            },
        });
        console.log('  ✅ Icon uploaded!');

        // Upload Feature Graphic (exact 1024x500)
        console.log('🖼️  Uploading feature graphic (1024x500)...');
        await publisher.edits.images.upload({
            packageName: PACKAGE_NAME,
            editId: editId,
            language: 'en-US',
            imageType: 'featureGraphic',
            media: {
                mimeType: 'image/png',
                body: fs.createReadStream(path.join(ASSETS_DIR, 'feature_graphic_exact.png')),
            },
        });
        console.log('  ✅ Feature graphic uploaded!');

        // Upload Phone Screenshots
        const phoneScreenshots = [
            'phone_screenshot_1_dashboard.png',
            'phone_screenshot_2_simulator.png',
            'phone_screenshot_3_card_optimizer.png',
            'phone_screenshot_4_gamification.png',
        ];
        console.log('📱 Uploading phone screenshots...');
        for (const ss of phoneScreenshots) {
            await publisher.edits.images.upload({
                packageName: PACKAGE_NAME,
                editId: editId,
                language: 'en-US',
                imageType: 'phoneScreenshots',
                media: {
                    mimeType: 'image/png',
                    body: fs.createReadStream(path.join(ASSETS_DIR, ss)),
                },
            });
            console.log(`  ✅ ${ss}`);
        }

        // Upload 7-inch Tablet Screenshots
        const tablet7 = ['tablet_7inch_1_dashboard.png', 'tablet_7inch_2_simulator.png'];
        console.log('📱 Uploading 7" tablet screenshots...');
        for (const ss of tablet7) {
            await publisher.edits.images.upload({
                packageName: PACKAGE_NAME,
                editId: editId,
                language: 'en-US',
                imageType: 'sevenInchScreenshots',
                media: {
                    mimeType: 'image/png',
                    body: fs.createReadStream(path.join(ASSETS_DIR, ss)),
                },
            });
            console.log(`  ✅ ${ss}`);
        }

        // Upload 10-inch Tablet Screenshots
        const tablet10 = ['tablet_10inch_1_dashboard.png', 'tablet_10inch_2_simulator.png'];
        console.log('📱 Uploading 10" tablet screenshots...');
        for (const ss of tablet10) {
            await publisher.edits.images.upload({
                packageName: PACKAGE_NAME,
                editId: editId,
                language: 'en-US',
                imageType: 'tenInchScreenshots',
                media: {
                    mimeType: 'image/png',
                    body: fs.createReadStream(path.join(ASSETS_DIR, ss)),
                },
            });
            console.log(`  ✅ ${ss}`);
        }

        // Commit
        console.log('\n💾 Committing all uploads...');
        await publisher.edits.commit({
            packageName: PACKAGE_NAME,
            editId: editId,
        });

        console.log('');
        console.log('🎉 ===== ALL IMAGES UPLOADED SUCCESSFULLY! =====');
        console.log('✅ App icon (512x512)');
        console.log('✅ Feature graphic (1024x500)');
        console.log('✅ 4 phone screenshots');
        console.log('✅ 2 seven-inch tablet screenshots');
        console.log('✅ 2 ten-inch tablet screenshots');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();
