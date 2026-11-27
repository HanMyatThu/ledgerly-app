import { useEffect, useState } from 'react';

export const THEME_KEY = 'ledgerly-theme';

// The saved choice, or "system". Storage can be unavailable (private windows,
// blocked site data), so every access is guarded.
export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
}

function saveTheme(theme) {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Not remembered, but still applied for this visit.
  }
}

const OPTIONS = [
  { value: 'system', label: 'Auto', title: 'Follow the system setting' },
  { value: 'light', label: 'Light', title: 'Always light' },
  { value: 'dark', label: 'Dark', title: 'Always dark' },
];

// Applies a theme by setting data-theme on <html>; "system" removes it,
// so the prefers-color-scheme media query in tokens.css decides.
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          title={option.title}
          className={theme === option.value ? 'active' : ''}
          onClick={() => setTheme(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
