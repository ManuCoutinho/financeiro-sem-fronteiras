const REVOKE_DELAY_MS = 1000;
const TOUCH_SCREEN_QUERY = '(pointer: coarse)';

export function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Safari reads the blob after click() returns, so revoking right away cancels the download.
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

function toFile(fileName: string, content: string, mimeType: string) {
  return new File([content], fileName, { type: mimeType });
}

/**
 * True on phones and tablets that can hand a file to the system share sheet. Desktops keep the
 * plain download, which is what people expect there.
 */
export function canShareFiles(): boolean {
  if (typeof navigator.canShare !== 'function' || typeof navigator.share !== 'function') return false;
  if (!window.matchMedia?.(TOUCH_SCREEN_QUERY).matches) return false;
  try {
    return navigator.canShare({ files: [toFile('probe.csv', '', 'text/csv')] });
  } catch {
    return false;
  }
}

/**
 * Opens the share sheet (Save to Files, WhatsApp, e-mail…) where supported, otherwise downloads.
 * In an installed iPhone app a download only opens a preview, so sharing is the clearer path.
 */
export async function shareOrDownloadTextFile(fileName: string, content: string, mimeType: string) {
  if (!canShareFiles()) {
    downloadTextFile(fileName, content, mimeType);
    return;
  }
  try {
    // Files only: on iOS an extra title or text is sent as a separate message next to the file.
    await navigator.share({ files: [toFile(fileName, content, mimeType)] });
  } catch (error) {
    // Closing the share sheet is not an error; anything else falls back to the download.
    if (error instanceof DOMException && error.name === 'AbortError') return;
    downloadTextFile(fileName, content, mimeType);
  }
}
