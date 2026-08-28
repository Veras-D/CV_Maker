import { useState } from 'react';
import { IngestionSourceType } from './IngestionSourceTabs';
import { 
  ingestFromLinkedin, 
  ingestFromWebsite, 
  parseRawResumeText, 
  ingestFromFile, 
  IngestionResult 
} from '../../utils/ingestionService';
import { 
  fetchUserGitHubRepos, 
  convertSelectedReposToIngestion, 
  GitHubUserProfile, 
  GitHubUserRepo 
} from '../../utils/githubScraper';

export function useIngestionState() {
  const [activeTab, setActiveTab] = useState<IngestionSourceType>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // GitHub specific state
  const [githubUsernameInput, setGithubUsernameInput] = useState('');
  const [isLoadingGitHubRepos, setIsLoadingGitHubRepos] = useState(false);
  const [gitHubProfile, setGitHubProfile] = useState<GitHubUserProfile | null>(null);
  const [gitHubRepos, setGitHubRepos] = useState<GitHubUserRepo[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<number>>(new Set());

  // Other tabs state
  const [linkedinInput, setLinkedinInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<IngestionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLoadGitHubRepos = async () => {
    setErrorMessage('');
    setIsLoadingGitHubRepos(true);
    try {
      const { profile, repos } = await fetchUserGitHubRepos(githubUsernameInput);
      setGitHubProfile(profile);
      setGitHubRepos(repos);
      // Pre-select non-fork repos (or all if none are non-fork)
      const nonForks = repos.filter(r => !r.fork).map(r => r.id);
      const initialSelected = nonForks.length > 0 ? nonForks : repos.map(r => r.id);
      setSelectedRepoIds(new Set(initialSelected));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load GitHub repositories.';
      setErrorMessage(msg);
    } finally {
      setIsLoadingGitHubRepos(false);
    }
  };

  const handleToggleGitHubRepo = (id: number) => {
    setSelectedRepoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllGitHubRepos = () => {
    setSelectedRepoIds(new Set(gitHubRepos.map(r => r.id)));
  };

  const handleDeselectAllGitHubRepos = () => {
    setSelectedRepoIds(new Set());
  };

  const handleResetGitHub = () => {
    setGitHubProfile(null);
    setGitHubRepos([]);
    setSelectedRepoIds(new Set());
    setPreviewResult(null);
    setErrorMessage('');
  };

  const handleConfirmGitHubImport = () => {
    if (!gitHubProfile || selectedRepoIds.size === 0) {
      setErrorMessage('Please select at least one project to import.');
      return;
    }
    const selected = gitHubRepos.filter(r => selectedRepoIds.has(r.id));
    const result = convertSelectedReposToIngestion(gitHubProfile, selected);
    setPreviewResult(result);
    setErrorMessage('');
  };

  const executeTabFetch = async (): Promise<IngestionResult> => {
    if (activeTab === 'file') {
      if (!selectedFile) throw new Error('Please select or drop a CV file first.');
      return ingestFromFile(selectedFile);
    }
    if (activeTab === 'linkedin') {
      return ingestFromLinkedin(linkedinInput.trim());
    }
    if (activeTab === 'website') {
      return ingestFromWebsite(websiteInput.trim());
    }
    return parseRawResumeText(rawTextInput.trim());
  };

  const handleFetch = async () => {
    setErrorMessage('');
    setPreviewResult(null);
    setIsProcessing(true);

    try {
      setPreviewResult(await executeTabFetch());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during ingestion.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedFile,
    setSelectedFile,
    // GitHub
    githubUsernameInput,
    setGithubUsernameInput,
    isLoadingGitHubRepos,
    gitHubProfile,
    gitHubRepos,
    selectedRepoIds,
    handleLoadGitHubRepos,
    handleToggleGitHubRepo,
    handleSelectAllGitHubRepos,
    handleDeselectAllGitHubRepos,
    handleResetGitHub,
    handleConfirmGitHubImport,
    // Other tabs
    linkedinInput,
    setLinkedinInput,
    websiteInput,
    setWebsiteInput,
    rawTextInput,
    setRawTextInput,
    isProcessing,
    previewResult,
    setPreviewResult,
    errorMessage,
    setErrorMessage,
    isSuccess,
    setIsSuccess,
    handleFetch
  };
}
