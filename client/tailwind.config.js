/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                "cr-black": "#000000",
                "cr-gold": "#D4AF37",
                "cr-card": "#1A1A1A",
                "cr-text": "#FFFFFF",
                "cr-muted": "#A0A0A0",
            },
        },
    },
    plugins: [],
}
