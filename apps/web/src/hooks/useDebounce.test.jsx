import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useDebounce } from './useDebounce.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDebounce', () => {
  test('returns the first value straight away', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  test('waits for the delay before taking a new value', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } });
    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('ab');
  });

  test('restarts the wait on every change and keeps only the last value', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'c' } });
    rerender({ value: 'co' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'cof' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('c');
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('cof');
  });

  test('uses 300 ms by default', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), { initialProps: { value: 1 } });
    rerender({ value: 2 });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(2);
  });

  test('does not update after unmounting', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'x' },
    });
    rerender({ value: 'y' });
    unmount();
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('x');
    expect(vi.getTimerCount()).toBe(0);
  });
});
