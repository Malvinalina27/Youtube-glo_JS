'use strict';



const gloAcademyList = document.querySelector('.glo-academy-list');
const trendingList = document.querySelector('.trending-list');
const musicList = document.querySelector('.music-list');

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


createList(gloAcademyList, gloAcademy);
createList(trendingList, trending);
createList(musicList, music);


// youtube API

const authBtn = document.querySelector('.auth-btn');
const userAvatar = document.querySelector('.user-avatar');

//отображение аватарки и скрывает кнопку войти / кнопка войти
const handleSuccessAuth = data => {
  authBtn.classList.add('hide');
  userAvatar.classList.remove('hide');
  userAvatar.src = data.getImageUrl();
  userAvatar.alt = dta.getName9;
  // временный вызов
  getChannel();
};
const handleNoAuth = () => {
  authBtn.classList.remove('hide');
  userAvatar.classList.add('hide');
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
}
// инициализация проекта
function initClient() {
  gapi.client.init({
    'clientId': CLIENT_ID,
    'scope': 'https://www.googleapis.com/auth/youtube.readonly',
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
  }).then(() => {
    updateStatusAuth(gapi.auth2.getAuthInstance());   
    authBtn.addEventListener('click', handleAuth);
    userAvatar.addEventListener('click', handleSignout);
  })
}

gapi.load('client:auth2', initClient);

const getChannel = () => {
  gapi.client.youtube.channels.list({
    part: 'snippet, statistics',
    id: 'UCVswRUcKC-M35RzgPRv8qUg',
  }).execute(response => {
    
  })
}