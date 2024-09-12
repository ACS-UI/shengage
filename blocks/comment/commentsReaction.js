/* eslint-disable no-console */
import { htmlToElement, debounce, getConfig } from '../../scripts/scripts.js';
import { loadScript } from '../../scripts/aem.js';

/**
 * Creates a reaction handler closure that encapsulates the inputElement and parent.
 * @param {HTMLElement} inputElement - The element where the selected GIFs and emojis.
 * @param {HTMLElement} parent - The parent element where the reaction widget will be appended.
 * @returns {Object} An object containing methods to handle GIF and emoji selection.
 */
function createReactionHandler(inputElement, parent, config) {
  /**
   * Inserts the selected GIF into the inputElement.
   * @param {string} gifUrl - The URL of the selected GIF.
   */
  const selectGIF = (gifUrl) => {
    inputElement.innerHTML += `<br><img src="${gifUrl}" alt="Selected GIF">`;
    const reactionPanel = parent.querySelector('.reaction-panel');
    reactionPanel.classList.remove('show');
  };

  /**
   * Creates an HTML image element for a GIF.
   * @param {Object} gif - The GIF object from the Giphy API.
   * @returns {HTMLImageElement} The image element representing the GIF.
   */
  const createGIFElement = (gif) => {
    const img = document.createElement('img');
    img.src = gif.images.fixed_height.url;
    img.alt = gif.title;
    img.addEventListener('click', () => selectGIF(gif.images.fixed_height.url));
    return img;
  };

  /**
   * Displays a list of GIFs inside the specified container.
   * @param {HTMLElement} gifElement - The container to display the GIFs.
   */
  const displayGIFs = (gifElement) => {
    if (gifElement instanceof HTMLElement) {
      gifElement.innerHTML = ''; // Clear existing GIFs
      const gifs = window.trendingGifs;
      gifs.forEach((gif) => {
        const img = createGIFElement(gif);
        gifElement.appendChild(img);
      });
    } else {
      console.error('gifElement is not a valid DOM element.');
    }
  };

  /**
   * Fetches GIFs from the Giphy API.
   * @param {string} url - The API endpoint to fetch GIFs from.
   * @returns {Promise<Array>} A promise that resolves to an array of GIF objects.
   */
  const fetchGIFs = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      return [];
    }
  };

  /**
   * Searches for GIFs based on a query and displays them.
   * @param {HTMLElement} gifElement - The container to display the GIFs.
   * @param {string} [query='trending'] - The search query.
   */
  const searchGIFs = (gifElement, query = 'trending') => {
    if (!window.gifPickerLoaded || query !== 'trending') {
      window.gifPickerLoaded = true;
      const API_KEY = getConfig().giphyApiKey;
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=9&rating=g`;
      fetchGIFs(url)
        .then((gifs) => {
          window.trendingGifs = gifs;
          displayGIFs(gifElement);
        })
        .catch((error) => console.error('Error fetching GIFs:', error));
    }
  };

  /**
  * Loads the emoji picker and handles emoji selection.
  * @param {HTMLElement} tabContent - The container to hold the emoji picker.
  * @param {HTMLElement} reactionPanel - The reaction panel to be toggled after emoji selection.
  */
  const loadEmojiPicker = async (parentElement, reactionPanel) => {
    if (!window.emojiPickerLoaded) {
      window.emojiPickerLoaded = true;
      await loadScript('https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js', { type: 'module' });
    }
    if (parentElement.querySelector('emoji-picker') !== null) {
      const emojiPicker = document.createElement('emoji-picker');
      parentElement.appendChild(emojiPicker);
      emojiPicker.addEventListener('emoji-click', (event) => {
        const emoji = event.detail.unicode;
        inputElement.innerHTML += emoji;
        console.log('Selected emoji:', emoji);
        reactionPanel.classList.remove('show');
      });
    }
  };

  /**
  * Loads the GIF picker, sets up search functionality, and handles GIF selection.
  * @param {HTMLElement} tabContent - The container to hold the GIF picker.
  */
  const loadGIFPicker = async (parentElement) => {
    const gifContainer = htmlToElement(`
      <div class="gif-picker-container">
        <input type="text" class="gif-search" placeholder="Search for GIFs...">
        <div class="gif-results"></div>
      </div>
      <div class="selected-gif-container"></div>`);
    parentElement.appendChild(gifContainer);

    const gifSearch = gifContainer.querySelector('.gif-search');
    const gifElement = gifContainer.querySelector('.gif-results');
    await searchGIFs(gifElement);

    gifSearch.addEventListener('input', debounce((event) => {
      const query = event.target.value.trim();
      if (query) {
        searchGIFs(gifElement, query);
      }
    }, 1000));
  };

  /**
   * Handles tab clicks to show the correct tab content.
   * @param {Event} e - The click event.
   * @param {NodeListOf<Element>} tabLinks - The list of tab link elements.
   * @param {HTMLElement} reactionWrapper - The container holding the reaction tabs.
   */
  const handleTabClick = (e, tabLinks, reactionWrapper) => {
    const tabItems = reactionWrapper.querySelectorAll('.reaction-tab-item');
    tabLinks.forEach((link) => link.classList.remove('active'));
    tabItems.forEach((item) => item.classList.remove('active'));
    const clickedTab = e.target;
    clickedTab.classList.add('active');
    const tabType = clickedTab.getAttribute('data-tab');
    const reactionTabContent = reactionWrapper.querySelector(`.reaction-tab-item.${tabType}`);
    reactionTabContent.classList.add('active');
  };

  /**
   * Attaches event listeners to the reaction widget.
   * @param {HTMLElement} reactionWrapper - The container holding the reaction widget.
   */
  const attachEventListeners = (reactionWrapper) => {
    const reactionButton = reactionWrapper.querySelector('.reaction-button');
    const reactionPanel = reactionWrapper.querySelector('.reaction-panel');
    const tabLinks = reactionWrapper.querySelectorAll('.reaction-tab-link');
    reactionButton.addEventListener('click', async () => {
      reactionPanel.classList.toggle('show');
      if (config.enableEmoji) {
        const tabItem = reactionWrapper.querySelector('.reaction-tab-item.emoji');
        await loadEmojiPicker(tabItem, reactionPanel);
      }
      if (config.enableGify) {
        const tabItem = reactionWrapper.querySelector('.reaction-tab-item.gif');
        await loadGIFPicker(tabItem);
      }
      // if (config.enableGify) {
      //   const gifElement = reactionWrapper.querySelector('.gif-results');
      //   displayGIFs(gifElement);
      // }
    });
    if (config.enableEmoji && config.enableGify) {
      tabLinks.forEach(async (tab) => {
        // const tabVal = tab.getAttribute('data-tab');
        // const tabItem = reactionWrapper.querySelector(`.reaction-tab-item.${tabVal}`);
        // loadReactions(tabVal, tabItem, reactionPanel);
        // await loadEmojiPicker(tabItem, reactionPanel);
        // await loadGIFPicker(tabItem);
        tab.addEventListener('click', (e) => {
          handleTabClick(e, tabLinks, reactionWrapper);
        });
      });
    }

    window.addEventListener('click', (event) => {
      if (!reactionButton.contains(event.target) && !event.target.closest('.reaction-panel')) {
        reactionPanel.classList.remove('show');
      }
    });
  };

  /**
   * Creates and appends the reaction widget to the parent element.
   * @returns {HTMLElement} The created reaction widget.
   */
  const createReactionWidget = () => {
    const widget = htmlToElement(`
      <div class="reaction-widget">
        <button class="reaction-button emoji-button" title="React with Emoji">😁</button>
        <div class="reaction-panel">
          <div class="reaction-tab-container">
            ${config.enableEmoji && config.enableGify ? `<div class="reaction-tab-header">
              <button class="reaction-tab-link active" data-tab="emoji">Emoji</button>
              <button class="reaction-tab-link" data-tab="gif">GIFs</button>
            </div>` : ''}
            <div class="reaction-tab-content">
            ${config.enableEmoji ? `<div class="reaction-tab-item emoji ${config.enableEmoji ? 'active' : ''}"></div>` : ''}
            ${config.enableGify ? `<div class="reaction-tab-item gif ${config.enableGify && !config.enableEmoji ? 'active' : ''}"></div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `);
    parent.prepend(widget);
    attachEventListeners(widget);
    return widget;
  };

  return {
    createReactionWidget,
  };
}

export default async function renderReactionWidget(parent, inputElement, config) {
  const reactionHandler = createReactionHandler(inputElement, parent, config);
  await reactionHandler.createReactionWidget();
  return true;
}
