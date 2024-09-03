/* eslint-disable no-console */
import { htmlToElement, debounce, getConfig } from '../../scripts/scripts.js';
import { loadScript } from '../../scripts/aem.js';

let inputElement;

function selectGIF(gifUrl) {
  inputElement.innerHTML = `${inputElement.innerHTML}<br><img src="${gifUrl}" alt="Selected GIF">`;
}

function createGIFElement(gif) {
  const img = document.createElement('img');
  img.src = gif.images.fixed_height.url;
  img.alt = gif.title;
  img.addEventListener('click', () => selectGIF(gif.images.fixed_height.url));
  return img;
}

function displayGIFs(gifs, gifResults) {
  if (gifResults instanceof HTMLElement) {
    gifResults.innerHTML = ''; // Clear existing GIFs

    gifs.forEach((gif) => {
      const img = createGIFElement(gif);
      gifResults.appendChild(img);
    });
  } else {
    console.error('gifResults is not a valid DOM element.');
  }
}

function fetchGIFs(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => data.data);
}

function searchGIFs(gifResults, query = 'trending') {
  const API_KEY = getConfig().giphyApiKey;
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=9&rating=g`;
  fetchGIFs(url)
    .then((gifs) => displayGIFs(gifs, gifResults))
    .catch((error) => console.error('Error fetching GIFs:', error));
}

async function loadReactions(tabType, tabContent) {
  if (tabType === 'emoji') {
    if (!window.emojiPickerLoaded) {
      await loadScript('https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js', { type: 'module' });
      window.emojiPickerLoaded = true;
      const emojiPicker = document.createElement('emoji-picker');
      tabContent.appendChild(emojiPicker);
      // Listen for emoji selection
      emojiPicker.addEventListener('emoji-click', (event) => {
        const emoji = event.detail.unicode;
        inputElement.innerHTML = `${inputElement.innerHTML}${emoji}`;
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
    searchGIFs(gifResults);
    gifSearch.addEventListener('input', (event) => {
      const query = event.target.value.trim();
      if (query) {
        debounce(searchGIFs(gifResults, query), 3000);
      }
    });
  }
}

function handleTabClick(e, tabLinks, reactionWrapper) {
  const tabItems = reactionWrapper.querySelectorAll('.reaction-tab-item');
  tabLinks.forEach((link) => link.classList.remove('active'));
  tabItems.forEach((item) => item.classList.remove('active'));
  const clickedTab = e.target;
  clickedTab.classList.add('active');
  const tabType = clickedTab.getAttribute('data-tab');
  const reactionTabContent = reactionWrapper.querySelector(`.reaction-tab-item.${tabType}`);
  reactionTabContent.classList.add('active');
}

function attachEventListeners(reactionWrapper) {
  const reactionButton = reactionWrapper.querySelector('.reaction-button');
  const reactionPanel = reactionWrapper.querySelector('.reaction-panel');
  const tabLinks = reactionWrapper.querySelectorAll('.reaction-tab-link');
  reactionButton.addEventListener('click', () => {
    reactionPanel.classList.toggle('show');
  });

  tabLinks.forEach((tab) => {
    const tabVal = tab.getAttribute('data-tab');
    const tabItem = reactionWrapper.querySelector(`.reaction-tab-item.${tabVal}`);
    loadReactions(tabVal, tabItem, inputElement);

    tab.addEventListener('click', (e) => {
      handleTabClick(e, tabLinks, reactionWrapper);
    });
  });

  window.addEventListener('click', (event) => {
    if (!reactionButton.contains(event.target) && !event.target.closest('.reaction-panel')) {
      reactionPanel.classList.remove('show');
    }
  });
}

function createReactionWidget() {
  return htmlToElement(`
    <div class="reaction-widget">
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
    </div>
  `);
}

export default async function loadReactionWidget(parent, input) {
  inputElement = input;
  const reactionWrapper = await createReactionWidget();
  parent.prepend(reactionWrapper);
  attachEventListeners(reactionWrapper);
  return true;
}
