// favoris.js

document.addEventListener('DOMContentLoaded', function () {
  const favorisList = document.getElementById('favoris-list');
  const emptyMessage = document.getElementById('empty-message');
  const IMG_BASE = 'https://image.tmdb.org/t/p/w300';

  // Récupère les favoris stockés en localStorage
  // Format attendu : tableau d'objets { id, type ('movie' ou 'tv'), title/name, poster_path, release_date/first_air_date }
  function getFavoris() {
    const favoris = localStorage.getItem('favoris');
    return favoris ? JSON.parse(favoris) : [];
  }

  function renderFavoris(favoris) {
    favorisList.innerHTML = '';
    if (favoris.length === 0) {
      emptyMessage.classList.remove('hidden');
      return;
    }
    emptyMessage.classList.add('hidden');

    favoris.forEach(item => {
      const title = item.title || item.name || 'Titre inconnu';
      const date = item.release_date || item.first_air_date || '';
      const poster = item.poster_path ? IMG_BASE + item.poster_path : 'https://via.placeholder.com/300x450?text=No+Image';
      const detailUrl = `detail.html?type=${item.type}&id=${item.id}`;

      favorisList.innerHTML += `
        <a href="${detailUrl}" class="bg-gray-800 rounded shadow p-2 flex flex-col items-center hover:bg-gray-700 transition no-underline">
          <img src="${poster}" alt="${title}" class="rounded mb-2 w-full h-72 object-cover" />
          <h2 class="text-lg font-semibold text-center">${title}</h2>
          <p class="text-sm text-gray-400">${date}</p>
        </a>
      `;
    });
  }

  renderFavoris(getFavoris());
});
