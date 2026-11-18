const REVOKE_DELAY_MS = 1000;

export function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Safari reads the blob after click() returns, so revoking right away cancels the download.
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
