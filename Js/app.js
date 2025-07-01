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
  const API_KEY = 'a162de1ec65ccd82900e0f7af3843061'; 
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

  async function fetchPopular(type) {
    const res = await fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=fr-FR&page=1`);
    const data = await res.json();
    return data.results.slice(0, 4); 
  }

  function renderItems(items, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    items.forEach(item => {
      container.innerHTML += `
        <div class="w-32 flex flex-col items-center cursor-pointer group">
          <img src="${IMG_BASE}${item.poster_path}" alt="${item.title || item.name}" class="rounded-lg shadow mb-2 group-hover:scale-105 transition-transform duration-200"/>
          <span class="text-sm text-center">${item.title || item.name}</span>
        </div>
      `;
    });
  }

  fetchPopular('movie').then(data => renderItems(data, 'home-films', 'movie'));
  fetchPopular('tv').then(data => renderItems(data, 'home-series', 'tv'));
});
