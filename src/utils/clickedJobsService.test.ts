import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getClickedJobIds, 
  markJobAsClicked, 
  isJobClicked, 
  clearClickedJobs,
  CLICKED_JOBS_UPDATED_EVENT
} from './clickedJobsService';

describe('clickedJobsService', () => {
  beforeEach(() => {
    clearClickedJobs();
    localStorage.clear();
  });

  it('initially has no clicked jobs', () => {
    expect(getClickedJobIds().size).toBe(0);
    expect(isJobClicked('job-1')).toBe(false);
  });

  it('marks a job as clicked and persists to storage', () => {
    markJobAsClicked('job-123');
    expect(isJobClicked('job-123')).toBe(true);
    expect(getClickedJobIds().has('job-123')).toBe(true);
    expect(isJobClicked('job-456')).toBe(false);
  });

  it('ignores empty job IDs', () => {
    const before = getClickedJobIds().size;
    markJobAsClicked('');
    expect(getClickedJobIds().size).toBe(before);
    expect(isJobClicked('')).toBe(false);
  });

  it('dispatches CLICKED_JOBS_UPDATED_EVENT when marked', () => {
    const listener = vi.fn();
    window.addEventListener(CLICKED_JOBS_UPDATED_EVENT, listener);

    markJobAsClicked('job-event');
    expect(listener).toHaveBeenCalled();

    window.removeEventListener(CLICKED_JOBS_UPDATED_EVENT, listener);
  });

  it('does not re-dispatch or re-save if job is already marked', () => {
    markJobAsClicked('job-dup');
    const listener = vi.fn();
    window.addEventListener(CLICKED_JOBS_UPDATED_EVENT, listener);

    markJobAsClicked('job-dup');
    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(CLICKED_JOBS_UPDATED_EVENT, listener);
  });

  it('loads previously clicked jobs from storage', () => {
    markJobAsClicked('job-abc');
    const ids = getClickedJobIds();
    expect(ids.has('job-abc')).toBe(true);
  });

  it('clears clicked jobs and dispatches update event', () => {
    markJobAsClicked('job-x');
    const listener = vi.fn();
    window.addEventListener(CLICKED_JOBS_UPDATED_EVENT, listener);

    clearClickedJobs();
    expect(listener).toHaveBeenCalled();
    expect(isJobClicked('job-x')).toBe(false);
    expect(getClickedJobIds().size).toBe(0);

    window.removeEventListener(CLICKED_JOBS_UPDATED_EVENT, listener);
  });
});
