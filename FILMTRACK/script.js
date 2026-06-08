const API_KEY_STORAGE = 'filmtrack_api_key';
const FILMS_STORAGE = 'filmtrack_films';
const WATCHLIST_STORAGE = 'filmtrack_watchlist';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeBtn = document.querySelector('.close');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const apiKeyInput = document.getElementById('apiKey');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const filmsList = document.getElementById('filmsList');
const watchlist = document.getElementById('watchlist');
const filmCount = document.getElementById('filmCount');
const watchlistCount = document.getElementById('watchlistCount');
const statsFilms = document.getElementById('statsFilms');
const statsAverage = document.getElementById('statsAverage');
const statsWatchlist = document.getElementById('statsWatchlist');

let films = [];
let watchlistItems = [];
let apiKey = '';
const favoris = JSON.parse(localStorage.getItem("favoris")) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateStats();
    afficherFavoris();
    apiKeyInput.value = apiKey || '';
});

function setupEventListeners() {
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    saveApiKeyBtn.addEventListener('click', saveApiKey);
    searchBtn.addEventListener('click', searchFilms);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchFilms();
        }
    });
}

function saveApiKey() {
    let key = apiKeyInput.value.trim();
    if (!key) {
        alert('Veuillez entrer une clé API');
        return;
    }
    
    if (key.includes('apikey=')) {
        const url = new URL(key);
        key = url.searchParams.get('apikey');
    }
    
    if (!key) {
        alert('Clé API invalide');
        return;
    }
    
    localStorage.setItem(API_KEY_STORAGE, key);
    apiKey = key;
    apiKeyInput.value = key;
    settingsModal.style.display = 'none';
    alert('Clé API enregistrée avec succès !');
}

function loadData() {
    apiKey = localStorage.getItem(API_KEY_STORAGE) || '';
    const filmsData = localStorage.getItem(FILMS_STORAGE);
    const watchlistData = localStorage.getItem(WATCHLIST_STORAGE);

    films = filmsData ? JSON.parse(filmsData) : [];
    watchlistItems = watchlistData ? JSON.parse(watchlistData) : [];

    renderFilms();
    renderWatchlist();
}

function saveData() {
    localStorage.setItem(FILMS_STORAGE, JSON.stringify(films));
    localStorage.setItem(WATCHLIST_STORAGE, JSON.stringify(watchlistItems));
    updateStats();
}

async function searchFilms() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Veuillez entrer un titre de film');
        return;
    }

    if (!apiKey) {
        alert('Veuillez d\'abord configurer votre clé API OMDb dans les paramètres');
        return;
    }

    try {
        const response = await fetch(
            `${OMDB_BASE_URL}/?s=${encodeURIComponent(query)}&apikey=${apiKey}&type=movie`
        );
        const data = await response.json();

        if (data.Response === 'False') {
            searchResults.innerHTML = '<p class="empty-state">' + (data.Error || 'Film non trouvé') + '</p>';
            return;
        }

        if (!data.Search || data.Search.length === 0) {
            searchResults.innerHTML = '<p class="empty-state">Aucun film trouvé</p>';
            return;
        }

        displaySearchResults(data.Search);
    } catch (error) {
        console.error('Erreur API:', error);
        alert('Erreur lors de la recherche: ' + error.message + '\nVérifiez que votre clé API OMDb est correcte');
        searchResults.innerHTML = '<p class="empty-state">Erreur de connexion à l\'API</p>';
    }
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = '<p class="empty-state">Aucun film trouvé</p>';
        return;
    }

    results.forEach(movie => {
        const movieCard = createSearchResultCard(movie);
        searchResults.appendChild(movieCard);
    });
}

