import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    argbFromHex,
    themeFromSourceColor,
    hexFromArgb
} from '@material/material-color-utilities';

type ThemeContextType = {
    seedColor: string;
    setSeedColor: (color: string) => void;
    isDark: boolean;
    toggleDarkMode: () => void;
    theme: any; // The generated material theme object
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default seed color (Targeting a nice blue/cyan as per original design)
const DEFAULT_SEED_COLOR = '#00d2ff';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [seedColor, setSeedColor] = useState<string>(() => {
        return localStorage.getItem('theme-seed-color') || DEFAULT_SEED_COLOR;
    });

    const [isDark, setIsDark] = useState<boolean>(() => {
        const saved = localStorage.getItem('theme-is-dark');
        if (saved !== null) return JSON.parse(saved);
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [theme, setTheme] = useState<any>(null);

    useEffect(() => {
        // Generate the theme
        const argb = argbFromHex(seedColor);
        const generatedTheme = themeFromSourceColor(argb);
        setTheme(generatedTheme);

        // Apply to CSS variables
        // We manually map specific tokens we want to use to CSS vars for easier usage
        const scheme = isDark ? generatedTheme.schemes.dark : generatedTheme.schemes.light;

        const root = document.documentElement;

        // Helper to set color
        // We strip the alpha part from hex if needed, but hexFromArgb usually returns #RRGGBB
        // We'll set bare RGB values too if we want to use with alpha, but for now simple hex is fine.

        const colors: Record<string, number> = {
            primary: scheme.primary,
            onPrimary: scheme.onPrimary,
            primaryContainer: scheme.primaryContainer,
            onPrimaryContainer: scheme.onPrimaryContainer,
            secondary: scheme.secondary,
            onSecondary: scheme.onSecondary,
            secondaryContainer: scheme.secondaryContainer,
            onSecondaryContainer: scheme.onSecondaryContainer,
            tertiary: scheme.tertiary,
            onTertiary: scheme.onTertiary,
            tertiaryContainer: scheme.tertiaryContainer,
            onTertiaryContainer: scheme.onTertiaryContainer,
            error: scheme.error,
            onError: scheme.onError,
            errorContainer: scheme.errorContainer,
            onErrorContainer: scheme.onErrorContainer,
            background: scheme.background,
            onBackground: scheme.onBackground,
            surface: scheme.surface,
            onSurface: scheme.onSurface,
            surfaceVariant: scheme.surfaceVariant,
            onSurfaceVariant: scheme.onSurfaceVariant,
            outline: scheme.outline,
            outlineVariant: scheme.outlineVariant,
            shadow: scheme.shadow,
            scrim: scheme.scrim,
            inverseSurface: scheme.inverseSurface,
            inverseOnSurface: scheme.inverseOnSurface,
            inversePrimary: scheme.inversePrimary,
        };

        Object.entries(colors).forEach(([key, value]) => {
            // camelCase to kebab-case for css var
            const cssVarName = `--md-sys-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, hexFromArgb(value));
        });

        // Also persist to local storage
        localStorage.setItem('theme-seed-color', seedColor);
        localStorage.setItem('theme-is-dark', JSON.stringify(isDark));

        // Set color-scheme property
        root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');

    }, [seedColor, isDark]);

    const toggleDarkMode = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ seedColor, setSeedColor, isDark, toggleDarkMode, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
