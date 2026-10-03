import { useState, useEffect } from 'react';
import { useCV } from '../../context/CVContext';
import { RemoteJob, JobSearchFiltersState } from '../../types/jobSearch';
import { fetchAllRemoteJobs } from '../../utils/jobSearchApi';
import { filterRemoteJobs, isJobAlreadyApplied } from '../../utils/jobFilterEngine';

export const PAGE_SIZE = 12;

export function useJobSearchData() {
  const { cvData, applyAndTailorJob } = useCV();

  const [allJobs, setAllJobs] = useState<RemoteJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<RemoteJob | null>(null);

  const [filters, setFilters] = useState<JobSearchFiltersState>({
    query: '',
    postedTime: '1w',
    region: 'worldwide',
    sources: { ashby: true, greenhouse: true, lever: true },
    minSalary: 0,
    hideApplied: false
  });

  const loadJobs = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchAllRemoteJobs(force);
      setAllJobs(data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs(false);
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

  const filteredJobs = filterRemoteJobs({
    jobs: allJobs,
    filters,
    kanbanRoles: cvData.kanbanRoles
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + PAGE_SIZE);

  const handleApplyAndTailor = (job: RemoteJob) => {
    applyAndTailorJob({
      jobTitle: job.title,
      companyName: job.company,
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
    setSelectedJob,
    filters,
    handleUpdateFilters,
    handlePageChange,
    filteredJobs,
    paginatedJobs,
    handleApplyAndTailor,
    loadJobs,
    appliedCount,
    kanbanRoles: cvData.kanbanRoles
  };
}