function createSearchResultCard(movie) {
    const card = document.createElement('div');
    card.className = 'search-result-item';

    const poster = movie.Poster !== 'N/A' && movie.Poster
        ? movie.Poster
        : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23667eea" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

    const year = movie.Year || 'N/A';
    const imdbId = movie.imdbID;

    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" class="search-result-poster">
        <div class="search-result-info">
            <h3>${movie.Title}</h3>
            <p>${year}</p>
            <button class="add-film-btn" onclick="addFilmFromSearch('${imdbId}', '${movie.Title.replace(/'/g, "\\'")}', '${year}', '${poster.replace(/'/g, "\\'")}')">
                📽️ Liste
            </button>
            <button class="add-watchlist-btn" onclick="addToWatchlistFromSearch('${imdbId}', '${movie.Title.replace(/'/g, "\\'")}', '${year}', '${poster.replace(/'/g, "\\'")}')">
                📋 Watchlist
            </button>
        </div>
    `;

    return card;
}

function addFilmFromSearch(imdbId, title, year, posterUrl) {
    const existingFilm = films.find(f => f.imdbId === imdbId);

    if (existingFilm) {
        alert('Ce film est déjà dans votre liste');
        return;
    }

    const newFilm = {
        id: Date.now(),
        imdbId: imdbId,
        title: title,
        year: year,
        posterUrl: posterUrl,
        rating: 0,
        dateAdded: new Date().toLocaleDateString('fr-FR'),
        notes: ''
    };

    films.push(newFilm);
    saveData();
    renderFilms();

    searchInput.value = '';
    searchResults.innerHTML = '';

    alert('Film ajouté à votre liste !');
}

function renderFilms() {
    filmsList.innerHTML = '';
    filmCount.textContent = films.length;

    if (films.length === 0) {
        filmsList.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><p>Aucun film pour le moment<br>Recherchez et ajoutez vos films préférés !</p></div>';
        return;
    }

    films.forEach(film => {
        const filmCard = createFilmCard(film);
        filmsList.appendChild(filmCard);
    });
}

function createFilmCard(film) {
    const card = document.createElement('div');
    card.className = 'film-card';

    const stars = '⭐'.repeat(film.rating);
    const isInWatchlist = watchlistItems.find(w => w.imdbId === film.imdbId);
    const isFavorite = favoris.includes(film.id.toString());

    card.innerHTML = `
        <img src="${film.posterUrl}" alt="${film.title}" class="film-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22260%22%3E%3Crect fill=%22%23667eea%22 width=%22180%22 height=%22260%22/%3E%3C/svg%3E'">
        <div class="film-info">
            <div class="film-title">${film.title}</div>
            <div class="film-year">${film.year}</div>
            <div class="film-rating">${stars || '0/5'}</div>
            <div class="film-actions">
                <button onclick="editFilmRating(${film.id})">✏️ Éditer</button>
                <button class="watchlist-btn" onclick="addFilmToWatchlist(${film.id})">${isInWatchlist ? '✓ Liste' : '📋 Liste'}</button>
                <button class="add-fav" onclick="addToFavorites(${film.id})" style="${isFavorite ? 'background-color: #ffc107;' : ''}">⭐ ${isFavorite ? 'Favori' : 'Favoris'}</button>
                <button class="delete-btn" onclick="deleteFilm(${film.id})" style="grid-column: 1/-1;">🗑️ Supprimer</button>
            </div>
        </div>
    `;

    return card;
}

function editFilmRating(filmId) {
    const film = films.find(f => f.id === filmId);
    if (!film) return;

    const rating = prompt(`Note pour "${film.title}" (0-5):`, film.rating);
    if (rating !== null) {
        const newRating = Math.max(0, Math.min(5, parseInt(rating) || 0));
        film.rating = newRating;
        saveData();
        renderFilms();
    }
}

function deleteFilm(filmId) {
    const film = films.find(f => f.id === filmId);
    if (!film) return;

    if (confirm(`Supprimer "${film.title}" ?`)) {
        films = films.filter(f => f.id !== filmId);
        watchlistItems = watchlistItems.filter(w => w.id !== filmId);
        const filmIdStr = filmId.toString();
        const favIndex = favoris.indexOf(filmIdStr);
        if (favIndex > -1) {
            favoris.splice(favIndex, 1);
        }
        localStorage.setItem("favoris", JSON.stringify(favoris));
        saveData();
        afficherFavoris();
        renderFilms();
        renderWatchlist();
        alert('Film supprimé !');
    }
}

function addFilmToWatchlist(filmId) {
    const film = films.find(f => f.id === filmId);
    if (!film) return;

    const exists = watchlistItems.find(w => w.imdbId === film.imdbId);
    if (exists) {
        alert('Ce film est déjà dans votre watchlist');
        return;
    }

    watchlistItems.push({
        id: Date.now(),
        imdbId: film.imdbId,
        title: film.title,
        year: film.year,
        posterUrl: film.posterUrl,
        dateAdded: new Date().toLocaleDateString('fr-FR')
    });

    saveData();
    renderWatchlist();
    renderFilms();
    alert('Film ajouté à la watchlist !');
}

function renderWatchlist() {
    watchlist.innerHTML = '';
    watchlistCount.textContent = watchlistItems.length;

    if (watchlistItems.length === 0) {
        watchlist.innerHTML = '<div class="empty-state"><p>Votre watchlist est vide</p></div>';
        return;
    }

    watchlistItems.forEach(item => {
        const watchlistItem = createWatchlistItem(item);
        watchlist.appendChild(watchlistItem);
    });
}

function createWatchlistItem(item) {
    const div = document.createElement('div');
    div.className = 'watchlist-item';
    
    const isFavorite = favoris.includes(item.id.toString());

    div.innerHTML = `
        <img src="${item.posterUrl}" alt="${item.title}" class="watchlist-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2280%22%3E%3Crect fill=%22%23667eea%22 width=%2260%22 height=%2280%22/%3E%3C/svg%3E'">
        <div class="watchlist-info">
            <div class="watchlist-title">${item.title}</div>
            <div class="watchlist-year">${item.year}</div>
        </div>
        <div class="watchlist-actions">
            <button onclick="moveToFilms(${item.id})">Vu ✓</button>
            <button class="add-fav" onclick="addToFavorites(${item.id})" style="${isFavorite ? 'background-color: #ffc107;' : ''}">${isFavorite ? '⭐ Favori' : '+ Favoris'}</button>
            <button class="remove-watchlist-btn" onclick="removeFromWatchlist(${item.id})">Retirer</button>
        </div>
    `;

    return div;
}

function removeFromWatchlist(itemId) {
    const item = watchlistItems.find(w => w.id === itemId);
    if (!item) return;

    if (confirm(`Retirer "${item.title}" de la watchlist ?`)) {
        watchlistItems = watchlistItems.filter(w => w.id !== itemId);
        saveData();
        renderWatchlist();
    }
}

function moveToFilms(itemId) {
    const item = watchlistItems.find(w => w.id === itemId);
    if (!item) return;

    const newFilm = {
        id: Date.now(),
        imdbId: item.imdbId,
        title: item.title,
        year: item.year,
        posterUrl: item.posterUrl,
        rating: 0,
        dateAdded: new Date().toLocaleDateString('fr-FR'),
        notes: ''
    };

    films.push(newFilm);
    watchlistItems = watchlistItems.filter(w => w.id !== itemId);

    saveData();
    renderFilms();
    renderWatchlist();
}

function updateStats() {
    statsFilms.textContent = films.length;

    if (films.length === 0) {
        statsAverage.textContent = '-';
    } else {
        const average = (films.reduce((sum, f) => sum + f.rating, 0) / films.length).toFixed(1);
        statsAverage.textContent = average;
    }

    statsWatchlist.textContent = watchlistItems.length;
}

function addToFavorites(filmId) {
    const filmIdStr = filmId.toString();
    
    if (!favoris.includes(filmIdStr)) {
        favoris.push(filmIdStr);
        localStorage.setItem("favoris", JSON.stringify(favoris));
        alert("Film ajouté aux favoris !");
    } else {
        const index = favoris.indexOf(filmIdStr);
        favoris.splice(index, 1);
        localStorage.setItem("favoris", JSON.stringify(favoris));
        alert("Film retiré des favoris !");
    }
    afficherFavoris();
    renderFilms();
    renderWatchlist();
}

function removeFromFavorites(filmId) {
    const filmIdStr = filmId.toString();
    if (confirm('Retirer ce film des favoris ?')) {
        const index = favoris.indexOf(filmIdStr);
        if (index > -1) {
            favoris.splice(index, 1);
        }
        localStorage.setItem("favoris", JSON.stringify(favoris));
        afficherFavoris();
        renderFilms();
        renderWatchlist();
    }
}

function afficherFavoris() {
    const container = document.getElementById("favoritesList");
    if (!container) return;
    
    container.innerHTML = "";
    const favCount = document.getElementById("FavCount");
    if (favCount) favCount.textContent = favoris.length;

    if (favoris.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Aucun favori pour le moment</p></div>';
        return;
    }

    favoris.forEach(id => {
        const film = films.find(f => f.id == id);
        if (film) {
            const div = document.createElement("div");
            div.className = "watchlist-item";
            div.innerHTML = `
                <img src="${film.posterUrl}" alt="${film.title}" class="watchlist-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2280%22%3E%3Crect fill=%22%23667eea%22 width=%2260%22 height=%2280%22/%3E%3C/svg%3E'">
                <div class="watchlist-info">
                    <div class="watchlist-title">${film.title}</div>
                    <div class="watchlist-year">${film.year}</div>
                </div>
                <div class="watchlist-actions">
                    <button onclick="removeFromFavorites(${film.id})" class="remove-watchlist-btn">Retirer</button>
                </div>
            `;
            container.appendChild(div);
        }
    });
}

function addToWatchlistFromSearch(imdbId, title, year, posterUrl) {
    const exists = watchlistItems.find(w => w.imdbId === imdbId);
    if (exists) {
        alert('Ce film est déjà dans votre watchlist');
        return;
    }

    watchlistItems.push({
        id: Date.now(),
        imdbId: imdbId,
        title: title,
        year: year,
        posterUrl: posterUrl,
        dateAdded: new Date().toLocaleDateString('fr-FR')
    });

    saveData();
    renderWatchlist();
    alert('Film ajouté à la watchlist !');
}


