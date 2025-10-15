// nav.js - simple mobile nav toggle
(function () {
  function init() {
    const toggles = document.querySelectorAll('.nav-mobile-toggle');
    toggles.forEach((btn) => {
      const nav = btn.closest('nav');
      const menu = nav.querySelector('.nav-menu');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        handleMobileExtras(nav, menu, isOpen);
      });
    });

    // click outside to close
    document.addEventListener('click', (e) => {
      document.querySelectorAll('nav .nav-menu.open').forEach((m) => {
        if (!m.contains(e.target) && !m.closest('.nav-mobile-toggle')) {
          m.classList.remove('open');
          const nav = m.closest('nav');
          const btn = nav.querySelector('.nav-mobile-toggle');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          handleMobileExtras(nav, m, false);
        }
      });
    });

    // close on Esc and restore extras
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        document.querySelectorAll('nav .nav-menu.open').forEach((m) => {
          m.classList.remove('open');
          const nav = m.closest('nav');
          const btn = nav.querySelector('.nav-mobile-toggle');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          handleMobileExtras(nav, m, false);
        });
      }
    });

    // restore on resize (if moving elements were relocated)
    window.addEventListener('resize', () => {
      document.querySelectorAll('nav').forEach((nav) => {
        const menu = nav.querySelector('.nav-menu');
        if (menu && !menu.classList.contains('open')) handleMobileExtras(nav, menu, false);
      });
    });
  }

  // Move search and theme toggle into nav-menu for mobile when menu opens
  function handleMobileExtras(nav, menu, isOpen) {
    const mq = window.matchMedia('(max-width: 800px)');
    // elements to move: .search-input (if any) and .theme-toggle (if any)
    const search = nav.querySelector('.search-input');
    const theme = nav.querySelector('.theme-toggle');
    if (mq.matches && isOpen) {
      if (search && !menu.contains(search)) {
        // save original parent
        search.__origParent = search.parentElement;
        search.__origNext = search.nextElementSibling;
        menu.appendChild(search);
      }
      if (theme && !menu.contains(theme)) {
        theme.__origParent = theme.parentElement;
        theme.__origNext = theme.nextElementSibling;
        menu.appendChild(theme);
      }
    } else {
      // restore
      if (search && search.__origParent && !search.__origParent.contains(search)) {
        if (search.__origNext) search.__origParent.insertBefore(search, search.__origNext);
        else search.__origParent.appendChild(search);
      }
      if (theme && theme.__origParent && !theme.__origParent.contains(theme)) {
        if (theme.__origNext) theme.__origParent.insertBefore(theme, theme.__origNext);
        else theme.__origParent.appendChild(theme);
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
