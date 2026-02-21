import OpenAI from 'openai';
import { query } from '../db';

// Initialize OpenAI client (works with both OpenAI and Anthropic-compatible endpoints)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || 'mock-key',
});

// Rate limit: 20 messages per day for free tier
const DAILY_MESSAGE_LIMIT_FREE = 20;
const DAILY_MESSAGE_LIMIT_PREMIUM = 100;

export class ReignAdvisorService {

    /**
     * Get or create a conversation for a user
     */
    static async getOrCreateConversation(userId: string | number) {
        try {
            // Check for an existing conversation from today
            const existing = await query(
                `SELECT id FROM advisor_conversations 
                 WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
                 ORDER BY created_at DESC LIMIT 1`,
                [userId]
            );

            if (existing.rows.length > 0) {
                return existing.rows[0].id;
            }

            // Create a new conversation
            const newConv = await query(
                'INSERT INTO advisor_conversations (user_id) VALUES ($1) RETURNING id',
                [userId]
            );
            return newConv.rows[0].id;
        } catch (error) {
            console.error('[ReignAdvisor] Error managing conversation:', error);
            // Fallback: return null, we'll still work without conversation tracking
            return null;
        }
    }

    /**
     * Check if user has exceeded daily message limit
     */
    static async checkRateLimit(userId: string | number): Promise<{ allowed: boolean; remaining: number }> {
        try {
            // Check subscription status
            const subRes = await query(
                `SELECT plan_type FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
                [userId]
            );
            const isPremium = subRes.rows.length > 0 && subRes.rows[0].plan_type === 'premium';
            const limit = isPremium ? DAILY_MESSAGE_LIMIT_PREMIUM : DAILY_MESSAGE_LIMIT_FREE;

            // Count today's messages
            const countRes = await query(
                `SELECT COUNT(*) as count FROM advisor_messages am
                 JOIN advisor_conversations ac ON ac.id = am.conversation_id
                 WHERE ac.user_id = $1 AND am.role = 'user' AND am.created_at > NOW() - INTERVAL '24 hours'`,
                [userId]
            );
            const count = parseInt(countRes.rows[0]?.count || '0');

            return {
                allowed: count < limit,
                remaining: Math.max(0, limit - count),
            };
        } catch (error) {
            // On error, allow the message (don't block due to rate limit check failure)
            return { allowed: true, remaining: 999 };
        }
    }

    /**
     * Generates a financial advice response based on user query and context.
     * Now with chat history persistence.
     */
    static async getAdvice(userId: string | number, userMessage: string) {
        try {
            // 1. Rate limit check
            const rateCheck = await this.checkRateLimit(userId);
            if (!rateCheck.allowed) {
                return {
                    message: "You've reached your daily message limit. Upgrade to Premium for up to 100 messages per day! 👑",
                    is_simulation: false,
                    rate_limit_exceeded: true,
                    remaining_messages: 0,
                };
            }

            // 2. Fetch User Context
            const userRes = await query(
                'SELECT credit_score, name, email FROM users WHERE id = $1',
                [userId]
            );
            const user = userRes.rows[0];
            if (!user) throw new Error('User not found');

            // 3. Fetch credit card data
            const cardsRes = await query(
                'SELECT issuer, ending_digits, balance, limit_amount, due_day FROM credit_cards WHERE user_id = $1',
                [userId]
            );
            const cards = cardsRes.rows;

            // Calculate utilization 
            const totalBalance = cards.reduce((sum: number, c: any) => sum + parseFloat(c.balance || 0), 0);
            const totalLimit = cards.reduce((sum: number, c: any) => sum + parseFloat(c.limit_amount || 0), 0);
            const utilization = totalLimit > 0 ? ((totalBalance / totalLimit) * 100).toFixed(1) : 'N/A';

            // 4. Fetch recent transactions
            const txRes = await query(
                'SELECT amount, description, category, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
                [userId]
            );
            const recentTx = txRes.rows;

            // 5. Fetch conversation history (last 10 messages for context)
            let conversationHistory: Array<{ role: string; content: string }> = [];
            try {
                const convId = await this.getOrCreateConversation(userId);
                if (convId) {
                    const historyRes = await query(
                        `SELECT role, content FROM advisor_messages 
                         WHERE conversation_id = $1 
                         ORDER BY created_at DESC LIMIT 10`,
                        [convId]
                    );
                    conversationHistory = historyRes.rows.reverse();
                }
            } catch (e) {
                // Non-critical - proceed without history
            }

            // 6. Construct System Prompt
            const systemPrompt = `You are "Reign Advisor", a world-class financial credit coach AI for the app "ReignScore".
Your goal is to help users improve their credit score and financial health.
Be encouraging, professional, and concise. Use emojis sparingly but effectively.

User Context:
- Name: ${user.name || 'User'}
- Current Credit Score: ${user.credit_score || 'Not yet calculated'} (FICO 8 simulation)
- Number of Cards: ${cards.length}
- Total Credit Limit: $${totalLimit.toFixed(2)}
- Total Balance: $${totalBalance.toFixed(2)}
- Credit Utilization: ${utilization}%
- Cards:
${cards.map((c: any) => `  • ${c.issuer} (...${c.ending_digits}): $${c.balance}/$${c.limit_amount} — Due day: ${c.due_day}`).join('\n')}
- Recent Transactions: ${recentTx.length > 0 ? recentTx.map((t: any) => `$${t.amount} at ${t.description} (${t.category})`).join(', ') : 'None recorded'}

Key Guidelines:
- Focus on "Credit Utilization" (keep under 30%, ideally under 10%) and "On-time Payments"
- If asked about the "7-Day Rule", explain: Pay off your balance every 7 days to keep utilization low before the statement cuts
- Provide specific, actionable advice based on the user's actual data
- Do not give legal or tax advice
- Keep responses under 150 words unless asked for a detailed plan
- End responses with an encouraging note`;

            // 7. Check if we have an API key
            const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-key';
            const hasAnthropicKey = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== '';

            if (!hasApiKey && !hasAnthropicKey) {
                // Simulation mode with smart templated responses
                const advice = this.getSimulatedAdvice(userMessage, {
                    name: user.name,
                    score: user.credit_score,
                    utilization: parseFloat(utilization as string) || 0,
                    cards,
                    totalBalance,
                    totalLimit,
                });

                // Save to history even in simulation
                await this.saveMessage(userId, 'user', userMessage);
                await this.saveMessage(userId, 'assistant', advice);

                return {
                    message: advice,
                    is_simulation: true,
                    remaining_messages: rateCheck.remaining - 1,
                };
            }

            // 8. Call AI API
            const messages = [
                { role: 'system' as const, content: systemPrompt },
                ...conversationHistory.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                })),
                { role: 'user' as const, content: userMessage }
            ];

            const completion = await openai.chat.completions.create({
                messages,
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                max_tokens: 500,
                temperature: 0.7,
            });

            const responseText = completion.choices[0].message.content || 'I apologize, I was unable to generate a response. Please try again.';

            // 9. Save both messages to conversation history
            await this.saveMessage(userId, 'user', userMessage);
            await this.saveMessage(userId, 'assistant', responseText);

            return {
                message: responseText,
                is_simulation: false,
                remaining_messages: rateCheck.remaining - 1,
            };

        } catch (error) {
            console.error('[ReignAdvisor] Error:', error);
            throw new Error('Failed to get advice');
        }
    }

    /**
     * Save a message to the conversation history
     */
    static async saveMessage(userId: string | number, role: string, content: string) {
        try {
            const convId = await this.getOrCreateConversation(userId);
            if (convId) {
                await query(
                    'INSERT INTO advisor_messages (conversation_id, role, content) VALUES ($1, $2, $3)',
                    [convId, role, content]
                );
            }
        } catch (error) {
            console.error('[ReignAdvisor] Error saving message:', error);
        }
    }

    /**
     * Get conversation history for a user
     */
    static async getHistory(userId: string | number) {
        try {
            const result = await query(
                `SELECT am.role, am.content, am.created_at
                 FROM advisor_messages am
                 JOIN advisor_conversations ac ON ac.id = am.conversation_id
                 WHERE ac.user_id = $1
                 ORDER BY am.created_at DESC
                 LIMIT 50`,
                [userId]
            );
            return result.rows.reverse();
        } catch (error) {
            console.error('[ReignAdvisor] Error fetching history:', error);
            return [];
        }
    }

    /**
     * Clear conversation history
     */
    static async clearHistory(userId: string | number) {
        try {
            await query(
                `DELETE FROM advisor_conversations WHERE user_id = $1`,
                [userId]
            );
            return true;
        } catch (error) {
            console.error('[ReignAdvisor] Error clearing history:', error);
            return false;
        }
    }

    /**
     * Smart simulated advice when no API key is available
     */
    static getSimulatedAdvice(question: string, context: any): string {
        const q = question.toLowerCase();

        if (q.includes('utilization') || q.includes('usage')) {
            if (context.utilization > 30) {
                return `Your credit utilization is at ${context.utilization.toFixed(0)}%, which is above the recommended 30%. I'd suggest paying down $${(context.totalBalance - (context.totalLimit * 0.1)).toFixed(0)} to get to the ideal 10% utilization range. This could boost your score by 20-50 points! 💪`;
            }
            return `Great news! Your utilization is at ${context.utilization.toFixed(0)}%, which is in a healthy range. Keep it under 30% to maintain a strong score. For the biggest boost, aim for under 10%. 🏆`;
        }

        if (q.includes('improve') || q.includes('raise') || q.includes('boost') || q.includes('increase')) {
            return `Here's your personalized action plan to improve your score:\n\n1. **Keep utilization under 10%** (currently ${context.utilization.toFixed(0)}%)\n2. **Pay all bills on time** — set up autopay for minimum payments\n3. **Use the 7-Day Rule** — pay your balance weekly before the statement closes\n4. **Don't close old cards** — length of credit history matters\n\nFocus on these and you could see a 30-80 point improvement in 2-3 months! 📈`;
        }

        if (q.includes('7-day') || q.includes('seven day') || q.includes('7 day')) {
            return `The **7-Day Rule** is a powerful strategy! Here's how it works:\n\n1. Instead of paying your full balance once a month, pay it every 7 days\n2. This keeps your utilization low when your statement closes\n3. Credit bureaus see low utilization = higher score\n\nWith your $${context.totalBalance.toFixed(0)} balance, paying $${(context.totalBalance / 4).toFixed(0)} weekly would keep your utilization minimal. Start this week! ⚡`;
        }

        if (q.includes('pay') || q.includes('which card')) {
            if (context.cards.length > 0) {
                const highestBalance = context.cards.reduce((a: any, b: any) => parseFloat(a.balance) > parseFloat(b.balance) ? a : b);
                return `I'd recommend focusing on your **${highestBalance.issuer} (...${highestBalance.ending_digits})** first — it has the highest balance at $${highestBalance.balance}. Paying this down will have the biggest impact on your utilization ratio. 🎯`;
            }
            return `Add your credit cards to ReignScore and I can give you a personalized payoff strategy! Start by adding your highest-balance card first.`;
        }

        // Default helpful response
        return `Great question! As your Reign Advisor, here are my top tips:\n\n1. **Monitor your utilization** — currently at ${context.utilization.toFixed(0)}%\n2. **Pay bills on time** — this is 35% of your score\n3. **Keep old accounts open** — credit history length matters\n\nWant me to dive deeper into any of these? Just ask! I'm here to help you reign supreme. 👑`;
    }
}
