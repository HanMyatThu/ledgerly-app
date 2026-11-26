import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import TextField from './TextField.jsx';

describe('TextField', () => {
  test('labels its input', () => {
    render(<TextField label="Note" defaultValue="" />);
    expect(screen.getByLabelText('Note')).toBeInstanceOf(HTMLInputElement);
  });

  test('passes input props through', () => {
    render(<TextField label="Amount" type="number" step="0.01" placeholder="0.00" />);
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('step', '0.01');
    expect(input).toHaveAttribute('placeholder', '0.00');
  });

  test('reports typing through onChange', async () => {
    function Controlled({ onValue }) {
      const [value, setValue] = useState('');
      return (
        <TextField
          label="Note"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onValue(event.target.value);
          }}
        />
      );
    }
    const onValue = vi.fn();
    render(<Controlled onValue={onValue} />);
    await userEvent.type(screen.getByLabelText('Note'), 'tea');
    expect(onValue).toHaveBeenLastCalledWith('tea');
    expect(screen.getByLabelText('Note')).toHaveValue('tea');
  });

  test('is valid with no error', () => {
    render(<TextField label="Date" />);
    const input = screen.getByLabelText('Date');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  test('marks the input invalid and shows the error', () => {
    render(<TextField label="Date" error="Pick a date" />);
    const input = screen.getByLabelText(/Date/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Pick a date')).toHaveClass('field-error');
  });

  test('links the error message to the input', () => {
    render(<TextField label="Date" error="Pick a date" />);
    expect(screen.getByLabelText(/Date/)).toHaveAccessibleDescription('Pick a date');
  });

  test('keeps extra classes on the field', () => {
    const { container } = render(<TextField label="Note" className="wide" />);
    expect(container.firstChild).toHaveClass('field', 'wide');
  });
});
