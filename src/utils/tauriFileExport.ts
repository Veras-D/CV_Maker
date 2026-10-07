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
