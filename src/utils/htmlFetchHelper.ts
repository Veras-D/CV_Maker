/**
 * Multi-layer HTML fetcher: Native Tauri Rust command with browser proxy fallbacks
 */

async function tryNativeTauriFetch(url: string): Promise<string | null> {
  try {
    const tauriWindow = window as unknown as {
      __TAURI_INTERNALS__?: {
        invoke: (cmd: string, args: Record<string, unknown>) => Promise<string>;
      };
    };

    if (tauriWindow.__TAURI_INTERNALS__?.invoke) {
      const html = await tauriWindow.__TAURI_INTERNALS__.invoke('fetch_url_html', { url });
      if (html && html.trim().length > 0) return html;
    }
  } catch {
    // Native Tauri fetch unavailable in browser mode
  }
  return null;
}

async function tryDirectBrowserFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (res.ok) return await res.text();
  } catch {
    // Browser CORS blocked
  }
  return null;
}

async function tryProxyFetch(url: string): Promise<string | null> {
  const proxyEndpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  for (const proxyUrl of proxyEndpoints) {
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      const text = await res.text();
      if (text.length > 50 && !text.includes('error code: 522')) {
        return text;
      }
    } catch {
      // Try next proxy
    }
  }
  return null;
}

export async function fetchWebsiteHtml(url: string): Promise<string> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  const nativeHtml = await tryNativeTauriFetch(normalizedUrl);
  if (nativeHtml) return nativeHtml;

  const browserHtml = await tryDirectBrowserFetch(normalizedUrl);
  if (browserHtml) return browserHtml;

  const proxyHtml = await tryProxyFetch(normalizedUrl);
  if (proxyHtml) return proxyHtml;

  throw new Error(`Unable to fetch website "${normalizedUrl}". Please check the URL or paste the resume text in the "Text" tab.`);
}
