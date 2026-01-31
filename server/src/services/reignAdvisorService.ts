import OpenAI from 'openai';
import { query } from '../db';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

export class ReignAdvisorService {

    /**
     * Generates a financial advice response based on user query and context.
     */
    static async getAdvice(userId: string | number, userMessage: string) {
        try {
            // 1. Fetch User Context (Score, recent heavy spending, etc.)
            // We'll fetch basic info to give the AI some "eyes"
            const userRes = await query('SELECT credit_score, first_name FROM users WHERE id = $1', [userId]);
            const user = userRes.rows[0];

            if (!user) throw new Error('User not found');

            // 2. Fetch recent transactions (last 5) to give spending context
            const txRes = await query('SELECT amount, description, category, date FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT 5', [userId]);
            const recentTx = txRes.rows;

            // 3. Construct System Prompt
            const systemPrompt = `
                You are "Reign Advisor", a world-class financial credit coach AI for the app "ReignScore". 
                Your goal is to help users improve their credit score and financial health.
                
                User Context:
                - Name: ${user.first_name}
                - Current Credit Score: ${user.credit_score || 'Unknown'} (FICO 8 model simulation)
                - Recent Activity: ${JSON.stringify(recentTx)}

                Guidelines:
                - Be encouraging, professional, but concise.
                - Focus on "Credit Utilization" (keep under 30%) and "On-time Payments".
                - If asked about "7-Day Rule", explain it: Pay off your balance every 7 days to keep utilization low before the statement cuts.
                - Do not give legal or tax advice. catch-all disclaimer if needed.
                - Keep responses under 3 sentences unless asked for a detailed plan.
            `;

            // 4. Call OpenAI
            // If in dev mode without a key, mock it to save money/errors
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
                return {
                    message: "I am Reign Advisor (Simulation Mode). I see you asked: \"" + userMessage + "\". Since I don't have a real brain (OpenAI Key) yet, I advise you to keep your credit utilization under 10%!",
                    is_simulation: true
                };
            }

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                model: "gpt-4-turbo-preview", // or gpt-3.5-turbo
            });

            return {
                message: completion.choices[0].message.content,
                is_simulation: false
            };

        } catch (error) {
            console.error('[ReignAdvisor] Error:', error);
            throw new Error('Failed to get advice');
        }
    }
}
