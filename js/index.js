'use strict';

const content = document.querySelector('.content');
const subscriptionsList = document.querySelector('.subscriptions-list');
const navLinkLiked = document.querySelectorAll('.nav-link-liked');
//меню show more
const navMenuMore = document.querySelector('.nav-menu-more');
const showMore = document.querySelector('.show-more');
// поиск
const formSearch = document.querySelector('.form-search');
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

  const card = document.createElement('li');
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
        ${viewCount ? `<span class="video-views">${getViewer(viewCount)}</span>` : ''}    
        <span class="video-date">${getDate(dateVideo)}</span>
      </span>
      <span class="video-channel">${channelTitle}</span>
    </div>
  `;
  return card;
};

// создание section с карточками, перебор карточек и вставляю нужные данные
const createList = (listVideo, title, clear) => {
  
  const channel = document.createElement('section');
  channel.classList.add('channel');

  if (clear) {
    content.textContent = '';    
  }
  if (title) {
    const header = document.createElement('h2');
    header.textContent = title;
    channel.insertAdjacentElement('afterbegin', header);
  }

  const wrapper = document.createElement('ul');
  wrapper.classList.add('video-list');
  channel.insertAdjacentElement('beforeend', wrapper);

  listVideo.forEach(item => {
    const card = createCard(item);
    wrapper.append(card)
  });

  content.insertAdjacentElement('beforeend', channel);
};

// список подписок, ошибок нет 
const createSubList = listVideo => {
  // чистится лист с подписками
  subscriptionsList.textContent = '';
  listVideo.forEach(item => {
    const { resourceId: { channelId: id }, title, thumbnails: { high: { url } } } = item.snippet;
    const html = `
      <li class="nav-item">
        <a href="#" class="nav-link" data-channel-id="${id}" data-title="${title}">
          <img src="${url}" alt="${title}" class="nav-image">
          <span class="nav-text">${title} </span>
        </a>
      </li>
    `;
    // создаётся актуальный лист с подписками
    subscriptionsList.insertAdjacentHTML('beforeend', html);
  });
};


// дата (3 дня назад)
const getDate = date => {
  const currentDay = Date.parse(new Date());
  const days = Math.round((currentDay - Date.parse(new Date(date))) / 86400000);
  if (days > 30) {
    if (days > 60) {
      return Math.round(days/30) + ' month ago';
    }
    return 'One month ago';
  }
  
  if (days > 1) {
    return Math.round(days) + ' days ago';
  }
  return 'One day ago';
};
// количество просмотров
const getViewer = count => {
  if (count >= 1000000) {
    return Math.round(count / 1000000) + 'M views';
  }
  if (count >= 1000) {
    return Math.round(count / 1000) + 'K views';
  }
  return count + ' views';
};

// youtube API

//отображение аватарки и скрывает кнопку войти / кнопка войти
const handleSuccessAuth = data => {
  authBtn.classList.add('hide');
  userAvatar.classList.remove('hide');
  auth.style.border = 'none';
  userAvatar.alt = data.getName();
  userAvatar.src = data.getImageUrl();
  requestSubscriptions(createSubList);
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

// вывод в subscriptions
const requestSubscriptions = (callback, maxResults = 6) => {
  gapi.client.youtube.subscriptions.list({
    part: 'snippet',
    mine: true,
    maxResults,
    order: 'relevance',
  }).execute(response => {
    callback(response.items);
  })
};

const requestLike = (callback, maxResults = 6) => {
  gapi.client.youtube.videos.list({
    part: 'snippet, statistics',
    maxResults,
    myRating: 'like',
  }).execute(response => {
    callback(response.items);
  })
};

// данные с каналов
const loadScreen = () => {
  
  requestVideos('UCVswRUcKC-M35RzgPRv8qUg', data => {
    content.textContent = '';
    createList(data, 'Glo Academy');

    requestTrending(data => {
      createList(data, 'Популярные видео');

      requestMusic(data => {
        createList(data, 'Популярная музка');    
      });
    });  
  });

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
    createList(data, 'Результат поиска', true);
  });
});

subscriptionsList.addEventListener('click', e => {
  e.preventDefault();
  const target = e.target; 
  const linkChannel = target.closest('.nav-link');
  const channelId = linkChannel.dataset.channelId;
  const title = linkChannel.dataset.title;
  requestVideos(channelId, data => {
    createList(data, title, true);
  }, 12);
});

navLinkLiked.forEach(elem => {
  elem.addEventListener('click', e => {
    e.preventDefault();
    requestLike(data => {
      createList(data, 'Понравившиеся видео', true)
    }, 9)
  });
});
