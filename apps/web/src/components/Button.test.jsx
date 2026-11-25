import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import Button from './Button.jsx';

describe('Button', () => {
  test('renders a primary button that does not submit forms by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('button', 'button-primary');
  });

  test('uses the ghost style and keeps extra classes', () => {
    render(
      <Button variant="ghost" className="edit-button">
        Edit
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveClass('button', 'button-ghost', 'edit-button');
  });

  test('falls back to primary for an unknown variant', () => {
    render(<Button variant="loud">Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('button-primary');
  });

  test('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  test('does not call onClick while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Add
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('submits its form when type is submit', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Send</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
