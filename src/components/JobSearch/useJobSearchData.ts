import { useState, useEffect, useCallback, useRef } from 'react';
import { useCV } from '../../context/CVContext';
import { RemoteJob, JobSearchFiltersState } from '../../types/jobSearch';
import { fetchAllRemoteJobs, getCachedJobs } from '../../utils/jobSearchApi';
import { filterRemoteJobs, isJobAlreadyApplied } from '../../utils/jobFilterEngine';
import { isDynamicYcBusiness, YC_DIRECTORY_UPDATED_EVENT } from '../../utils/dynamicYcService';
import { getClickedJobIds, markJobAsClicked, CLICKED_JOBS_UPDATED_EVENT } from '../../utils/clickedJobsService';
import { extractMinSalaryFromJob } from '../../utils/kanbanUtils';

export const PAGE_SIZE = 12;

let lastFetchTimestamp = 0;
const FRESHNESS_THRESHOLD_MS = 5 * 60 * 1000;

function hasWorldwideJobs(jobs: RemoteJob[] | null): boolean {
  return Boolean(jobs?.some(j => j.region === 'worldwide'));
}

function isCacheSufficient(jobs: RemoteJob[] | null, lastTimestamp: number): boolean {
  if (!jobs || jobs.length < 20) return false;
  const isFresh = lastTimestamp > 0 && Date.now() - lastTimestamp < FRESHNESS_THRESHOLD_MS;
  return isFresh && hasWorldwideJobs(jobs);
}

export function useJobSearchData() {
  const { cvData, applyAndTailorJob } = useCV();

  const [allJobs, setAllJobs] = useState<RemoteJob[]>(() => getCachedJobs() || []);
  const [isLoading, setIsLoading] = useState(() => !hasWorldwideJobs(getCachedJobs()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<RemoteJob | null>(null);
  const [clickedJobIds, setClickedJobIds] = useState<Set<string>>(() => getClickedJobIds());

  const allJobsRef = useRef(allJobs);
  useEffect(() => {
    allJobsRef.current = allJobs;
  }, [allJobs]);

  const [filters, setFilters] = useState<JobSearchFiltersState>({
    query: '',
    postedTime: '1w',
    region: 'worldwide',
    sources: {
      ashby: true,
      greenhouse: true,
      lever: true,
      smartrecruiters: true,
      remotive: true,
      jobicy: true
    },
    minSalary: 0,
    hideApplied: false,
    hideClicked: false,
    employmentType: 'all',
    contractDuration: 'all'
  });

  const loadJobs = useCallback(async (force = false) => {
    const cached = getCachedJobs();

    // Only skip fetching if we already have valid cached data WITH worldwide jobs AND it was fetched fresh in this session
    if (!force && isCacheSufficient(cached, lastFetchTimestamp)) {
      setAllJobs(cached!);
      setIsLoading(false);
      return;
    }

    // Immediately surface cached jobs if present so user sees instant content while refreshing
    if (cached?.length) {
      setAllJobs(cached);
    }

    if (force) {
      setIsRefreshing(true);
    } else if (!hasWorldwideJobs(allJobsRef.current)) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await fetchAllRemoteJobs(true);
      if (data.length > 0) {
        setAllJobs(data);
        lastFetchTimestamp = Date.now();
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadJobs(false);
  }, [loadJobs]);

  useEffect(() => {
    const handleYcUpdate = () => {
      setAllJobs(prev => {
        let changed = false;
        const updated = prev.map(j => {
          const isYc = isDynamicYcBusiness(j.company);
          if (isYc !== j.isYc) {
            changed = true;
            return { ...j, isYc };
          }
          return j;
        });
        return changed ? updated : prev;
      });
    };

    window.addEventListener(YC_DIRECTORY_UPDATED_EVENT, handleYcUpdate);
    return () => window.removeEventListener(YC_DIRECTORY_UPDATED_EVENT, handleYcUpdate);
  }, []);

  useEffect(() => {
    const handleClickedUpdate = () => {
      setClickedJobIds(new Set(getClickedJobIds()));
    };

    window.addEventListener(CLICKED_JOBS_UPDATED_EVENT, handleClickedUpdate);
    return () => window.removeEventListener(CLICKED_JOBS_UPDATED_EVENT, handleClickedUpdate);
  }, []);

  const handleUpdateFilters = (newFilters: JobSearchFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const appliedCount = allJobs.filter(job => isJobAlreadyApplied(job, cvData.kanbanRoles).isApplied).length;
  const clickedCount = allJobs.filter(
    job => clickedJobIds.has(job.id) || isJobAlreadyApplied(job, cvData.kanbanRoles).isApplied
  ).length;

  const filteredJobs = filterRemoteJobs({
    jobs: allJobs,
    filters,
    kanbanRoles: cvData.kanbanRoles,
    clickedJobIds
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSelectJob = useCallback((job: RemoteJob | null) => {
    if (job) {
      markJobAsClicked(job.id);
    }
    setSelectedJob(job);
  }, []);

  const handleApplyAndTailor = (job: RemoteJob) => {
    markJobAsClicked(job.id);
    applyAndTailorJob({
      jobTitle: job.title,
      companyName: job.company,
      location: job.location || 'Remote',
      salary: extractMinSalaryFromJob(job),
      roleUrl: job.url,
      jobDescription: job.descriptionPlain
    });
  };

  return {
    allJobs,
    isLoading,
    isRefreshing,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    selectedJob,
    setSelectedJob: handleSelectJob,
    clickedJobIds,
    markJobAsClicked,
    filters,
    handleUpdateFilters,
    handlePageChange,
    filteredJobs,
    paginatedJobs,
    handleApplyAndTailor,
    loadJobs,
    appliedCount,
    clickedCount,
    kanbanRoles: cvData.kanbanRoles
  };
}
