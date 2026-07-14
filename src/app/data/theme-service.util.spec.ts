/**
 * Unit tests for ThemeService core logic.
 *
 * Jest runs in a `node` environment — no DOM, no Angular DI.  @angular/core
 * ships as ESM, which Jest's CommonJS runner cannot directly parse, so we
 * mock it here.  `signal()` is a pure function (no DI needed), so the mock
 * below is a faithful reimplementation.
 *
 * Browser globals (document, window, localStorage) are installed/removed
 * via Object.defineProperty on globalThis rather than jest.spyOn, because
 * node lacks native getter descriptors for these properties.
 */
jest.mock('@angular/core', () => {
  const signal = ((initial: unknown) => {
    let v = initial;
    const subs = new Set<() => void>();
    const sig: any = () => v;
    sig.set = (n: unknown) => { v = n; subs.forEach((fn) => fn()); };
    sig.update = (fn: (x: unknown) => unknown) => {
      v = fn(v);
      subs.forEach((fn) => fn());
    };
    sig.asReadonly = () => {
      const ro: any = () => v;
      return ro;
    };
    return sig;
  }) as unknown as typeof import('@angular/core')['signal'];
  return {
    signal,
    Injectable: () => () => {},
  };
});

import { ThemeService } from './theme.service';

// ---------------------------------------------------------------------------
// Fake helpers
// ---------------------------------------------------------------------------

function fakeMediaQueryList(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return {
    matches,
    addEventListener: jest.fn(
      (_type: string, listener: (e: MediaQueryListEvent) => void) => {
        listeners.push(listener);
      },
    ),
    /** Fire a synthetic OS-preference change event. */
    _fireChange(m: boolean) {
      listeners.forEach((fn) => fn({ matches: m } as MediaQueryListEvent));
    },
  };
}

function fakeClassList() {
  const tokens = new Set<string>();
  return {
    contains: (t: string) => tokens.has(t),
    toggle: jest.fn((t: string, force?: boolean) => {
      if (force !== undefined) {
        if (force) tokens.add(t);
        else tokens.delete(t);
      } else {
        if (tokens.has(t)) tokens.delete(t);
        else tokens.add(t);
      }
      return tokens.has(t);
    }),
    add: jest.fn((...args: string[]) => args.forEach((a) => tokens.add(a))),
    remove: jest.fn((...args: string[]) =>
      args.forEach((a) => tokens.delete(a)),
    ),
    _value: () => Array.from(tokens),
  };
}

// ---------------------------------------------------------------------------
// Global management
// ---------------------------------------------------------------------------

/** Remember original globals so we can restore in afterEach. */
interface StashedGlobals {
  document: typeof globalThis.document;
  window: typeof globalThis.window;
  localStorage: typeof globalThis.localStorage;
}
let stash: Partial<StashedGlobals> = {};

/**
 * Install a fake `document` on globalThis so ThemeService can call
 * document.documentElement.classList.toggle.
 */
function installDocument(classList: ReturnType<typeof fakeClassList>) {
  stash.document = (globalThis as any).document;
  Object.defineProperty(globalThis, 'document', {
    value: { documentElement: { classList } },
    configurable: true,
    writable: true,
  });
}

/**
 * Install a fake `window` on globalThis so ThemeService can access
 * window.matchMedia.
 */
function installWindow(mql: ReturnType<typeof fakeMediaQueryList>) {
  stash.window = (globalThis as any).window;
  Object.defineProperty(globalThis, 'window', {
    value: { matchMedia: () => mql },
    configurable: true,
    writable: true,
  });
}

/**
 * Install a fake `localStorage` on globalThis.  `overrides` can wrap
 * getItem/setItem with throw logic for error-handling tests.
 */
function installLocalStorage(
  storedValue: string | null,
  overrides?: {
    getItem?: (key: string) => string | null;
    setItem?: (key: string, value: string) => void;
  },
) {
  const store: Record<string, string> = {};
  if (storedValue !== null) store['aurora-theme'] = storedValue;
  stash.localStorage = (globalThis as any).localStorage;
  const storage = {
    getItem: jest.fn(
      overrides?.getItem ?? ((key: string) => store[key] ?? null),
    ),
    setItem: jest.fn(
      overrides?.setItem ??
        ((key: string, value: string) => {
          store[key] = value;
        }),
    ),
    removeItem: jest.fn((key: string) => delete store[key]),
    clear: jest.fn(() => Object.keys(store).forEach((k) => delete store[k])),
    length: 0,
    key: jest.fn(),
  } as unknown as Storage;
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
  return { storage, store };
}

