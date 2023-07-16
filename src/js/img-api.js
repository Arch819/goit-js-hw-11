const API_URL = 'https://pixabay.com/api/';
import axios from 'axios';

export async function searchPhotoApi(term, shownPage) {
  const option = {
    headers: {
      'Content-type': 'application/json',
    },
    params: {
      key: '38286600-4fb6f6569bd6cc1d5b65d3854',
      q: `${term}`,
      image_type: 'photo',
      photo: 'horizontal',
      safesearch: 'true',
      page: `${shownPage}`,
      per_page: 40,
    },
  };
  return await axios.get(API_URL, option).then(response => {
    const resultSearch = response.data;
    if (resultSearch.totalHits < 1) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    return resultSearch;
  });
}
