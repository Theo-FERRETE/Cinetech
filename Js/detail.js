// detail.js

document.addEventListener('DOMContentLoaded', async function () {
  const API_KEY = 'a162de1ec65ccd82900e0f7af3843061'; // Remplace par ta clé API TMDB
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_LARGE = 'https://image.tmdb.org/t/p/w780';

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function getTypeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('type') || 'movie';
  }

  async function fetchDetail(type, id) {
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=fr-FR`);
    if (!res.ok) throw new Error('Impossible de charger les détails');
    return await res.json();
  }

  function renderDetail(data) {
    const title = data.title || data.name;
    const date = data.release_date || data.first_air_date || '';
    const overview = data.overview || 'Aucun résumé disponible.';
    const poster = data.poster_path
      ? IMG_LARGE + data.poster_path
      : 'https://via.placeholder.com/780x1170?text=No+Image';
    const genres =
      data.genres && data.genres.length ? data.genres.map((g) => g.name).join(', ') : '';
    const note = data.vote_average ? `${data.vote_average} / 10` : 'Non noté';

    document.getElementById('detail-content').innerHTML = `
      <img src="${poster}" alt="${title}" class="rounded-lg w-full md:w-1/2 object-cover max-h-[600px]" />
      <div class="flex flex-col justify-start md:w-1/2 text-center md:text-left">
        <h1 class="text-4xl font-bold mb-4">${title}</h1>
        <p class="text-gray-400 mb-2">${date}</p>
        <p class="mb-6">${overview}</p>
        <div class="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
          ${
            genres
              ? `<span class="bg-gray-700 px-3 py-1 rounded text-sm">${genres}</span>`
              : ''
          }
          <span class="bg-gray-700 px-3 py-1 rounded text-sm">Note : ${note}</span>
        </div>
      </div>
    `;
  }

  const id = getIdFromUrl();
  const type = getTypeFromUrl();

  if (!id) {
    document.getElementById('detail-content').innerHTML =
      '<p class="text-red-400 text-center">Aucun identifiant fourni.</p>';
    return;
  }

  try {
    const data = await fetchDetail(type, id);
    renderDetail(data);
  } catch (err) {
    document.getElementById('detail-content').innerHTML =
      '<p class="text-red-400 text-center">Erreur de chargement des détails.</p>';
  }
});
