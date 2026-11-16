/* Shared theme state for the Home, Course, and Career pages. */
(() => {
  'use strict';

  const STORAGE_KEY = 'siddhan_theme';
  const CHANNEL_NAME = 'siddhan-theme-sync';
  const root = document.documentElement;
  const isTheme = value => value === 'dark' || value === 'light';
  let channel = null;

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', event => {
      if (isTheme(event.data?.theme)) {
        setTheme(event.data.theme, { persist: true, broadcast: false, relay: false });
      }
    });
  } catch (error) {
    channel = null;
  }

  function getStoredTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isTheme(saved)) return saved;
      localStorage.setItem(STORAGE_KEY, 'dark');
    } catch (error) {
      // The page still uses dark mode if browser storage is unavailable.
    }
    return 'dark';
  }

  function postThemeToFrames(theme) {
    document.querySelectorAll('[data-theme-frame]').forEach(frame => {
      try {
        frame.contentWindow?.postMessage({ type: 'siddhan-theme-sync', theme }, '*');
      } catch (error) {
        // A frame that is not ready will receive the theme from its load event.
      }
    });
  }

  function setTheme(theme, { persist = true, broadcast = true, relay = true } = {}) {
    if (!isTheme(theme)) return root.getAttribute('data-theme') || 'dark';

    root.setAttribute('data-theme', theme);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#070b12' : '#f8fafc');

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
        // In-memory theme and page-to-page messages still work without storage.
      }
    }

    if (broadcast) {
      channel?.postMessage({ theme });
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'siddhan-theme-sync', theme }, '*');
      } else {
        postThemeToFrames(theme);
      }
    } else if (relay && window.parent === window) {
      postThemeToFrames(theme);
    }

    return theme;
  }

  function toggleTheme() {
    return setTheme((root.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark');
  }

  function bindToggle(button) {
    button?.addEventListener('click', toggleTheme);
  }

  window.SiddhanTheme = {
    get: () => root.getAttribute('data-theme') || 'dark',
    init: () => setTheme(getStoredTheme(), { persist: false, broadcast: false, relay: false }),
    set: setTheme,
    toggle: toggleTheme,
    bindToggle
  };

  setTheme(getStoredTheme(), { persist: false, broadcast: false, relay: false });

  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) return;
    setTheme(isTheme(event.newValue) ? event.newValue : 'dark', {
      persist: false,
      broadcast: false,
      relay: window.parent === window
    });
  });

  window.addEventListener('message', event => {
    if (event.data?.type !== 'siddhan-theme-sync' || !isTheme(event.data.theme)) return;

    if (window.parent !== window && event.source === window.parent) {
      setTheme(event.data.theme, { persist: true, broadcast: false, relay: false });
      return;
    }

    if (window.parent === window) {
      const trustedFrame = Array.from(document.querySelectorAll('[data-theme-frame]'))
        .some(frame => frame.contentWindow === event.source);
      if (trustedFrame) setTheme(event.data.theme, { persist: true, broadcast: true, relay: true });
    }
  });

  function bindThemeFrames() {
    if (window.parent !== window) return;
    document.querySelectorAll('[data-theme-frame]').forEach(frame => {
      frame.addEventListener('load', () => {
        frame.contentWindow?.postMessage({
          type: 'siddhan-theme-sync',
          theme: root.getAttribute('data-theme') || 'dark'
        }, '*');
      });
    });
    postThemeToFrames(root.getAttribute('data-theme') || 'dark');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeFrames, { once: true });
  } else {
    bindThemeFrames();
  }
})();
