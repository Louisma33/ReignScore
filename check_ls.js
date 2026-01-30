console.log(`Node version: ${process.version}`);
try {
    console.log(`localStorage type: ${typeof localStorage}`);
    if (typeof localStorage !== 'undefined') {
        console.log(`localStorage.getItem type: ${typeof localStorage.getItem}`);
        console.log(`localStorage keys: ${Object.keys(localStorage)}`);
    }
} catch (e) {
    console.log('Error accessing localStorage:', e.message);
}
