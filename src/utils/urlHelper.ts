export const openExternalUrl = (url: string) => {
  if (!url) return;
  const targetUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
};
