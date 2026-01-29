import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    setTheme: () => { },
    isDark: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useNativeColorScheme();
    // Default to 'dark' to show the Gold theme immediately
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Optional: Only sync if user hasn't manually set it (skipping complexity for now)
        // if (systemScheme) {
        //     setTheme(systemScheme);
        // }
    }, [systemScheme]);

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
