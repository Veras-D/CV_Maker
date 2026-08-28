import React from 'react';
import { 
  Github, 
  Loader2, 
  CheckSquare, 
  Square, 
  Star, 
  GitFork, 
  ExternalLink, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GitHubUserRepo, GitHubUserProfile } from '../../utils/githubScraper';

export interface GitHubTabContentProps {
  usernameInput: string;
  setUsernameInput: (v: string) => void;
  isLoadingRepos: boolean;
  profile: GitHubUserProfile | null;
  repos: GitHubUserRepo[];
  selectedRepoIds: Set<number>;
  onLoadRepos: () => void;
  onToggleRepo: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfirmImport: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const GitHubTabContent: React.FC<GitHubTabContentProps> = ({
  usernameInput,
  setUsernameInput,
  isLoadingRepos,
  profile,
  repos,
  selectedRepoIds,
  onLoadRepos,
  onToggleRepo,
  onSelectAll,
  onDeselectAll,
  onConfirmImport,
  onReset,
  isProcessing
}) => {
  if (!profile || repos.length === 0) {
    return (
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          GitHub Profile URL or Username
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. veras-d or https://github.com/veras-d"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onLoadRepos();
              }
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={onLoadRepos}
            disabled={!usernameInput.trim() || isLoadingRepos}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow whitespace-nowrap"
          >
            {isLoadingRepos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
            <span>Load Repos</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Fetches all your public repositories so you can review and choose exactly which projects to include.
        </p>
      </div>
    );
  }

  const selectedCount = selectedRepoIds.size;

  return (
    <div className="space-y-3">
      {/* User info bar */}
      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-sky-900/60 border border-sky-700/60 flex items-center justify-center text-sky-400 font-bold text-[10px]">
            {profile.login.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-slate-200 block">{profile.name || profile.login}</span>
            <span className="text-[10px] text-slate-500">{repos.length} public repositories</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Change</span>
        </button>
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between text-[11px] px-1">
        <span className="text-slate-400 font-medium">
          Select projects to keep ({selectedCount}/{repos.length}):
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-sky-400 hover:text-sky-300 transition-colors cursor-pointer font-semibold"
          >
            Select All
          </button>
          <span className="text-slate-600">·</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Repos list */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {repos.map((repo) => {
          const isSelected = selectedRepoIds.has(repo.id);
          return (
            <div
              key={repo.id}
              onClick={() => onToggleRepo(repo.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-xs select-none ${
                isSelected
                  ? 'bg-slate-900/90 border-sky-700/60 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70'
              }`}
            >
              <div className="mt-0.5 text-sky-400 shrink-0">
                {isSelected ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-100 truncate">{repo.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                    {repo.fork && (
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <GitFork className="w-2.5 h-2.5" /> Fork
                      </span>
                    )}
                    {repo.stargazers_count !== undefined && repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" /> {repo.stargazers_count}
                      </span>
                    )}
                    {repo.language && (
                      <span className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-[9px]">
                        {repo.language}
                      </span>
                    )}
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-500 hover:text-sky-400 transition-colors p-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {repo.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">{repo.description}</p>
                )}

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {repo.topics.slice(0, 4).map((t) => (
                      <span key={t} className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Import Button */}
      <button
        type="button"
        onClick={onConfirmImport}
        disabled={selectedCount === 0 || isProcessing}
        className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
        )}
        <span>
          Import {selectedCount} Selected Project{selectedCount === 1 ? '' : 's'}
        </span>
      </button>
    </div>
  );
};
