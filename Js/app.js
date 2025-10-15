document.addEventListener('DOMContentLoaded', function() {
  const pages = document.querySelectorAll('.page');
  const navLinks = {
    home: document.getElementById('nav-home'),
    films: document.getElementById('nav-films'),
    series: document.getElementById('nav-series'),
    favoris: document.getElementById('nav-favoris'),
  };

  function showPage(pageId) {
    pages.forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
  }

  navLinks.home.addEventListener('click', () => showPage('page-home'));
  navLinks.films.addEventListener('click', () => showPage('page-films'));
  navLinks.series.addEventListener('click', () => showPage('page-series'));
  navLinks.favoris.addEventListener('click', () => showPage('page-favoris'));

  // Chargement des films et séries populaires pour la page d'accueil
  const API_KEY = window.API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

  // Fetch up to 8 movies and 8 tv shows and build a carousel of max 16 items
  async function fetchPopular(type, limit = 8) {
    const res = await fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=fr-FR&page=1`);
    const data = await res.json();
    return data.results.slice(0, limit);
  }

  function buildCarouselItem(item) {
    const title = item.title || item.name || '';
    const poster = item.poster_path ? `${IMG_BASE}${item.poster_path}` : '';
    return `
      <div class="carousel-item flex-shrink-0 flex flex-col items-center cursor-pointer group">
        <div class="poster w-24 md:w-40 h-36 md:h-60 bg-gray-700 rounded-lg overflow-hidden mb-2">
          <img src="${poster}" alt="${title}" class="w-full h-full object-cover" />
        </div>
        <span class="carousel-title text-sm text-center max-w-[160px] truncate">${title}</span>
      </div>
    `;
  }

  async function initCarousel(type, trackId, prevId, nextId, limit = 16) {
    const items = await fetchPopular(type, limit).catch(() => []);
    const track = document.getElementById(trackId);
    track.innerHTML = items.map(buildCarouselItem).join('');

    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    let index = 0;

    function update() {
      // On small screens we prefer native horizontal scrolling (css handles it)
      if (window.innerWidth < 800) {
        track.style.transform = '';
        track.style.scrollBehavior = 'smooth';
        return;
      }
      const firstItem = track.querySelector('.carousel-item');
      const gap = 16;
      const itemWidth = firstItem ? firstItem.getBoundingClientRect().width + gap : 200;
      const container = track.parentElement; // the overflow-hidden container
      const visible = Math.floor(container.getBoundingClientRect().width / itemWidth) || 1;
      const maxIndex = Math.max(0, items.length - visible);
      if (index < 0) index = 0;
      if (index > maxIndex) index = maxIndex;
      track.style.transform = `translateX(-${index * itemWidth}px)`;
    }

    prevBtn.addEventListener('click', () => { index -= 1; update(); });
    nextBtn.addEventListener('click', () => { index += 1; update(); });

    window.addEventListener('resize', update);
    window.requestAnimationFrame(() => setTimeout(update, 100));
  }

  // Initialize separate carousels for movies and series
  initCarousel('movie', 'films-carousel-track', 'films-carousel-prev', 'films-carousel-next', 16);
  initCarousel('tv', 'series-carousel-track', 'series-carousel-prev', 'series-carousel-next', 16);
});
