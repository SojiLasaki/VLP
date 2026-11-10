import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

export type AppearancePreference = 'system' | 'light' | 'dark';

const palettes = {
  light: {
    background: '#f7f9fc', surface: '#ffffff', text: '#101828', secondary: '#667085',
    muted: '#667085', border: '#dce4f0', accent: '#a84300', accentSurface: '#fff2e3',
    error: '#b42318', overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    background: '#151515', surface: '#242424', text: '#f5f5f5', secondary: '#c4c4c4',
    muted: '#b3b3b3', border: '#454545', accent: '#ffac50', accentSurface: '#4d2d0b',
    error: '#ffb4a9', overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export type Palette = typeof palettes.light;
type ThemeContextValue = {
  preference: AppearancePreference;
  dark: boolean;
  palette: Palette;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  setPreference: (value: AppearancePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'appearance-preference-v1';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference>('system');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setHydrated(true);
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === 'light' || value === 'dark' || value === 'system') {
          setPreferenceState(value);
        } else if (value !== null) {
          throw new Error('Invalid saved appearance preference.');
        }
      })
      .catch(() => setError('Could not load appearance settings.'))
      .finally(() => setLoading(false));
  }, []);

  async function setPreference(value: AppearancePreference) {
    setSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value);
      setPreferenceState(value);
      setError(null);
    } catch {
      setError('Could not save appearance settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const dark = preference === 'system' ? hydrated && systemScheme === 'dark' : preference === 'dark';
  return (
    <ThemeContext.Provider value={{ preference, dark, palette: dark ? palettes.dark : palettes.light, loading: loading || saving, initializing: loading, error, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider.');
  return context;
}
