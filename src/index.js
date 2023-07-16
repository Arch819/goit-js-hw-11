import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { searchPhotoApi } from './js/img-api';

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery__wrapp');
const load = document.querySelector('.load');
const loadMore = document.querySelector('.loader');
const upBtn = document.querySelector('.up-btn');

form.addEventListener('submit', onSearch);
upBtn.addEventListener('click', jumpUp);

let options = {
  root: null,
  rootMargin: '50px',
  threshold: 0.5,
};
Notify.init({
  width: '350px',
  timeout: 4000,
  fontSize: '16px',
  cssAnimationDuration: 600,
  cssAnimationStyle: 'from-bottom',
});
let observer = new IntersectionObserver(onInfiniteScroll, options);
let shownPage = 1;
let totalPages = 0;
let inputValue = null;
const simpleBox = new SimpleLightbox('.gallery__wrapp a', {
  captionsData: 'alt',
  captionDelay: 250,
});

setInterval(() => {
  const scrolledDistance = window.scrollY;
  console.log(scrolledDistance);
  if (scrolledDistance >= 600) {
    upBtn.classList.remove('is-hidden');
  } else {
    upBtn.classList.add('is-hidden');
  }
}, 1000);

function onSearch(event) {
  event.preventDefault();
  shownPage = 1;

  inputValue = event.target.elements.searchQuery.value.trim();
  if (!inputValue) {
    return Notify.failure('Enter the value to search for');
  }
  loadMore.classList.remove('is-hidden');
  searchPhotoApi(inputValue, shownPage)
    .then(resultSearch => {
      if (galleryEl.children.length) {
        galleryEl.innerHTML = '';
      }
      jumpUp();
      loadMore.classList.add('is-hidden');
      totalPages = Math.ceil(resultSearch.totalHits / 40);
      Notify.success(`Hooray! We found ${resultSearch.totalHits} images.`);
      onRenderCards(resultSearch);
      simpleBox.refresh();
      observer.observe(load);
    })
    .catch(error => {
      Notify.failure(error.message);
    });

  return inputValue;
}

async function onLoadMore() {
  shownPage += 1;
  loadMore.classList.remove('is-hidden');
  try {
    const resultSearch = await searchPhotoApi(inputValue, shownPage);
    loadMore.classList.add('is-hidden');
    onRenderCards(resultSearch);
    simpleBox.refresh();
    setTimeout(smoothScroll, 0);
  } catch (error) {
    Notify.failure(error.message);
  }
}

function onRenderCards(resultSearch) {
  const markup = resultSearch.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <a class="gallery-link" href="${largeImageURL}">
      <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="200px"/>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>${likes}
          </p>
          <p class="info-item">
            <b>Views</b>${views}
          </p>
          <p class="info-item">
            <b>Comments</b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>${downloads}
          </p>
        </div>
      </div>
    </a>
  `;
      }
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

function onInfiniteScroll(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (shownPage === totalPages) {
        loadMore.classList.add('is-hidden');
        observer.unobserve(load);
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      onLoadMore();
    }
  });
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery__wrapp')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function jumpUp() {
  const scrollTop = document.documentElement.scrollHeight;
  window.scrollBy({
    top: -scrollTop,
    behavior: 'smooth',
  });
}
