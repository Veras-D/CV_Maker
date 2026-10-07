export async function saveToCustomDirectoryIfTauri(
  directory: string | undefined,
  filename: string,
  bytes: Uint8Array | number[]
): Promise<boolean> {
  const tauriWindow = window as unknown as {
    __TAURI_INTERNALS__?: {
      invoke?: (cmd: string, args: Record<string, unknown>) => Promise<unknown>;
    };
  };

  if (directory && tauriWindow.__TAURI_INTERNALS__?.invoke) {
    try {
      await tauriWindow.__TAURI_INTERNALS__.invoke('save_file_to_directory', {
        directory,
        filename,
        bytes: Array.from(bytes)
      });
      return true;
    } catch (e) {
      console.warn('Direct directory save failed, falling back to browser download:', e);
    }
  }
  return false;
}

export async function pickDirectoryFromSystem(): Promise<string | null> {
  const tauriWindow = window as unknown as {
    __TAURI_INTERNALS__?: {
      invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
    };
    showDirectoryPicker?: () => Promise<{ name: string }>;
  };

  if (tauriWindow.__TAURI_INTERNALS__?.invoke) {
    try {
      const selected = await tauriWindow.__TAURI_INTERNALS__.invoke('pick_directory');
      if (typeof selected === 'string' && selected.trim()) {
        return selected.trim();
      }
      return null;
    } catch (e) {
      console.warn('Tauri pick_directory failed:', e);
    }
  }

  if (typeof tauriWindow.showDirectoryPicker === 'function') {
    try {
      const dirHandle = await tauriWindow.showDirectoryPicker();
      if (dirHandle && dirHandle.name) {
        return dirHandle.name;
      }
    } catch {
      // User cancelled picker
    }
  }

  return null;
}
