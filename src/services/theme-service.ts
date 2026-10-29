/**
 * POLARIS THEME SERVICE
 * Manages light, dark, and system color scheme preferences with persistence and media query listeners.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'polaris-theme';

type ThemeChangeListener = (mode: ThemeMode, resolvedTheme: ResolvedTheme) => void;

class ThemeService {
  private currentMode: ThemeMode = 'system';
  private listeners: Set<ThemeChangeListener> = new Set();
  private mediaQuery: MediaQueryList;

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.init();
  }

  private init(): void {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      this.currentMode = saved;
    } else {
      this.currentMode = 'system';
    }

    this.applyTheme();

    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', () => {
      if (this.currentMode === 'system') {
        this.applyTheme();
      }
    });
  }

  public getMode(): ThemeMode {
    return this.currentMode;
  }

  public getResolvedTheme(): ResolvedTheme {
    if (this.currentMode === 'system') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return this.currentMode;
  }

  public setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    this.applyTheme();
  }

  public toggleTheme(): void {
    const resolved = this.getResolvedTheme();
    this.setMode(resolved === 'dark' ? 'light' : 'dark');
  }

  public subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    // Immediately call listener with current state
    listener(this.currentMode, this.getResolvedTheme());
    return () => this.listeners.delete(listener);
  }

  private applyTheme(): void {
    const resolved = this.getResolvedTheme();
    const root = document.documentElement;

    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-mode', this.currentMode);

    if (resolved === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Notify subscribers
    this.listeners.forEach((listener) => listener(this.currentMode, resolved));
  }
}

export const themeService = new ThemeService();
