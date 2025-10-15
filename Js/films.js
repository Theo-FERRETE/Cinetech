// films.js

document.addEventListener('DOMContentLoaded', function () {
  const API_KEY = window.API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

  const filmsList = document.getElementById('films-list');
  const paginationContainer = document.createElement('div');
  paginationContainer.id = 'pagination';
  paginationContainer.className = 'inline-flex space-x-1 mt-6 justify-center w-full';
  filmsList.parentNode.appendChild(paginationContainer);

  let currentPage = 1;
  let totalPages = 1;

  // Récupération des favoris depuis localStorage
  function getFavoris() {
    const favoris = localStorage.getItem('favoris');
    return favoris ? JSON.parse(favoris) : [];
  }

  // Sauvegarde des favoris dans localStorage
  function saveFavoris(favoris) {
    localStorage.setItem('favoris', JSON.stringify(favoris));
  }

  // Vérifie si un élément est dans les favoris
  function isFavori(id, type) {
    const favoris = getFavoris();
    return favoris.some((f) => f.id === id && f.type === type);
  }

  // Ajoute un favori
  function addFavori(item) {
    const favoris = getFavoris();
    favoris.push(item);
    saveFavoris(favoris);
  }

  // Retire un favori
  function removeFavori(id, type) {
    let favoris = getFavoris();
    favoris = favoris.filter((f) => !(f.id === id && f.type === type));
    saveFavoris(favoris);
  }

  // Fonction pour récupérer les films populaires
  async function fetchFilms(page = 1) {
    try {
      const res = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`
      );
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      totalPages = data.total_pages;
      return data.results;
    } catch (err) {
  filmsList.innerHTML = `<div class="w-full text-red-400 text-center py-6">Erreur de chargement des films.</div>`;
      return [];
    }
  }

  // Recherche debounce helper
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  async function searchFilms(query) {
    if (!query || !query.trim()) return [];
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`);
      if (!res.ok) throw new Error('Erreur API search');
      const data = await res.json();
      return data.results;
    } catch (err) {
      showToast('Erreur lors de la recherche', 'error');
      return [];
    }
  }

  // Bind search input
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  let lastSearch = '';
  if (searchInput) {
    const onSearch = debounce(async (e) => {
      const q = e.target.value;
      lastSearch = q;
      if (!q) {
        // restore popular
        loadFilms(1);
        paginationContainer.style.display = '';
        searchClear.classList.add('hidden');
        return;
      }
      const results = await searchFilms(q);
      renderFilms(results);
      // hide pagination while showing search results
      paginationContainer.style.display = 'none';
      searchClear.classList.remove('hidden');
    }, 420);
    searchInput.addEventListener('input', onSearch);
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.add('hidden');
      loadFilms(1);
      paginationContainer.style.display = '';
    });
  }

  // Fonction pour gérer le clic sur le bouton favoris (ajout ou retrait)
  window.toggleFavori = function (
    event,
    id,
    type,
    title,
    poster_path,
    date
  ) {
    event.stopPropagation();
    event.preventDefault();

    const btn = event.currentTarget;
    // play animation
    btn.classList.add('favorite-animate');
    setTimeout(() => btn.classList.remove('favorite-animate'), 360);

    if (isFavori(id, type)) {
      removeFavori(id, type);
      showToast(`${title} retiré des favoris.`, 'info');
      // Update button state immediately without full reload
      btn.classList.remove('active');
      btn.querySelector('.star').textContent = '☆';
    } else {
      addFavori({
        id: id,
        type: type,
        title: title,
        poster_path: poster_path,
        release_date: date,
      });
      showToast(`${title} ajouté aux favoris.`, 'success');
      btn.classList.add('active');
      btn.querySelector('.star').textContent = '★';
    }
  };

  // Fonction pour afficher les films avec bouton dynamique
  function renderFilms(movies) {
    filmsList.innerHTML = '';
    if (!movies.length) {
      filmsList.innerHTML = `<div class="w-full text-gray-400 text-center py-6">Aucun film trouvé.</div>`;
      return;
    }
    movies.forEach((movie) => {
      const favori = isFavori(movie.id, 'movie');
      filmsList.innerHTML += `
          <div class="media-card bg-gray-800 rounded shadow p-2 hover:bg-gray-700 transition relative">
          <div class="card-body">
              <img src="${
                movie.poster_path
                  ? IMG_BASE + movie.poster_path
                  : 'https://via.placeholder.com/300x450?text=No+Image'
              }" 
                   alt="${movie.title}" class="rounded mb-2 w-full h-56 md:h-72 object-cover"/>
            <h2 class="text-lg font-semibold text-center text-white">${movie.title}</h2>
            <p class="text-sm text-gray-400 text-center">${movie.release_date || ''}</p>
          </div>
          <div class="mt-3 card-actions">
            <div class="left-actions">
              <a href="detail.html?type=movie&id=${movie.id}" class="btn btn-primary btn-inline">Voir le détail</a>
            </div>
            <div class="right-actions">
              <button class="favorite-btn ${favori ? 'active' : ''}" aria-label="favori" onclick="toggleFavori(event, ${movie.id}, 'movie', '${movie.title.replace(/'/g, "\\'")}', '${movie.poster_path}', '${movie.release_date}')">
                <span class="star">${favori ? '★' : '☆'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });
  }

  // Fonction pour rendre la pagination
  function renderPagination(currentPage, totalPages, onPageChange) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Précédent';
    prevBtn.className =
      'px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50';
    prevBtn.disabled = currentPage <= 1;
    prevBtn.onclick = () => onPageChange(currentPage - 1);
    pagination.appendChild(prevBtn);

    const pageButtons = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (start > 1) {
      pageButtons.push(1);
      if (start > 2) pageButtons.push('...');
    }
    for (let i = start; i <= end; i++) pageButtons.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pageButtons.push('...');
      pageButtons.push(totalPages);
    }

    pageButtons.forEach((p) => {
      if (p === '...') {
        const span = document.createElement('span');
        span.textContent = '...';
        span.className = 'px-2 py-1 text-gray-400';
        pagination.appendChild(span);
      } else {
        const btn = document.createElement('button');
        btn.textContent = p;
        btn.className =
          'px-3 py-1 rounded ' +
          (p === currentPage
            ? 'bg-blue-700 font-bold'
            : 'bg-gray-700 hover:bg-gray-600');
        btn.disabled = p === currentPage;
        btn.onclick = () => onPageChange(p);
        pagination.appendChild(btn);
      }
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Suivant';
    nextBtn.className =
      'px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => onPageChange(currentPage + 1);
    pagination.appendChild(nextBtn);
  }

  // Chargement des films avec pagination
  async function loadFilms(page) {
    page = Math.max(1, Math.min(page, totalPages));
    currentPage = page;
    const movies = await fetchFilms(page);
    renderFilms(movies);
    renderPagination(currentPage, totalPages, loadFilms);
  }

  // Initialisation
  loadFilms(currentPage);
});
