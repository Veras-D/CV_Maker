import { useState } from 'react';
import { IngestionSourceType } from './IngestionSourceTabs';
import { 
  ingestFromLinkedin, 
  ingestFromWebsite, 
  parseRawResumeText, 
  ingestFromFile, 
  IngestionResult 
} from '../../utils/ingestionService';
import { ingestFromGitHubRepos } from '../../utils/githubScraper';

export function useIngestionState() {
  const [activeTab, setActiveTab] = useState<IngestionSourceType>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubRepos, setGithubRepos] = useState<string[]>([]);
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<IngestionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddGitHubRepo = () => {
    const trimmed = githubInput.trim();
    if (trimmed && !githubRepos.includes(trimmed)) {
      setGithubRepos(prev => [...prev, trimmed]);
      setGithubInput('');
      setErrorMessage('');
    }
  };

  const handleRemoveGitHubRepo = (idx: number) => {
    setGithubRepos(prev => prev.filter((_, i) => i !== idx));
  };

  const executeTabFetch = async (): Promise<IngestionResult> => {
    if (activeTab === 'file') {
      if (!selectedFile) throw new Error('Please select or drop a CV file first.');
      return ingestFromFile(selectedFile);
    }
    if (activeTab === 'github') {
      const trimmed = githubInput.trim();
      const reposToFetch = trimmed && !githubRepos.includes(trimmed) ? [...githubRepos, trimmed] : githubRepos;
      if (reposToFetch.length === 0) {
        throw new Error('Please add at least one GitHub project repository (e.g. owner/repo).');
      }
      return ingestFromGitHubRepos(reposToFetch);
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
    githubRepos,
    githubInput,
    setGithubInput,
    handleAddGitHubRepo,
    handleRemoveGitHubRepo,
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
