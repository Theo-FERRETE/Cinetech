// films.js

document.addEventListener('DOMContentLoaded', function() {
  const API_KEY = 'a162de1ec65ccd82900e0f7af3843061'; // Remplace par ta clé API TMDB
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

  const filmsList = document.getElementById('films-list');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageNumber = document.getElementById('page-number');
  let currentPage = 1;
  let totalPages = 1;

  async function fetchFilms(page = 1) {
    try {
      const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      totalPages = data.total_pages;
      return data.results;
    } catch (err) {
      filmsList.innerHTML = `<div class="col-span-4 text-red-400 text-center">Erreur de chargement des films.</div>`;
      return [];
    }
  }

  function renderFilms(movies) {
    filmsList.innerHTML = '';
    if (!movies.length) {
      filmsList.innerHTML = `<div class="col-span-4 text-gray-400 text-center">Aucun film trouvé.</div>`;
      return;
    }
    movies.forEach(movie => {
      filmsList.innerHTML += `
        <a href="detail.html?type=movie&id=${movie.id}" 
           class="bg-gray-800 rounded shadow p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition no-underline">
          <img src="${movie.poster_path ? IMG_BASE + movie.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}" 
               alt="${movie.title}" class="rounded mb-2 w-full h-72 object-cover"/>
          <h2 class="text-lg font-semibold text-center">${movie.title}</h2>
          <p class="text-sm text-gray-400">${movie.release_date || ''}</p>
        </a>
      `;
    });
  }

  async function loadFilms(page) {
    pageNumber.textContent = `Page ${page}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
    currentPage = page;
    const movies = await fetchFilms(page);
    renderFilms(movies);
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) loadFilms(currentPage - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) loadFilms(currentPage + 1);
  });

  // Chargement initial
  loadFilms(currentPage);
});
