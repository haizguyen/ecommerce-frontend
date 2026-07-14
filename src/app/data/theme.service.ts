import { Injectable, signal } from '@angular/core';

/** Possible stored values — `null` means "follow OS preference". */
type StoredTheme = 'dark' | 'light' | null;

/**
 * Signal-based theme service that controls the `.dark` class on `<html>`.
 *
 * Priority on init:
 *  1. `localStorage` value under `aurora-theme` (manual override)
 *  2. `window.matchMedia('(prefers-color-scheme: dark)')` (OS preference)
 *  3. Light mode (fallback)
 *
 * After a manual toggle, OS-preference changes are ignored until the stored
 * value is cleared. When no stored value exists, the service follows the OS.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly STORAGE_KEY = 'aurora-theme';

  private readonly darkSignal = signal<boolean>(false);
  readonly isDark = this.darkSignal.asReadonly();

  private mediaQueryList: MediaQueryList | undefined;

  constructor() {
    this.init();
  }

  // ---- Public API --------------------------------------------------------

  /** Flip between dark and light mode. Persists to localStorage. */
  toggle(): void {
    this.darkSignal.update((v) => !v);
    this.syncClass();
    this.persist();
  }

  // ---- Initialisation ----------------------------------------------------

  private init(): void {
    const stored = this.readStored();

    if (stored === 'dark') {
      this.darkSignal.set(true);
      this.syncClass();
      return;
    }

    if (stored === 'light') {
      this.darkSignal.set(false);
      this.syncClass();
      return;
    }

    // No stored value — follow OS preference
    this.listenToOs();
  }

  // ---- OS preference listener --------------------------------------------

  private listenToOs(): void {
    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkSignal.set(this.mediaQueryList.matches);
    this.syncClass();

    this.mediaQueryList.addEventListener('change', (e: MediaQueryListEvent) => {
      // Only follow OS when no manual override is stored
      if (!this.readStored()) {
        this.darkSignal.set(e.matches);
        this.syncClass();
      }
    });
  }

  // ---- Helpers -----------------------------------------------------------

  private syncClass(): void {
    document.documentElement.classList.toggle('dark', this.darkSignal());
  }

  private persist(): void {
    try {
      localStorage.setItem(
        ThemeService.STORAGE_KEY,
        this.darkSignal() ? 'dark' : 'light',
      );
    } catch {
      // localStorage unavailable (private browsing, SSR, etc.) — silent
    }
  }

  private readStored(): StoredTheme {
    try {
      const v = localStorage.getItem(ThemeService.STORAGE_KEY);
      if (v === 'dark' || v === 'light') return v;
      return null;
    } catch {
      return null;
    }
  }
}
