import { useEffect, useState } from 'react';

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
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    applyTheme(theme);
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
