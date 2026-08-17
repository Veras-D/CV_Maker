export const openExternalUrl = async (url: string) => {
  if (!url) return;
  const targetUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  
  try {
    // Attempt Tauri v2 native shell opener
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(targetUrl);
  } catch {
    // Browser fallback
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
};
