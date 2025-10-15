// Theme toggle: stores preference in localStorage and applies a class to <html>
(function() {
  const THEME_KEY = 'cinetech_theme';

  function applyTheme(theme) {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function storeTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    const current = getStoredTheme() || (document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
    updateToggles(next);
  }

  function updateToggles(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = theme === 'dark' ? '🌙 Sombre' : '☀️ Clair';
    });
  }

  // Init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const stored = getStoredTheme();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(initial);
    updateToggles(initial);

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });
})();
