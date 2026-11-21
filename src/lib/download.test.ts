import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { canShareFiles, shareOrDownloadTextFile } from './download';

const share = vi.fn();
const canShare = vi.fn(() => true);
const click = vi.fn();

function setDevice({ isTouch, hasShare }: { isTouch: boolean; hasShare: boolean }) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: isTouch && query === '(pointer: coarse)' }));
  Object.defineProperty(navigator, 'share', { value: hasShare ? share : undefined, configurable: true });
  Object.defineProperty(navigator, 'canShare', { value: hasShare ? canShare : undefined, configurable: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  share.mockResolvedValue(undefined);
  canShare.mockReturnValue(true);
  URL.createObjectURL = vi.fn(() => 'blob:csv');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(click);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('shareOrDownloadTextFile', () => {
  it('opens the share sheet with the file on a phone', async () => {
    setDevice({ isTouch: true, hasShare: true });
    expect(canShareFiles()).toBe(true);

    await shareOrDownloadTextFile('financeiro-2026-11.csv', 'a;b', 'text/csv');

    const [{ files }] = share.mock.calls[0] as [{ files: File[] }];
    expect(files[0]?.name).toBe('financeiro-2026-11.csv');
    expect(click).not.toHaveBeenCalled();
  });

  it('downloads on a computer even when the browser can share', async () => {
    setDevice({ isTouch: false, hasShare: true });
    expect(canShareFiles()).toBe(false);

    await shareOrDownloadTextFile('financeiro-2026-11.csv', 'a;b', 'text/csv');

    expect(share).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalledOnce();
  });

  it('downloads where sharing files is not supported', async () => {
    setDevice({ isTouch: true, hasShare: false });
    await shareOrDownloadTextFile('financeiro-2026-11.csv', 'a;b', 'text/csv');
    expect(click).toHaveBeenCalledOnce();
  });

  it('does nothing else when she closes the share sheet', async () => {
    setDevice({ isTouch: true, hasShare: true });
    share.mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    await shareOrDownloadTextFile('financeiro-2026-11.csv', 'a;b', 'text/csv');
    expect(click).not.toHaveBeenCalled();
  });

  it('falls back to the download when sharing fails', async () => {
    setDevice({ isTouch: true, hasShare: true });
    share.mockRejectedValue(new DOMException('blocked', 'NotAllowedError'));
    await shareOrDownloadTextFile('financeiro-2026-11.csv', 'a;b', 'text/csv');
    expect(click).toHaveBeenCalledOnce();
  });
});
