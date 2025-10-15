// detail.js

document.addEventListener('DOMContentLoaded', async function () {
  const API_KEY = window.API_KEY; 
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
    const data = await res.json();
    // If overview is empty or missing, try english fallback
    if (!data.overview || data.overview.trim() === '') {
      try {
        const resEn = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`);
        if (resEn.ok) {
          const dataEn = await resEn.json();
          if (dataEn.overview && dataEn.overview.trim() !== '') {
            data.overview = `${dataEn.overview} (EN)`;
          }
        }
      } catch (e) {
        // ignore fallback errors
      }
    }
    return data;
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
      <div class="md:w-1/2">
        <img src="${poster}" loading="lazy" alt="${title}" class="rounded-lg w-full h-auto md:h-[600px] object-cover" />
      </div>
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
        <!-- Cast will be injected here -->
        <div id="cast-container" class="mt-4"></div>
        <div class="flex gap-3 mt-4 md:justify-start justify-center">
          <button id="back-btn" class="btn btn-ghost">← Retour</button>
          <button id="detail-fav" class="favorite-btn" aria-label="favori-detail"><span class="star">☆</span></button>
        </div>
      </div>
    `;

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => window.history.back());

    // Favorite handling on detail page
    const favBtn = document.getElementById('detail-fav');
    if (window.isFavori && window.addFavori && window.removeFavori) {
      const idNum = parseInt(getIdFromUrl(), 10);
      const t = getTypeFromUrl();
      if (isFavori(idNum, t)) {
        favBtn.classList.add('active');
        favBtn.querySelector('.star').textContent = '★';
      }
      favBtn.addEventListener('click', (ev) => {
        // reuse global toggleFavori for consistent behaviour
        window.toggleFavori({ currentTarget: favBtn, stopPropagation: () => {}, preventDefault: () => {} }, idNum, t, title, data.poster_path, date);
      });
    }

    // Fetch and render cast (actors) into the cast-container placed above the buttons
    (async function renderCast() {
      try {
        const cid = getIdFromUrl();
        const t = getTypeFromUrl();
        const res = await fetch(`${BASE_URL}/${t}/${cid}/credits?api_key=${API_KEY}&language=fr-FR`);
        if (!res.ok) return;
        const credits = await res.json();
        const cast = credits.cast && credits.cast.length ? credits.cast.slice(0, 8) : [];
        if (!cast.length) return;
        const castHtml = cast
          .map((c) => {
            const name = c.name || '';
            const role = c.character || '';
            const img = c.profile_path ? 'https://image.tmdb.org/t/p/w185' + c.profile_path : 'https://via.placeholder.com/185x278?text=No+Image';
            const aria = `Acteur ${name}${role ? ', rôle: ' + role : ''}`;
            return `
            <div class="cast-item" tabindex="0" role="button" aria-label="${aria}">
              <img src="${img}" loading="lazy" alt="${name}" />
              <div class="cast-meta">
                <div class="cast-name">${name}</div>
                <div class="cast-role">${role}</div>
              </div>
            </div>
          `;
          })
          .join('');
        const castContainer = document.getElementById('cast-container');
        if (!castContainer) return;
        castContainer.innerHTML = `
          <h3 class="text-xl font-semibold mb-3">Acteurs principaux</h3>
          <div class="cast-list">${castHtml}</div>
        `;
      } catch (e) {
        // ignore cast errors silently
      }
    })();
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
