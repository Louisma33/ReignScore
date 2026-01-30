// Polyfill for localStorage in Node environment (for static rendering)

if (typeof global !== 'undefined') {
    console.log('Polyfill: running...');
    try {
        if (typeof localStorage !== 'undefined') {
            console.log('Polyfill: localStorage exists, type:', typeof localStorage);
            // Try to patch existing object
            try {
                if (typeof localStorage.getItem === 'undefined') {
                    localStorage.getItem = () => null;
                    localStorage.setItem = () => { };
                    localStorage.removeItem = () => { };
                    localStorage.clear = () => { };
                    localStorage.key = () => null;
                    localStorage.length = 0;
                    console.log('Polyfill: Patched existing localStorage');
                }
            } catch (mutateErr) {
                console.warn('Polyfill: Failed to mutate existing localStorage:', mutateErr);
            }
        } else {
            console.log('Polyfill: localStorage missing, creating mock');
            const noop = () => { };
            const mockStorage = {
                getItem: () => null,
                setItem: noop,
                removeItem: noop,
                clear: noop,
                key: () => null,
                length: 0,
            };
            Object.defineProperty(global, 'localStorage', {
                value: mockStorage,
                writable: true,
                configurable: true,
            });
            console.log('Polyfill: Defined global.localStorage');
        }
    } catch (e) {
        console.error('Polyfill: Critical failure:', e);
    }
}
