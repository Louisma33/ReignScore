// Polyfill for localStorage in Node environment (for static rendering)
// Node 25+ or certain environments might expose a partial localStorage object
if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'undefined') {
    const noop = () => { };
    const mockStorage = {
        getItem: () => null,
        setItem: noop,
        removeItem: noop,
        clear: noop,
        key: () => null,
        length: 0,
    };

    // Try to override global localStorage
    try {
        Object.defineProperty(global, 'localStorage', {
            value: mockStorage,
            writable: true,
            configurable: true
        });
    } catch (e) {
        console.warn('Failed to patch localStorage:', e);
    }
}

import 'expo-router/entry';
