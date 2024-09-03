/* eslint-disable no-console */
import { htmlToElement, debounce, getConfig } from '../../scripts/scripts.js';
import { loadScript } from '../../scripts/aem.js';

/**
 * Creates a reaction handler closure that encapsulates the inputElement and parent.
 * @param {HTMLElement} inputElement - The element where the selected GIFs and emojis.
 * @param {HTMLElement} parent - The parent element where the reaction widget will be appended.
 * @returns {Object} An object containing methods to handle GIF and emoji selection.
 */
function createReactionHandler(inputElement, parent) {
  /**
   * Inserts the selected GIF into the inputElement.
   * @param {string} gifUrl - The URL of the selected GIF.
   */
  const selectGIF = (gifUrl) => {
    inputElement.innerHTML += `<br><img src="${gifUrl}" alt="Selected GIF">`;
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
   * @param {Array} gifs - The array of GIF objects.
   * @param {HTMLElement} gifResults - The container to display the GIFs.
   */
  const displayGIFs = (gifs, gifResults) => {
    if (gifResults instanceof HTMLElement) {
      gifResults.innerHTML = ''; // Clear existing GIFs

      gifs.forEach((gif) => {
        const img = createGIFElement(gif);
        gifResults.appendChild(img);
      });
    } else {
      console.error('gifResults is not a valid DOM element.');
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
   * @param {HTMLElement} gifResults - The container to display the GIFs.
   * @param {string} [query='trending'] - The search query.
   */
  const searchGIFs = (gifResults, query = 'trending') => {
    const API_KEY = getConfig().giphyApiKey;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=9&rating=g`;
    fetchGIFs(url)
      .then((gifs) => displayGIFs(gifs, gifResults))
      .catch((error) => console.error('Error fetching GIFs:', error));
  };

  /**
   * Loads the reactions based on the tab type.
   * @param {string} tabType - The type of tab ('emoji' or 'gif').
   * @param {HTMLElement} tabContent - The container to hold the tab content.
   */
  const loadReactions = async (tabType, tabContent) => {
    if (tabType === 'emoji') {
      if (!window.emojiPickerLoaded) {
        await loadScript('https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js', { type: 'module' });
        window.emojiPickerLoaded = true;
      }
      const emojiPicker = document.createElement('emoji-picker');
      tabContent.appendChild(emojiPicker);
      emojiPicker.addEventListener('emoji-click', (event) => {
        const emoji = event.detail.unicode;
        inputElement.innerHTML += emoji;
        console.log('Selected emoji:', emoji);
      });
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
          debounce(() => searchGIFs(gifResults, query), 3000)();
        }
      });
    }
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
    reactionButton.addEventListener('click', () => {
      reactionPanel.classList.toggle('show');
    });

    tabLinks.forEach((tab) => {
      const tabVal = tab.getAttribute('data-tab');
      const tabItem = reactionWrapper.querySelector(`.reaction-tab-item.${tabVal}`);
      loadReactions(tabVal, tabItem);

      tab.addEventListener('click', (e) => {
        handleTabClick(e, tabLinks, reactionWrapper);
      });
    });

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
    parent.prepend(widget);
    attachEventListeners(widget);
    return widget;
  };

  return {
    createReactionWidget,
  };
}

export default async function loadReactionWidget(parent, inputElement) {
  const reactionHandler = createReactionHandler(inputElement, parent);
  await reactionHandler.createReactionWidget();
  return true;
}
