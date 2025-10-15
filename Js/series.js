// series.js

document.addEventListener('DOMContentLoaded', function () {
  const API_KEY = window.API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

  const seriesList = document.getElementById('series-list');
  const paginationContainer = document.createElement('div');
  paginationContainer.id = 'pagination';
  paginationContainer.className = 'inline-flex space-x-1 mt-6 justify-center w-full';
  seriesList.parentNode.appendChild(paginationContainer);

  let currentPage = 1;
  let totalPages = 1;

  function getFavoris() {
    const favoris = localStorage.getItem('favoris');
    return favoris ? JSON.parse(favoris) : [];
  }

  function saveFavoris(favoris) {
    localStorage.setItem('favoris', JSON.stringify(favoris));
  }

  function isFavori(id, type) {
    const favoris = getFavoris();
    return favoris.some((f) => f.id === id && f.type === type);
  }

  function addFavori(item) {
    const favoris = getFavoris();
    favoris.push(item);
    saveFavoris(favoris);
  }

  function removeFavori(id, type) {
    let favoris = getFavoris();
    favoris = favoris.filter((f) => !(f.id === id && f.type === type));
    saveFavoris(favoris);
  }

  async function fetchSeries(page = 1) {
    try {
      const res = await fetch(
        `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`
      );
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      totalPages = data.total_pages;
      return data.results;
    } catch (err) {
  seriesList.innerHTML = `<div class="w-full text-red-400 text-center py-6">Erreur de chargement des séries.</div>`;
      return [];
    }
  }

  // Debounce helper for search
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  async function searchSeries(query) {
    if (!query || !query.trim()) return [];
    try {
      const res = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`);
      if (!res.ok) throw new Error('Erreur API search');
      const data = await res.json();
      return data.results;
    } catch (err) {
      showToast('Erreur lors de la recherche', 'error');
      return [];
    }
  }

  // Bind search
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  if (searchInput) {
    const onSearch = debounce(async (e) => {
      const q = e.target.value;
      if (!q) {
        loadSeries(1);
        paginationContainer.style.display = '';
        searchClear.classList.add('hidden');
        return;
      }
      const results = await searchSeries(q);
      renderSeries(results);
      paginationContainer.style.display = 'none';
      searchClear.classList.remove('hidden');
    }, 420);
    searchInput.addEventListener('input', onSearch);
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.add('hidden');
      loadSeries(1);
      paginationContainer.style.display = '';
    });
  }

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
    // pas de reload complet, on met à jour l'UI locale
  };

  function renderSeries(series) {
    seriesList.innerHTML = '';
    if (!series.length) {
      seriesList.innerHTML = `<div class="w-full text-gray-400 text-center py-6">Aucune série trouvée.</div>`;
      return;
    }
    series.forEach((serie) => {
      const favori = isFavori(serie.id, 'tv');
      seriesList.innerHTML += `
        <div class="media-card bg-gray-800 rounded shadow p-2 hover:bg-gray-700 transition relative">
          <div class="card-body">
            <img src="${
              serie.poster_path
                ? IMG_BASE + serie.poster_path
                : 'https://via.placeholder.com/300x450?text=No+Image'
            }" 
                 alt="${serie.name}" class="rounded mb-2 w-full h-56 md:h-72 object-cover"/>
            <h2 class="text-lg font-semibold text-center text-white">${serie.name}</h2>
            <p class="text-sm text-gray-400 text-center">${serie.first_air_date || ''}</p>
          </div>
          <div class="mt-3 card-actions">
            <div class="left-actions">
              <a href="detail.html?type=tv&id=${serie.id}" class="btn btn-primary btn-inline">Voir le détail</a>
            </div>
            <div class="right-actions">
              <button class="favorite-btn ${favori ? 'active' : ''}" aria-label="favori" onclick="toggleFavori(event, ${serie.id}, 'tv', '${serie.name.replace(/'/g, "\\'")}', '${serie.poster_path}', '${serie.first_air_date}')">
                <span class="star">${favori ? '★' : '☆'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });
  }

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

  async function loadSeries(page) {
    page = Math.max(1, Math.min(page, totalPages));
    currentPage = page;
    const series = await fetchSeries(page);
    renderSeries(series);
    renderPagination(currentPage, totalPages, loadSeries);
  }

  loadSeries(currentPage);
});
