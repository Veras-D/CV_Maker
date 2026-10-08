import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JobCard } from './JobCard';
import { RemoteJob } from '../../types/jobSearch';
import { KanbanRole } from '../../types/cv';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockJob: RemoteJob = {
  id: 'job-123',
  title: 'Senior Frontend Engineer',
  company: 'Acme Corp',
  location: 'Remote, US',
  publishedAt: new Date().toISOString(),
  descriptionPlain: 'We are looking for an experienced React developer.',
  url: 'https://example.com/jobs/123',
  source: 'greenhouse',
  region: 'us',
  salarySummary: '$140k - $180k'
};

const appliedRole: KanbanRole = {
  id: 'role-1',
  roleTitle: 'Senior Frontend Engineer',
  company: 'Acme Corp',
  location: 'Remote',
  status: 'applied',
  roleUrl: 'https://example.com/jobs/123',
  dateApplied: '2026-10-01',
  updatedAt: '2026-10-01'
};

function renderJobCard(props: {
  job?: RemoteJob;
  kanbanRoles?: KanbanRole[];
  isClicked?: boolean;
}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <JobCard
        job={props.job || mockJob}
        kanbanRoles={props.kanbanRoles || []}
        isClicked={props.isClicked}
        onSelectJob={() => {}}
        onApplyAndTailor={() => {}}
      />
    );
  });

  return {
    container,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
}

describe('JobCard state and hover classes', () => {
  it('renders unviewed job card with active highlight classes on hover', () => {
    const { container, cleanup } = renderJobCard({ isClicked: false, kanbanRoles: [] });
    const cardEl = container.firstElementChild as HTMLElement;
    const titleEl = container.querySelector('h3') as HTMLElement;
    const descEl = container.querySelector('p') as HTMLElement;

    // Unviewed card container styles
    expect(cardEl.className).toContain('hover:border-sky-500/60');
    expect(cardEl.className).toContain('hover:bg-slate-850');
    expect(cardEl.className).toContain('hover:shadow-lg');

    // Title and description hover styles
    expect(titleEl.className).toContain('text-slate-100');
    expect(titleEl.className).toContain('group-hover:text-sky-400');
    expect(descEl.className).toContain('text-slate-400');
    expect(descEl.className).toContain('group-hover:text-slate-300');

    cleanup();
  });

  it('renders viewed-only job card with subdued classes on resting and hover', () => {
    const { container, cleanup } = renderJobCard({ isClicked: true, kanbanRoles: [] });
    const cardEl = container.firstElementChild as HTMLElement;
    const titleEl = container.querySelector('h3') as HTMLElement;
    const descEl = container.querySelector('p') as HTMLElement;

    // Viewed card stays subdued (opacity-65 resting, opacity-85 hover)
    expect(cardEl.className).toContain('opacity-65');
    expect(cardEl.className).toContain('hover:opacity-85');
    expect(cardEl.className).toContain('hover:border-slate-700/70');
    expect(cardEl.className).toContain('hover:bg-slate-900/50');
    expect(cardEl.className).not.toContain('hover:border-sky-500/60');

    // Title and description remain neutral/dimmed
    expect(titleEl.className).toContain('text-slate-400');
    expect(titleEl.className).toContain('group-hover:text-slate-200');
    expect(descEl.className).toContain('text-slate-500');
    expect(descEl.className).toContain('group-hover:text-slate-400');

    cleanup();
  });

  it('renders applied job card with emerald styling on resting and hover', () => {
    const { container, cleanup } = renderJobCard({ isClicked: false, kanbanRoles: [appliedRole] });
    const cardEl = container.firstElementChild as HTMLElement;
    const titleEl = container.querySelector('h3') as HTMLElement;
    const descEl = container.querySelector('p') as HTMLElement;

    // Applied card has emerald resting and hover styles
    expect(cardEl.className).toContain('border-emerald-900/60');
    expect(cardEl.className).toContain('bg-emerald-950/15');
    expect(cardEl.className).toContain('hover:border-emerald-600/80');
    expect(cardEl.className).toContain('hover:bg-emerald-950/35');
    expect(cardEl.className).toContain('hover:shadow-emerald-950/40');

    // Title hover is emerald
    expect(titleEl.className).toContain('group-hover:text-emerald-400');
    expect(descEl.className).toContain('text-slate-400');

    cleanup();
  });
});
