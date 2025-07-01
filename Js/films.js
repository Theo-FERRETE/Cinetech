// films.js

document.addEventListener('DOMContentLoaded', function () {
  const API_KEY = 'a162de1ec65ccd82900e0f7af3843061'; 
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
      filmsList.innerHTML = `<div class="col-span-4 text-red-400 text-center">Erreur de chargement des films.</div>`;
      return [];
    }
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

    if (isFavori(id, type)) {
      removeFavori(id, type);
      alert(`${title} a été retiré de vos favoris.`);
    } else {
      addFavori({
        id: id,
        type: type,
        title: title,
        poster_path: poster_path,
        release_date: date,
      });
      alert(`${title} a été ajouté à vos favoris.`);
    }
    // Recharge la page pour mettre à jour les boutons (ou appelle renderFilms avec la page courante)
    loadFilms(currentPage);
  };

  // Fonction pour afficher les films avec bouton dynamique
  function renderFilms(movies) {
    filmsList.innerHTML = '';
    if (!movies.length) {
      filmsList.innerHTML = `<div class="col-span-4 text-gray-400 text-center">Aucun film trouvé.</div>`;
      return;
    }
    movies.forEach((movie) => {
      const favori = isFavori(movie.id, 'movie');
      filmsList.innerHTML += `
        <div class="bg-gray-800 rounded shadow p-2 flex flex-col items-center hover:bg-gray-700 transition relative">
          <a href="detail.html?type=movie&id=${movie.id}" class="w-full cursor-pointer no-underline">
            <img src="${
              movie.poster_path
                ? IMG_BASE + movie.poster_path
                : 'https://via.placeholder.com/300x450?text=No+Image'
            }" 
                 alt="${movie.title}" class="rounded mb-2 w-full h-72 object-cover"/>
            <h2 class="text-lg font-semibold text-center text-white">${movie.title}</h2>
            <p class="text-sm text-gray-400 text-center">${
              movie.release_date || ''
            }</p>
          </a>
          <button class="mt-2 ${
            favori ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white text-sm px-3 py-1 rounded" 
                  onclick="toggleFavori(event, ${movie.id}, 'movie', '${movie.title.replace(
                    /'/g,
                    "\\'"
                  )}', '${movie.poster_path}', '${movie.release_date}')">
            ${favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </button>
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
