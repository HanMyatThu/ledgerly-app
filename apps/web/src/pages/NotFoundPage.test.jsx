import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import NotFoundPage from './NotFoundPage.jsx';

describe('NotFoundPage', () => {
  test('names the missing address and links home', async () => {
    render(
      <MemoryRouter initialEntries={['/nowhere']}>
        <Routes>
          <Route path="/" element={<p>Home</p>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText(/nothing at \/nowhere/)).toBeInTheDocument();
    expect(document.title).toBe('Page not found · Ledgerly');
    await userEvent.click(screen.getByRole('link', { name: 'Back to transactions' }));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
