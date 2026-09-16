const moviesListElement = document.getElementById("movies-list");
const searchInput = document.getElementById("search");
const statusElement = document.getElementById("status");
const loaderElement = document.getElementById("loader");
const errorElement = document.getElementById("error");

const API_KEY = "a69a8f20";
const API_BASE_URL = "https://www.omdbapi.com/";
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

let searchAbortController = null;

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

const getData = (url, signal) =>
  fetch(url, { signal })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then((data) => {
      if (signal?.aborted) return [];
      if (data.Response === "False") throw new Error(data.Error || "Not found");
      return data.Search ?? [];
    })
    .catch((err) => {
      if (err.name === "AbortError") throw err;
      if (err instanceof TypeError && String(err.message).includes("fetch")) {
        throw new Error("Помилка мережі. Перевірте підключення до інтернету.");
      }
      throw err;
    });

const showLoader = () => {
  loaderElement.hidden = false;
};
const hideLoader = () => {
  loaderElement.hidden = true;
};
const showError = (message) => {
  const normalized = /not found/i.test(message)
    ? "Нічого не знайдено за вашим запитом"
    : message;
  errorElement.textContent = normalized;
  errorElement.hidden = false;
};
const hideError = () => {
  errorElement.hidden = true;
  errorElement.textContent = "";
};
const setStatus = (message) => {
  statusElement.textContent = message;
};

const createMovieCard = ({
  Poster: poster,
  Title: title,
  Year: year,
  Type: type,
}) => {
  const item = document.createElement("article");
  item.classList.add("movie");

  if (poster && poster !== "N/A") {
    const img = document.createElement("img");
    img.classList.add("movie__image");
    img.src = poster;
    img.alt = `${title} ${year}`;
    img.title = `${title} ${year}`;
    img.loading = "lazy";
    item.append(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.classList.add("movie__image", "movie__poster--placeholder");
    placeholder.textContent = "Постер відсутній";
    item.append(placeholder);
  }

  const titleElement = document.createElement("h3");
  titleElement.classList.add("movie__title");
  titleElement.textContent = title ?? "Без назви";
  titleElement.title = title ?? "";
  item.append(titleElement);

  const yearElement = document.createElement("p");
  yearElement.classList.add("movie__year");
  yearElement.textContent = year ?? "—";
  item.append(yearElement);

  const typeElement = document.createElement("span");
  typeElement.classList.add("movie__type");
  typeElement.textContent = type ?? "unknown";
  item.append(typeElement);

  return item;
};

const renderMovies = (movies) => {
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => fragment.append(createMovieCard(movie)));
  moviesListElement.append(fragment);
};

const inputSearchHandler = (e) => {
  const searchQuery = e.target.value.trim();

  debounceTime(async () => {
    searchAbortController?.abort();
    searchAbortController = new AbortController();
    const { signal } = searchAbortController;

    moviesListElement.innerHTML = "";
    hideError();
    setStatus("");

    if (!searchQuery) return;

    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setStatus(`Мінімум ${MIN_QUERY_LENGTH} символи для пошуку`);
      return;
    }

    showLoader();

    try {
      const movies = await getData(
        `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchQuery)}`,
        signal,
      );

      if (signal.aborted) return;

      if (!movies || movies.length === 0) {
        setStatus("Нічого не знайдено за вашим запитом");
        return;
      }

      renderMovies(movies);
      setStatus(`Знайдено: ${movies.length}`);
    } catch (err) {
      if (err.name === "AbortError" || signal.aborted) return;
      moviesListElement.innerHTML = "";
      setStatus("");
      showError(err.message);
      console.error("Search error:", err);
    } finally {
      if (searchAbortController?.signal === signal) hideLoader();
    }
  }, DEBOUNCE_MS);
};

searchInput.addEventListener("input", inputSearchHandler);