/** Remove fakes installed during a test. */
function restoreGlobals() {
  ['document', 'window', 'localStorage'].forEach((key) => {
    if (key in stash) {
      Object.defineProperty(globalThis, key, {
        value: (stash as any)[key],
        configurable: true,
        writable: true,
      });
    } else {
      delete (globalThis as any)[key];
    }
  });
  stash = {};
}

// ---------------------------------------------------------------------------
// Public interface returned by createService
// ---------------------------------------------------------------------------

interface Scope {
  mql: ReturnType<typeof fakeMediaQueryList>;
  classList: ReturnType<typeof fakeClassList>;
  /** Backing store (not the Storage mock itself). */
  backingStore: Record<string, string>;
  service: ThemeService;
}

/**
 * Factory: creates a clean ThemeService in a controlled mock environment after
 * installing all necessary browser globals.
 */
function createService(
  overrides?: {
    stored?: string | null;
    osPrefersDark?: boolean;
    storageOverrides?: {
      getItem?: (key: string) => string | null;
      setItem?: (key: string, value: string) => void;
    };
  },
): Scope {
  const { stored = null, osPrefersDark = false, storageOverrides } =
    overrides ?? {};

  const classList = fakeClassList();
  const mql = fakeMediaQueryList(osPrefersDark);
  const { store } = installLocalStorage(stored, storageOverrides);

  installDocument(classList);
  installWindow(mql);

  const service = new ThemeService();

  return { mql, classList, backingStore: store, service };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ThemeService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    restoreGlobals();
  });

  // UT-1: Constructor reads matchMedia and sets isDark accordingly
  // -----------------------------------------------------------------------
  describe('UT-1 — Constructor reads matchMedia', () => {
    it('sets isDark=true when OS prefers dark', () => {
      const { service } = createService({ osPrefersDark: true });
      expect(service.isDark()).toBe(true);
    });

    it('sets isDark=false when OS prefers light', () => {
      const { service } = createService({ osPrefersDark: false });
      expect(service.isDark()).toBe(false);
    });
  });

  // UT-2: toggle() flips state
  // -----------------------------------------------------------------------
  describe('UT-2 — toggle() flips state', () => {
    it('inverts isDark after first toggle', () => {
      const { service } = createService({ osPrefersDark: false });
      expect(service.isDark()).toBe(false);
      service.toggle();
      expect(service.isDark()).toBe(true);
    });

    it('inverts isDark again after second toggle', () => {
      const { service } = createService({ osPrefersDark: false });
      service.toggle();
      service.toggle();
      expect(service.isDark()).toBe(false);
    });
  });

  // UT-3: toggle() syncs .dark class on <html>
  // -----------------------------------------------------------------------
  describe('UT-3 — toggle() syncs .dark class', () => {
    it('adds .dark class when toggling to dark', () => {
      const { service, classList } = createService({ osPrefersDark: false });
      service.toggle();
      expect(classList.contains('dark')).toBe(true);
    });

    it('removes .dark class when toggling back to light', () => {
      const { service, classList } = createService({ osPrefersDark: false });
      service.toggle(); // → dark
      service.toggle(); // → light
      expect(classList.contains('dark')).toBe(false);
    });
  });

  // UT-4: toggle() persists to localStorage
  // -----------------------------------------------------------------------
  describe('UT-4 — toggle() persists to localStorage', () => {
    it('stores "dark" on toggle to dark', () => {
      const { service } = createService({ osPrefersDark: false });
      service.toggle();
      expect((globalThis as any).localStorage.setItem).toHaveBeenCalledWith(
        'aurora-theme',
        'dark',
      );
    });

    it('stores "light" on toggle to light', () => {
      const { service } = createService({ osPrefersDark: true });
      service.toggle();
      expect((globalThis as any).localStorage.setItem).toHaveBeenCalledWith(
        'aurora-theme',
        'light',
      );
    });
  });

  // UT-5: Constructor reads stored localStorage value first
  // -----------------------------------------------------------------------
  describe('UT-5 — Constructor reads stored value first', () => {
    it('uses stored "dark" even when OS prefers light', () => {
      const { service } = createService({
        stored: 'dark',
        osPrefersDark: false,
      });
      expect(service.isDark()).toBe(true);
    });

    it('uses stored "light" even when OS prefers dark', () => {
      const { service } = createService({
        stored: 'light',
        osPrefersDark: true,
      });
      expect(service.isDark()).toBe(false);
    });
  });

  // UT-6: OS preference change updates signal (no manual override)
  // -----------------------------------------------------------------------
  describe('UT-6 — OS change updates isDark (no override)', () => {
    it('follows OS change from light to dark', () => {
      const { service, mql } = createService({ osPrefersDark: false });
      expect(service.isDark()).toBe(false);
      mql._fireChange(true);
      expect(service.isDark()).toBe(true);
    });

    it('follows OS change from dark to light', () => {
      const { service, mql } = createService({ osPrefersDark: true });
      expect(service.isDark()).toBe(true);
      mql._fireChange(false);
      expect(service.isDark()).toBe(false);
    });

    it('syncs .dark class when OS changes', () => {
      const { service, mql, classList } = createService({
        osPrefersDark: false,
      });
      mql._fireChange(true);
      expect(classList.contains('dark')).toBe(true);
    });
  });

  // UT-7: OS change ignored when manual override exists
  // -----------------------------------------------------------------------
  describe('UT-7 — OS change ignored after manual toggle', () => {
    it('ignores OS change after toggle to dark', () => {
      const { service, mql } = createService({ osPrefersDark: false });
      service.toggle(); // → dark (manual override)
      expect(service.isDark()).toBe(true);

      // OS changes back to light — should be ignored
      mql._fireChange(false);
      expect(service.isDark()).toBe(true);
    });

    it('ignores OS change after toggle to light (from dark OS)', () => {
      const { service, mql } = createService({ osPrefersDark: true });
      service.toggle(); // → light (manual override)
      expect(service.isDark()).toBe(false);

      // OS changes to dark — should be ignored
      mql._fireChange(true);
      expect(service.isDark()).toBe(false);
    });
  });

  // UT-8: Constructor handles missing localStorage gracefully
  // -----------------------------------------------------------------------
  describe('UT-8 — Handles missing localStorage gracefully', () => {
    it('defaults to OS preference when localStorage throws on read', () => {
      const { service } = createService({
        osPrefersDark: true,
        storageOverrides: {
          getItem: () => {
            throw new Error('localStorage unavailable');
          },
        },
      });
      expect(service.isDark()).toBe(true);
    });

    it('does not crash when setItem throws on toggle', () => {
      const { service } = createService({
        osPrefersDark: false,
        storageOverrides: {
          setItem: () => {
            throw new Error('localStorage unavailable');
          },
        },
      });
      expect(() => service.toggle()).not.toThrow();
      expect(service.isDark()).toBe(true);
    });
  });

  // UT-9: Multiple toggle() calls are idempotent
  // -----------------------------------------------------------------------
  describe('UT-9 — Multiple toggle() calls are idempotent', () => {
    it('3 toggles = 1 toggle (odd flips)', () => {
      // We need a fresh service to compare the result of 1 toggle
      const refService = (() => {
        const classList = fakeClassList();
        const mql = fakeMediaQueryList(false);
        installDocument(classList);
        installWindow(mql);
        installLocalStorage(null);
        const s = new ThemeService();
        s.toggle();
        return s;
      })();
      const afterOne = refService.isDark();

      const { service } = createService({ osPrefersDark: false });
      service.toggle();
      service.toggle();
      service.toggle();
      expect(service.isDark()).toBe(afterOne);
    });

    it('2 toggles returns to original', () => {
      const { service } = createService({ osPrefersDark: false });
      const original = service.isDark();
      service.toggle();
      service.toggle();
      expect(service.isDark()).toBe(original);
    });
  });

  // UT-10: localStorage key is exactly 'aurora-theme'
  // -----------------------------------------------------------------------
  describe('UT-10 — localStorage key is "aurora-theme"', () => {
    it('reads from and writes to the correct key', () => {
      const { service } = createService({ osPrefersDark: false });
      service.toggle(); // triggers setItem
      expect((globalThis as any).localStorage.getItem).toHaveBeenCalledWith(
        'aurora-theme',
      );
      expect((globalThis as any).localStorage.setItem).toHaveBeenCalledWith(
        'aurora-theme',
        expect.any(String),
      );
    });
  });
});
