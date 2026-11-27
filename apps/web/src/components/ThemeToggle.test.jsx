import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

afterEach(() => delete document.documentElement.dataset.theme);

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
});
