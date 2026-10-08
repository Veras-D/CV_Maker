import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useBodyScrollLock, getActiveLockCount, resetScrollLockForTesting } from './useBodyScrollLock';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderTestHook(isLocked: boolean) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const TestComponent: React.FC<{ locked: boolean }> = ({ locked }) => {
    useBodyScrollLock(locked);
    return null;
  };

  act(() => {
    root.render(React.createElement(TestComponent, { locked: isLocked }));
  });

  return {
    rerender: (nextLocked: boolean) => {
      act(() => {
        root.render(React.createElement(TestComponent, { locked: nextLocked }));
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
}

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    resetScrollLockForTesting();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    resetScrollLockForTesting();
  });

  it('does nothing when isLocked is false', () => {
    const hook = renderTestHook(false);
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
    expect(getActiveLockCount()).toBe(0);
    hook.unmount();
  });

  it('locks body and html overflow when isLocked is true and restores on unmount', () => {
    const hook = renderTestHook(true);

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(getActiveLockCount()).toBe(1);

    hook.unmount();
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
    expect(getActiveLockCount()).toBe(0);
  });

  it('restores original pre-existing overflow on cleanup', () => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'visible';

    const hook = renderTestHook(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    hook.unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('visible');
  });

  it('handles multiple concurrent locks via reference counting', () => {
    const hook1 = renderTestHook(true);
    expect(getActiveLockCount()).toBe(1);
    expect(document.body.style.overflow).toBe('hidden');

    const hook2 = renderTestHook(true);
    expect(getActiveLockCount()).toBe(2);
    expect(document.body.style.overflow).toBe('hidden');

    hook1.unmount();
    // Still locked because hook2 is active
    expect(getActiveLockCount()).toBe(1);
    expect(document.body.style.overflow).toBe('hidden');

    hook2.unmount();
    // Now fully unlocked
    expect(getActiveLockCount()).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });
});
