// Polyfill for localStorage in Node 25+ environments for Expo static rendering
console.log('--- Polyfill Node.js Wrapper Loaded ---');

if (typeof global !== 'undefined') {
    // Check if localStorage exists and is broken (Node 25 experimental storage)
    // or if it doesn't exist.
    const isLocalStorageBroken =
        typeof localStorage !== 'undefined' &&
        (typeof localStorage.getItem !== 'function');

    const isLocalStorageMissing = typeof localStorage === 'undefined';

    if (isLocalStorageBroken || isLocalStorageMissing) {
        console.log('--- Polyfilling localStorage ---');

        const noop = () => { };
        const mockStorage = {
            getItem: () => null,
            setItem: noop,
            removeItem: noop,
            clear: noop,
            key: () => null,
            length: 0,
        };

        try {
            if (isLocalStorageBroken) {
                // Try to override global getter
                Object.defineProperty(global, 'localStorage', {
                    value: mockStorage,
                    writable: true,
                    configurable: true
                });
            } else {
                global.localStorage = mockStorage;
            }
            console.log('--- localStorage Polyfilled Successfully ---');
        } catch (err) {
            console.warn('--- Failed to Polyfill localStorage ---', err);
        }
    } else {
        console.log('--- localStorage looks fine, skipping polyfill ---');
    }
}
