import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const toast = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Safari';

// installApp keeps the browser's offer in module state, so each test loads a fresh copy.
async function renderButton() {
  const installApp = await import('@/lib/installApp');
  installApp.listenForInstallPrompt();
  const { InstallAppButton } = await import('./InstallAppButton');
  render(<InstallAppButton />);
  return installApp;
}

function offerInstall(outcome: 'accepted' | 'dismissed') {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

function mockStandalone(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
}

describe('InstallAppButton', () => {
  beforeEach(() => {
    vi.resetModules();
    mockStandalone(false);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('opens the browser install dialog when the browser offers it', async () => {
    await renderButton();
    const event = offerInstall('accepted');
    expect(event.defaultPrevented).toBe(true);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Instalar app' })));

    expect(event.prompt).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('App instalado. Abra pelo ícone na tela de início.');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the Share menu steps on an iPhone', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(IPHONE_UA);
    await renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Instalar app' }));

    const dialog = screen.getByRole('dialog', { name: 'Instalar no iPhone' });
    expect(dialog.textContent).toContain('Adicionar à Tela de Início');
  });

  it('points other browsers to their own menu', async () => {
    await renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Instalar app' }));

    const dialog = screen.getByRole('dialog', { name: 'Instalar o app' });
    expect(dialog.textContent).toContain('Abra o menu do navegador');
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('says the app is installed when it runs from the home screen', async () => {
    mockStandalone(true);
    await renderButton();

    expect(screen.getByText('O app já está instalado neste aparelho.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Instalar app' })).toBeNull();
  });

  it('switches to installed once the browser finishes installing', async () => {
    await renderButton();
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(screen.getByText('O app já está instalado neste aparelho.')).toBeTruthy();
  });
});
