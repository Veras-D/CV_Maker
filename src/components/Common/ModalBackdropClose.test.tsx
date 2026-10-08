import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ProModal } from './ProModal';
import { DeleteConfirmationModal } from '../Kanban/DeleteConfirmationModal';
import { KanbanRoleModal } from '../Kanban/KanbanRoleModal';
import { JobDetailModal } from '../JobSearch/JobDetailModal';
import { TrackedCompaniesModal } from '../JobSearch/TrackedCompaniesModal';
import { KanbanRole } from '../../types/cv';
import { RemoteJob } from '../../types/jobSearch';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockRole: KanbanRole = {
  id: 'role-123',
  roleTitle: 'Fullstack Engineer',
  company: 'Linear',
  location: 'Remote',
  status: 'applied',
  dateApplied: '2026-10-01',
  updatedAt: '2026-10-01'
};

const mockJob: RemoteJob = {
  id: 'job-123',
  title: 'Fullstack Engineer',
  company: 'Linear',
  location: 'Remote',
  region: 'worldwide',
  publishedAt: '2026-10-01',
  descriptionPlain: 'Build wonderful things',
  url: 'https://linear.app/careers/123',
  source: 'greenhouse'
};

function setupTestEnvironment() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  return {
    container,
    root,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
      document.body.innerHTML = '';
    }
  };
}

describe('General and Kanban Modals Backdrop & Escape Closing', () => {
  let env: ReturnType<typeof setupTestEnvironment>;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    }));
    env = setupTestEnvironment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.cleanup();
  });

  it('ProModal closes on backdrop click and Escape, but does not close when clicking modal body', () => {
    const handleClose = vi.fn();
    act(() => {
      env.root.render(<ProModal isOpen={true} onClose={handleClose} />);
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();

    const innerCard = dialog.querySelector('.bg-slate-900') as HTMLElement;
    expect(innerCard).toBeTruthy();

    act(() => {
      innerCard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('DeleteConfirmationModal closes on backdrop click and Escape, but ignores inner clicks', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    act(() => {
      env.root.render(
        <DeleteConfirmationModal
          role={mockRole}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      );
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();

    const innerCard = dialog.querySelector('.bg-slate-900') as HTMLElement;
    expect(innerCard).toBeTruthy();

    act(() => {
      innerCard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('KanbanRoleModal closes on backdrop click and Escape, but ignores inner clicks', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    act(() => {
      env.root.render(
        <KanbanRoleModal
          isOpen={true}
          editingRole={null}
          onClose={handleClose}
          onSave={handleSave}
        />
      );
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();

    const innerCard = dialog.querySelector('.bg-slate-900') as HTMLElement;
    expect(innerCard).toBeTruthy();

    act(() => {
      innerCard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

describe('Job Search Modals Backdrop & Escape Closing', () => {
  let env: ReturnType<typeof setupTestEnvironment>;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    }));
    env = setupTestEnvironment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.cleanup();
  });

  it('JobDetailModal closes on backdrop click and Escape, but ignores drawer clicks', () => {
    const handleClose = vi.fn();
    act(() => {
      env.root.render(
        <JobDetailModal
          job={mockJob}
          kanbanRoles={[]}
          onClose={handleClose}
          onApplyAndTailor={() => {}}
        />
      );
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();

    const drawer = dialog.querySelector('.bg-slate-900') as HTMLElement;
    expect(drawer).toBeTruthy();

    act(() => {
      drawer.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).not.toHaveBeenCalled();

    const backdrop = dialog.querySelector('.cursor-pointer') as HTMLElement;
    expect(backdrop).toBeTruthy();
    act(() => {
      backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('TrackedCompaniesModal closes on backdrop click and Escape, but ignores inner clicks', () => {
    const handleClose = vi.fn();
    const handleChanged = vi.fn();
    act(() => {
      env.root.render(
        <TrackedCompaniesModal
          isOpen={true}
          onClose={handleClose}
          onCompaniesChanged={handleChanged}
        />
      );
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();

    const innerModal = dialog.querySelector('.bg-slate-900') as HTMLElement;
    expect(innerModal).toBeTruthy();

    act(() => {
      innerModal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).not.toHaveBeenCalled();

    const backdrop = dialog.querySelector('.cursor-pointer') as HTMLElement;
    expect(backdrop).toBeTruthy();
    act(() => {
      backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleChanged).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handleClose).toHaveBeenCalledTimes(2);
    expect(handleChanged).toHaveBeenCalledTimes(2);
  });
});
