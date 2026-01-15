import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    setTheme: () => { },
    isDark: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useNativeColorScheme();
    const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

    useEffect(() => {
        if (systemScheme) {
            setTheme(systemScheme);
        }
    }, [systemScheme]);

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
