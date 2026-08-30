export const openExternalUrl = async (url: string) => {
  if (!url) return;
  const targetUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

  try {
    const tauriWindow = window as unknown as {
      __TAURI_INTERNALS__?: {
        invoke: (cmd: string, args: Record<string, unknown>) => Promise<void>;
      };
    };

    if (tauriWindow.__TAURI_INTERNALS__?.invoke) {
      await tauriWindow.__TAURI_INTERNALS__.invoke('open_external_url', { url: targetUrl });
      return;
    }
  } catch (err) {
    console.warn('Native Tauri URL open failed, falling back to window.open', err);
  }

  window.open(targetUrl, '_blank', 'noopener,noreferrer');
};
