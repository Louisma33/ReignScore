const { google } = require('googleapis');

const PACKAGE_NAME = 'com.williaml33.ReignScore';

async function main() {
    console.log('🔐 Authenticating with Google...');
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    const authClient = await auth.getClient();
    const publisher = google.androidpublisher({ version: 'v3', auth: authClient });

    try {
        // Step 1: Create an edit
        console.log('📝 Creating edit...');
        const editRes = await publisher.edits.insert({ packageName: PACKAGE_NAME });
        const editId = editRes.data.id;
        console.log(`✅ Edit created: ${editId}`);

        // Step 2: Set the release as DRAFT (required for draft apps)
        console.log('📌 Setting version 44 to internal track as DRAFT...');
        await publisher.edits.tracks.update({
            packageName: PACKAGE_NAME,
            editId: editId,
            track: 'internal',
            requestBody: {
                track: 'internal',
                releases: [{
                    name: '1.1.0 (44)',
                    versionCodes: ['44'],
                    status: 'draft',
                    releaseNotes: [{
                        language: 'en-US',
                        text: 'Initial release of ReignScore - your credit building companion.\n\n• Smart credit score tracking with detailed breakdowns\n• AI-powered card rewards optimization\n• Reign Advisor financial assistant\n• Bank account linking via Plaid\n• Budget tracking and analytics\n• Dark web monitoring & identity protection\n• Gamified credit building with Crowns & Rewards'
                    }]
                }]
            }
        });
        console.log('✅ Internal track updated with draft release!');

        // Step 3: Update contact details
        console.log('📧 Updating contact info...');
        await publisher.edits.details.update({
            packageName: PACKAGE_NAME,
            editId: editId,
            requestBody: {
                contactEmail: 'support@reignscore.com',
                contactWebsite: 'https://reignscore.com',
                defaultLanguage: 'en-US',
            }
        });
        console.log('✅ Contact details updated!');

        // Step 4: Update store listing
        console.log('📝 Updating store listing...');
        await publisher.edits.listings.update({
            packageName: PACKAGE_NAME,
            editId: editId,
            language: 'en-US',
            requestBody: {
                title: 'ReignScore',
                shortDescription: 'Master your credit! Track cards, maximize rewards with AI-powered insights.',
                fullDescription: `ReignScore - The Ultimate Credit Score & Rewards Optimization App

Take control of your financial kingdom with ReignScore, the most intelligent credit management app designed for those who demand more from their money.

SMART CREDIT MONITORING
• Real-time credit score tracking with detailed breakdowns
• Understand exactly what affects your score
• Get personalized recommendations to improve your credit health
• Track score changes over time with beautiful visualizations

CARD REWARDS OPTIMIZATION
• Add all your credit cards in one place
• Get AI-powered suggestions on which card to use for every purchase
• Maximize cashback, points, and miles on every transaction
• Never miss a reward opportunity again

INTELLIGENT INSIGHTS
• Reign Advisor: Your personal AI financial assistant
• Spending analysis with category breakdowns
• Budget tracking with smart alerts
• Transaction history with merchant recognition

REIGN GUARD PROTECTION
• Identity monitoring and fraud alerts
• Dark web scanning for your information
• Real-time security notifications
• Peace of mind for your financial data

PREMIUM FEATURES
• Ad-free experience
• Advanced analytics and reports
• Priority customer support
• Exclusive Reign Advisor sessions

SECURITY FIRST
Your data is protected with 256-bit encryption and we never sell your information. Bank-level security meets modern convenience.

GET STARTED FREE
Download ReignScore today and join thousands of users who are maximizing their credit potential. Your reign begins now!

Questions? Contact us at support@reignscore.com
Visit us at https://reignscore.com`,
            }
        });
        console.log('✅ Store listing updated!');

        // Step 5: Commit
        console.log('💾 Committing all changes...');
        await publisher.edits.commit({
            packageName: PACKAGE_NAME,
            editId: editId,
        });
        console.log('');
        console.log('🎉 ===== ALL DONE! =====');
        console.log('✅ AAB version 44 assigned to internal testing (draft)');
        console.log('✅ Store listing updated');
        console.log('✅ Contact info updated');
        console.log('');
        console.log('📋 Remaining manual steps in Play Console:');
        console.log('1. Upload screenshots & feature graphic (in Store Listing > Graphics)');
        console.log('2. Complete Content Rating questionnaire');
        console.log('3. Complete Data Safety form');
        console.log('4. Set App Access info (demo credentials)');
        console.log('5. Add testers to internal testing track');
        console.log('6. Promote from draft → rollout');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();
