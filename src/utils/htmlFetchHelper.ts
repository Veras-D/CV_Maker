/**
 * Multi-layer HTML fetcher: Native Tauri Rust command with browser proxy fallbacks
 */
export async function fetchWebsiteHtml(url: string): Promise<string> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  // 1. Native Tauri Desktop Invocation (bypasses browser CORS 100% on Linux/Mac/Windows)
  try {
    const tauriWindow = window as unknown as {
      __TAURI_INTERNALS__?: {
        invoke: (cmd: string, args: Record<string, unknown>) => Promise<string>;
      };
    };

    if (tauriWindow.__TAURI_INTERNALS__?.invoke) {
      const nativeHtml = await tauriWindow.__TAURI_INTERNALS__.invoke('fetch_url_html', { url: normalizedUrl });
      if (nativeHtml && nativeHtml.length > 0) {
        return nativeHtml;
      }
    }
  } catch (err: unknown) {
    console.warn('Native Tauri HTTP fetch not available, attempting browser fetch:', err);
  }

  // 2. Direct browser fetch
  try {
    const directRes = await fetch(normalizedUrl);
    if (directRes.ok) {
      return await directRes.text();
    }
  } catch (_err) {
    // Proceed to CORS proxy fallbacks
  }

  // 3. Fallback CORS Proxies (for dev/web browser mode)
  const proxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(normalizedUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(normalizedUrl)}`
  ];

  for (const proxy of proxyUrls) {
    try {
      const proxyRes = await fetch(proxy);
      if (proxyRes.ok) {
        const text = await proxyRes.text();
        if (text && text.length > 50 && !text.includes('error code: 522')) {
          return text;
        }
      }
    } catch (_err) {
      // Continue to next proxy
    }
  }

  throw new Error(`Unable to fetch website "${normalizedUrl}". Please check the URL or paste the resume text in the "Text" tab.`);
}
