import React from 'react';
import { JobSearchFilters } from './JobSearchFilters';
import { JobCard } from './JobCard';
import { JobDetailModal } from './JobDetailModal';
import { JobPagination } from './JobPagination';
import { useJobSearchData } from './useJobSearchData';
import { RefreshCw, Briefcase, SearchX } from 'lucide-react';

export const JobSearchTab: React.FC = () => {
  const {
    isLoading,
    isRefreshing,
    currentPage,
    totalPages,
    pageSize,
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
    kanbanRoles,
    allJobs
  } = useJobSearchData();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">
              Remote Job Discovery
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Live public jobs from Ashby, Greenhouse, Lever, SmartRecruiters, Remotive, and Jobicy with contract duration matching and 1-click ATS tailoring.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadJobs(true)}
          disabled={isRefreshing || isLoading}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Jobs'}</span>
        </button>
      </div>

      {/* Filters */}
      <JobSearchFilters
        filters={filters}
        onChangeFilters={handleUpdateFilters}
        totalFound={filteredJobs.length}
        jobs={allJobs}
        appliedCount={appliedCount}
        isLoading={isLoading}
      />

      {/* Job Grid / Loading / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-800 rounded w-24"></div>
                <div className="h-4 bg-slate-800 rounded w-16"></div>
              </div>
              <div className="h-5 bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              <div className="h-10 bg-slate-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <SearchX className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200">
            No remote roles found matching your current filters
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try switching the region from Worldwide to &quot;Any Region&quot;, expanding the posted time filter to &quot;1 Month&quot;, or using the Google ATS search button.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                kanbanRoles={kanbanRoles}
                onSelectJob={setSelectedJob}
                onApplyAndTailor={handleApplyAndTailor}
              />
            ))}
          </div>

          <JobPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Details Modal */}
      <JobDetailModal
        job={selectedJob}
        kanbanRoles={kanbanRoles}
        onClose={() => setSelectedJob(null)}
        onApplyAndTailor={handleApplyAndTailor}
      />
    </div>
  );
};
