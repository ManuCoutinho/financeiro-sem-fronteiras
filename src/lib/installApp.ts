/**
 * How this device can install the app:
 * - `installed`: already running from the home screen.
 * - `prompt`: the browser offered its install dialog (Chrome, Edge, Samsung Internet on Android).
 * - `ios`: iPhone and iPad have no install dialog; it is done from the Share menu.
 * - `manual`: other browsers install from their own menu, if at all.
 */
export type InstallMode = 'installed' | 'prompt' | 'ios' | 'manual';
export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const STANDALONE_QUERY = '(display-mode: standalone)';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let wasInstalled = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Call once at startup: the browser fires its install offer before the Mais tab ever loads. */
export function listenForInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Keeps Chrome's mini-infobar away; the Mais tab offers the install instead.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    wasInstalled = true;
    notify();
  });
}

export function subscribeToInstallMode(listener: () => void) {
  listeners.add(listener);
  const standalone = window.matchMedia?.(STANDALONE_QUERY);
  standalone?.addEventListener?.('change', listener);
  return () => {
    listeners.delete(listener);
    standalone?.removeEventListener?.('change', listener);
  };
}

function isRunningInstalled() {
  const isIosHomeScreen = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return wasInstalled || isIosHomeScreen || window.matchMedia?.(STANDALONE_QUERY).matches === true;
}

function isIos() {
  // iPadOS reports itself as a Mac, but Macs have no touch screen.
  const isIpad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || isIpad;
}

export function getInstallMode(): InstallMode {
  if (isRunningInstalled()) return 'installed';
  if (deferredPrompt) return 'prompt';
  if (isIos()) return 'ios';
  return 'manual';
}

/** Opens the browser's install dialog. The offer can be used only once. */
export async function promptInstall(): Promise<InstallOutcome> {
  const prompt = deferredPrompt;
  if (!prompt) return 'unavailable';
  deferredPrompt = null;
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  notify();
  return outcome;
}
