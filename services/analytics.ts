import PostHog from 'posthog-react-native';

let posthog: PostHog | undefined = undefined;

export const Analytics = {
    init: async () => {
        if (posthog) return;

        posthog = await (PostHog as any).initAsync(process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_TEST_KEY_REPLACE_ME', {
            host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            flushAt: 1,
            enableSessionReplay: false, // Start simple to save data/perf
        });
    },

    identify: (userId: string | number, traits?: Record<string, any>) => {
        posthog?.identify(userId.toString(), traits);
    },

    reset: () => {
        posthog?.reset();
    },

    track: (event: string, properties?: Record<string, any>) => {
        posthog?.capture(event, properties);
    },

    screen: (screenName: string) => {
        posthog?.screen(screenName);
    }
};
