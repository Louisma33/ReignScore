module.exports = {
    preset: "jest-expo",
    forceExit: true,
    setupFilesAfterEnv: [
        "@testing-library/jest-native/extend-expect",
        "<rootDir>/jest.setup.js"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ],
    testMatch: [
        "**/__tests__/**/*.test.[jt]s?(x)",
        "**/*.test.[jt]s?(x)"
    ],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverageFrom: [
        "components/**/*.{ts,tsx}",
        "services/**/*.{ts,tsx}",
        "utils/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "!**/*.d.ts",
        "!**/node_modules/**"
    ],
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 30,
            lines: 30,
            statements: 30
        }
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1"
    },
    testEnvironment: "node"
};
