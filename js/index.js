const moviesListElement = document.getElementById("movies-list");
const searchInput = document.getElementById("search");

const debounceTime = (() => {
  let timerId = null;
  return (cb, ms) => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    timerId = setTimeout(cb, ms);
  };
})();

const getData = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.Search)
    .catch((err) => console.log(err));

const addMovieToList = ({ Poster: poster, Title: title, Year: year }) => {
  const item = document.createElement("div");
  const img = document.createElement("img");

  item.classList.add("movie");

  img.classList.add("movie__image");
  img.src = poster;
  img.alt = `${title} ${year}`;
  img.title = `${title} ${year}`;

  item.append(img);
  moviesListElement.append(item);
};

const inputSearchHandler = (e) =>
  debounceTime(() => {
    const searchQuery = e.target.value.trim();

    moviesListElement.innerHTML = "";

    if (!searchQuery || searchQuery.lenght < 4) return;

    getData(`http://www.omdbapi.com/?apikey=a69a8f20&s=${searchQuery}`).then(
      (movies) => movies.forEach((movie) => addMovieToList(movie)),
    );
  }, 2000);

searchInput.addEventListener("input", inputSearchHandler);

// const API_BASE = 'https://api.tvmaze.com';
// const SEARCH_ENDPOINT = `${API_BASE}/search/shows`;
// const MIN_QUERY_LENGTH = 3;
// const DEBOUNCE_MS = 300;

// const elements = {
//     input: document.getElementById('search-input'),
//     results: document.getElementById('results'),
//     loader: document.getElementById('loader'),
//     error: document.getElementById('error'),
//     status: document.getElementById('status')
// };

// let abortController = null;
// let debounceTimer = null;

// function showLoader() {
//     elements.loader.hidden = false;
//     elements.error.hidden = true;
//     elements.results.innerHTML = '';
//     elements.status.textContent = '';
// }

// function hideLoader() {
//     elements.loader.hidden = true;
// }

// function showError(message) {
//     elements.error.textContent = message;
//     elements.error.hidden = false;
//     elements.results.innerHTML = '';
//     elements.status.textContent = '';
// }

// function clearError() {
//     elements.error.hidden = true;
// }

// function createShowCard(show) {
//     const { name, year, type, image, id } = show;
//     const card = document.createElement('article');
//     card.className = 'show-card';
//     card.dataset.id = id;

//     const posterHtml = image?.medium
//         ? `<img class="show-card__poster" src="${image.medium}" alt="${name} poster" loading="lazy">`
//         : `<div class="show-card__poster--placeholder">Постер відсутній</div>`;

//     const premieredYear = year ? `(${year})` : '';
//     const showType = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Невідомо';

//     card.innerHTML = `
//         <div class="show-card__poster-wrapper">
//             ${posterHtml}
//         </div>
//         <div class="show-card__content">
//             <h2 class="show-card__title">${name} ${premieredYear}</h2>
//             <div class="show-card__meta">
//                 <span class="show-card__badge show-card__badge--type">${showType}</span>
//                 <span class="show-card__badge">ID: ${id}</span>
//             </div>
//         </div>
//     `;

//     return card;
// }

// function renderResults(shows) {
//     elements.results.innerHTML = '';

//     if (shows.length === 0) {
//         elements.status.textContent = 'Нічого не знайдено за вашим запитом';
//         return;
//     }

//     const fragment = document.createDocumentFragment();
//     shows.forEach(({ show }) => {
//         fragment.appendChild(createShowCard(show));
//     });

//     elements.results.appendChild(fragment);
//     elements.status.textContent = `Знайдено: ${shows.length}`;
// }

// async function searchShows(query) {
//     const url = `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}`;

//     abortController?.abort();
//     abortController = new AbortController();

//     try {
//         const response = await fetch(url, {
//             signal: abortController.signal,
//             headers: {
//                 'Accept': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//         }

//         const data = await response.json();

//         if (abortController.signal.aborted) return;

//         return data;
//     } catch (error) {
//         if (error.name === 'AbortError') return;
//         if (error instanceof TypeError && error.message.includes('fetch')) {
//             throw new Error('Помилка мережі. Перевірте підключення до інтернету.');
//         }
//         throw error;
//     }
// }

// function debounceSearch(query) {
//     clearTimeout(debounceTimer);

//     debounceTimer = setTimeout(async () => {
//         const trimmed = query.trim();

//         if (trimmed.length < MIN_QUERY_LENGTH) {
//             elements.results.innerHTML = '';
//             elements.status.textContent = `Мінімум ${MIN_QUERY_LENGTH} символи для пошуку`;
//             hideLoader();
//             return;
//         }

//         clearError();
//         showLoader();

//         try {
//             const data = await searchShows(trimmed);

//             if (!abortController?.signal.aborted) {
//                 renderResults(data);
//             }
//         } catch (error) {
//             if (!abortController?.signal.aborted) {
//                 showError(error.message);
//                 console.error('Search error:', error);
//             }
//         } finally {
//             if (!abortController?.signal.aborted) {
//                 hideLoader();
//             }
//         }
//     }, DEBOUNCE_MS);
// }

// function handleInput(event) {
//     debounceSearch(event.target.value);
// }

// function init() {
//     elements.input.addEventListener('input', handleInput);
//     elements.input.addEventListener('focus', () => {
//         if (elements.input.value.trim().length >= MIN_QUERY_LENGTH) {
//             debounceSearch(elements.input.value);
//         }
//     });

//     document.addEventListener('visibilitychange', () => {
//         if (document.hidden) {
//             abortController?.abort();
//             clearTimeout(debounceTimer);
//         }
//     });
// }

// document.addEventListener('DOMContentLoaded', init);
