
document.addEventListener('DOMContentLoaded', function() {
  const API_KEY = 'a162de1ec65ccd82900e0f7af3843061'; // Remplace par ta clé API TMDB
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

  const seriesList = document.getElementById('series-list');
  const prevBtn = document.getElementById('prev-series-page');
  const nextBtn = document.getElementById('next-series-page');
  const pageNumber = document.getElementById('series-page-number');
  let currentPage = 1;
  let totalPages = 1;

  async function fetchSeries(page = 1) {
    try {
      const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      totalPages = data.total_pages;
      return data.results;
    } catch (err) {
      seriesList.innerHTML = `<div class="col-span-4 text-red-400 text-center">Erreur de chargement des séries.</div>`;
      return [];
    }
  }

  function renderSeries(series) {
    seriesList.innerHTML = '';
    if (!series.length) {
      seriesList.innerHTML = `<div class="col-span-4 text-gray-400 text-center">Aucune série trouvée.</div>`;
      return;
    }
    series.forEach(serie => {
      seriesList.innerHTML += `
        <a href="detail.html?type=tv&id=${serie.id}" 
           class="bg-gray-800 rounded shadow p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition no-underline">
          <img src="${serie.poster_path ? IMG_BASE + serie.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}" 
               alt="${serie.name}" class="rounded mb-2 w-full h-72 object-cover"/>
          <h2 class="text-lg font-semibold text-center">${serie.name}</h2>
          <p class="text-sm text-gray-400">${serie.first_air_date || ''}</p>
        </a>
      `;
    });
  }

  async function loadSeries(page) {
    pageNumber.textContent = `Page ${page}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
    currentPage = page;
    const series = await fetchSeries(page);
    renderSeries(series);
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) loadSeries(currentPage - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) loadSeries(currentPage + 1);
  });

  // Chargement initial
  loadSeries(currentPage);
});
