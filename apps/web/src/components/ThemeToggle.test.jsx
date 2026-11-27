import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

afterEach(() => {
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

describe('ThemeToggle', () => {
  test('follows the system by default', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  test('sets and clears the theme on <html>', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    await userEvent.click(screen.getByRole('radio', { name: 'Auto' }));
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  test('remembers the choice for the next visit', async () => {
    const { unmount } = render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(localStorage.getItem('ledgerly-theme')).toBe('dark');
    unmount();
    render(<ThemeToggle />);
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
  });

  test('forgets the choice when going back to Auto', async () => {
    localStorage.setItem('ledgerly-theme', 'light');
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Auto' }));
    expect(localStorage.getItem('ledgerly-theme')).toBeNull();
  });

  test('ignores a stored value it does not know', () => {
    localStorage.setItem('ledgerly-theme', 'purple');
    render(<ThemeToggle />);
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeChecked();
  });
});
