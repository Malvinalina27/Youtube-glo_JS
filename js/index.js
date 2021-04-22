'use strict';



const gloAcademyList = document.querySelector('.glo-academy-list');
const trendingList = document.querySelector('.trending-list');
const musicList = document.querySelector('.music-list');

//создаю карточки с видео 
const createCard = dataVideo => {
  const imgUrl = dataVideo.snippet.thumbnails.high.url; //путь до миниатюры 
  const videoId = dataVideo.id.videoId; // путь до видео
  const titleVideo = dataVideo.snippet.title; // название видео
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
        <span class="video-date">${dateVideo}</span>
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