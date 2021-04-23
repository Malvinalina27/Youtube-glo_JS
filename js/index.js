'use strict';

//меню show more
const navMenuMore = document.querySelector('.nav-menu-more');
const showMore = document.querySelector('.show-more');
// поиск
const formSearch = document.querySelector('.form-search');
// карточки с видео
const gloAcademyList = document.querySelector('.glo-academy-list');
const trendingList = document.querySelector('.trending-list');
const musicList = document.querySelector('.music-list');
//для youtubeAPI
const authBtn = document.querySelector('.auth-btn');
const userAvatar = document.querySelector('.user-avatar');
const auth = document.querySelector('.auth');



//создаю карточки с видео 
const createCard = dataVideo => {
  const imgUrl = dataVideo.snippet.thumbnails.high.url; //путь до миниатюры 
  const videoId = typeof dataVideo.id === 'string' ? dataVideo.id : dataVideo.id.videoId; // путь до видео
  const titleVideo = dataVideo.snippet.title; // название видео
  const viewCount = dataVideo.statistics?.viewCount; //количество просмотров
  const dateVideo = dataVideo.snippet.publishedAt; //время выгрузки видео
  const channelTitle = dataVideo.snippet.channelTitle; // название видео-канала

  const card = document.createElement('div');
  card.classList.add('video-card');
  card.innerHTML = `
    <div class="video-thumb">
      <a class="link-video youtube-modal" href="https://youtu.be/${videoId}">
        <img src="${imgUrl}" alt="" class="thumbnail">
      </a>
    </div>
    <h3 class="video-title">${titleVideo}</h3>
    <div class="video-info">
      <span class="video-counter">
        ${viewCount ? `<span class="video-views">${viewCount} views</span>` : ''}    
        <span class="video-date">${(new Date(dateVideo)).toLocaleString("ru-RU")}</span>
      </span>
      <span class="video-channel">${channelTitle}</span>
    </div>
  `;
  return card;
};

// перебираю карточки и вставляю нужные данные
const createList = (wrapper, listVideo) => {
  wrapper.textContent = '';
  listVideo.forEach(item => wrapper.append(createCard(item)));
};


// youtube API

//отображение аватарки и скрывает кнопку войти / кнопка войти
const handleSuccessAuth = data => {
  authBtn.classList.add('hide');
  userAvatar.classList.remove('hide');
  auth.style.border = 'none';
  userAvatar.src = data.getImageUrl();
  userAvatar.alt = data.getName;
};
const handleNoAuth = () => {
  authBtn.classList.remove('hide');
  userAvatar.classList.add('hide');
  auth.style.border = '1px solid #888';
  userAvatar.src = '';
  userAvatar.alt = '';
};
// авторизация
const handleAuth = () => {
  gapi.auth2.getAuthInstance().signIn();
};
// выход
const handleSignout = () => {
  gapi.auth2.getAuthInstance().signOut();
};
// проверка авторизован пользователь или нет
const updateStatusAuth = data => {
  data.isSignedIn.listen(() => {
    updateStatusAuth(data);
  });
  if (data.isSignedIn.get()) {
    const userData = data.currentUser.get().getBasicProfile();
    handleSuccessAuth(userData);
  } else {
    handleNoAuth();
  }
};

// инициализация проекта
function initClient() {
  gapi.client.init({
    'clientId': CLIENT_ID,
    'scope': 'https://www.googleapis.com/auth/youtube.readonly',
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
  })
  .then(() => {
    updateStatusAuth(gapi.auth2.getAuthInstance());   
    authBtn.addEventListener('click', handleAuth);
    userAvatar.addEventListener('click', handleSignout);
  })
  .then(loadScreen)
  .catch(e => {
    console.warm(e);
  });
};

gapi.load('client:auth2', initClient);

const getChannel = () => {
  gapi.client.youtube.channels.list({
    part: 'snippet, statistics',
    id: 'UCVswRUcKC-M35RzgPRv8qUg',
  }).execute(response => {
    
  })
};

// получаем актуальные данные
const requestVideos = (channelId, callback, maxResults = 6) => {
  gapi.client.youtube.search.list({
    part: 'snippet',
    channelId,
    maxResults,
    order: 'date',
  }).execute(response => {
    callback(response.items)
  })
};
const requestTrending = (callback, maxResults = 6) => {
  gapi.client.youtube.videos.list({
    part: 'snippet, statistics',
    chart: 'mostPopular',
    regionCode: "RU",
    maxResults,    
  }).execute(response => {
    callback(response.items)
  })
};
const requestMusic = (callback, maxResults = 6) => {
  gapi.client.youtube.videos.list({
    part: 'snippet, statistics',
    chart: 'mostPopular',
    regionCode: "RU",
    maxResults,
    videoCategoryId: '10', //вывод музыки, игры 20
  }).execute(response => {
    callback(response.items)
  })
};

// запрос на поиск
const requestSearch = (searchText, callback, maxResults = 12) => {
  gapi.client.youtube.search.list({
    part: 'snippet',
    q: searchText,
    maxResults,
    order: 'relevance',
  }).execute(response => {
    callback(response.items)
  })
}

// вывод в subscriptions !
const requestSubscriptions = (callback, maxResults = 6) => {
  gapi.client.youtube.subscriptions.list({
    part: 'snippet',
    mine: true,
    maxResults,
    order: 'relevance',
  }).execute(response => {
    callback(response.items)
  })
};

// данные с каналов
const loadScreen = () => {
  requestVideos('UCVswRUcKC-M35RzgPRv8qUg', data => {
    createList(gloAcademyList, data);
  })

  requestTrending(data => {
    createList(trendingList, data);
  })

  requestMusic(data => {
    createList(musicList, data);    
  })
};

//меню show more
showMore.addEventListener('click', e => {
  e.preventDefault();
  navMenuMore.classList.toggle('nav-menu-more-show');
});

//форма с поиском
formSearch.addEventListener('submit', e => {
  e.preventDefault();
  const value = formSearch.elements.search.value;
  requestSearch(value, data => {
    console.log(data);
  });
});

