/* eslint-disable no-console */
import { htmlToElement, debounce } from '../../scripts/scripts.js';
import { loadScript } from '../../scripts/aem.js';

const API_KEY = 'vcXGLBipjtwyEqhVQgBf8yfU6wAegwA3';

function selectGIF(gifUrl) {
  const mainComment = document.querySelector('.main-comment');
  mainComment.innerHTML = `${mainComment.innerText}<img src="${gifUrl}" alt="Selected GIF">`;
  console.log(`<img src="${gifUrl}" alt="Selected GIF">`);
}

function displayGIFs(gifs, gifResults) {
  gifResults.innerHTML = '';
  gifs.forEach((gif) => {
    const img = document.createElement('img');
    img.src = gif.images.fixed_height.url;
    img.alt = gif.title;
    img.addEventListener('click', () => selectGIF(gif.images.fixed_height.url));
    gifResults.appendChild(img);
  });
}

function searchGIFs(query, gifResults) {
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${query || 'trending'}&limit=9&rating=g`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => displayGIFs(data.data, gifResults))
    .catch((error) => console.error('Error fetching GIFs:', error));
}

async function loadReactions(tabType, tabContent) {
  const mainComment = document.querySelector('.main-comment');
  if (tabType === 'emoji') {
    if (!window.emojiPickerLoaded) {
      await loadScript('https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js', { type: 'module' });
      window.emojiPickerLoaded = true;
      const emojiPicker = document.createElement('emoji-picker');
      tabContent.appendChild(emojiPicker);
      // Listen for emoji selection
      emojiPicker.addEventListener('emoji-click', (event) => {
        const emoji = event.detail.unicode;
        mainComment.innerHTML = `${mainComment.innerHTML}${emoji}`;
        console.log('Selected emoji:', emoji);
      });
    }
  } else if (tabType === 'gif') {
    const gifContainer = htmlToElement(`
      <div class="gif-picker-container">
        <input type="text" class="gif-search" placeholder="Search for GIFs...">
        <div class="gif-results"></div>
      </div>
      <div class="selected-gif-container"></div>`);
    tabContent.appendChild(gifContainer);
    const gifSearch = gifContainer.querySelector('.gif-search');
    const gifResults = gifContainer.querySelector('.gif-results');
    searchGIFs('', gifResults);
    gifSearch.addEventListener('input', (event) => {
      const query = event.target.value.trim();
      if (query) {
        debounce(searchGIFs(query, gifResults), 3000);
      }
    });
  }
}

export default function loadReactionWidget(parent) {
  const reactionWrapper = htmlToElement(`<div class="reaction-widget">
    <button class="reaction-button emoji-button" title="React with Emoji">😁</button>
    <div class="reaction-panel">
      <div class="reaction-tab-container">
        <div class="reaction-tab-header">
          <button class="reaction-tab-link active" data-tab="emoji">Emoji</button>
          <button class="reaction-tab-link" data-tab="gif">GIFs</button>
        </div>
        <div class="reaction-tab-content">
          <div class="reaction-tab-item emoji active"></div>
          <div class="reaction-tab-item gif"></div>
        </div>
      </div>
    </div>
  </div>`);
  parent.prepend(reactionWrapper);
  const reactionButton = reactionWrapper.querySelector('.reaction-button');
  const reactionPanel = reactionWrapper.querySelector('.reaction-panel');
  const tabLinks = reactionWrapper.querySelectorAll('.reaction-tab-link');
  const tabItems = reactionWrapper.querySelectorAll('.reaction-tab-item');

  reactionButton.addEventListener('click', async () => {
    reactionPanel.classList.toggle('show');
  });
  tabLinks.forEach((tab) => {
    const tabval = tab.getAttribute('data-tab');
    const tabItem = reactionWrapper.querySelector(`.reaction-tab-item.${tabval}`);
    loadReactions(tabval, tabItem);
    tab.addEventListener('click', (e) => {
      tabLinks.forEach((link) => link.classList.remove('active'));
      tabItems.forEach((link) => link.classList.remove('active'));
      e.target.classList.add('active');
      const tabType = e.target.getAttribute('data-tab');
      const reactionTabContent = reactionWrapper.querySelector(`.reaction-tab-item.${tabType}`);
      reactionTabContent.classList.add('active');
    });
  });
  window.addEventListener('click', (event) => {
    if (!reactionButton.contains(event.target) && !event.target.closest('.reaction-panel')) {
      reactionPanel.classList.remove('show');
    }
  });
  return true;
}
