// eslint-disable-next-line import/no-cycle, max-classes-per-file
import addLaunchScript from '../utils/common.js';
import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  loadScript,
} from './aem.js';

import getConfig from './config.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads Adobe IMS library and initializes the IMS object.
 * @returns {Promise<void>} - Resolves when IMS is ready or rejects on timeout/error.
 */
export async function loadIms() {
  const { ims } = getConfig();
  window.imsLoaded = window.imsLoaded || new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('IMS timeout')), 5000);
    window.adobeid = {
      scope: 'AdobeID,additional_info.company,additional_info.ownerOrg,avatar,openid,read_organizations,read_pc,session,account_cluster.read,pps.read',
      locale: 'en',
      ...ims,
      onReady: () => {
        // eslint-disable-next-line no-console
        console.log('Adobe IMS Ready!');
        resolve(); // resolve the promise, consumers can now use window.adobeIMS
        clearTimeout(timeout);
      },
      onError: reject,
    };
    loadScript('https://auth.services.adobe.com/imslib/imslib.min.js');
  });
  return window.imsLoaded;
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  addLaunchScript();
  const main = doc.querySelector('main');
  loadIms(); // start it early, asyncronously
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * creates an element from html string
 * @param {string} html
 * @returns {HTMLElement}
 */
export function htmlToElement(html) {
  const template = document.createElement('template');
  const trimmedHtml = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = trimmedHtml;
  return template.content.firstElementChild;
}

/**
 * Extracts authored data from the child nodes of a block element.
 * @param {HTMLElement} block - The parent block element containing child nodes with authoring data.
 * @returns {Object} authorData - An object containing the extracted data
 */
export const getAuthoredData = (block) => {
  const authorData = {};

  block.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const [firstChild, secondChild] = child.children;
      let key = firstChild.textContent.trim();
      let value = secondChild?.textContent.trim();

      // Check if key contains 'obj', then modify key and split value by comma
      if (key.includes('obj')) {
        key = key.replace('obj', '').trim();
        value = value ? value.split(',').map((item) => item.trim()) : [];
      }
      authorData[key] = value;
    }
  });

  return authorData;
};

/**
 * Makes an API request using the specified method, endpoint, and data.
 * @param {Object} params - The parameters for the API request.
 * @param {string} [params.method='GET'] - The HTTP method (GET or POST).
 * @param {string} params.endpoint - The specific API endpoint to call.
 * @param {Object} [params.data={}] - The data to be sent in the body for POST requests.
 * @returns {Promise<*>} The parsed JSON response from the API.
 * @throws {Error} If the request fails or the response is not ok.
 */
export async function apiRequest({
  method = 'GET',
  endpoint,
  data = {},
  headers,
}) {
  try {
    const { adobeIoEndpoint } = getConfig();
    const url = `${adobeIoEndpoint}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (method === 'POST') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`${method} request to ${endpoint} successful:`, result);
    return result;
  } catch (error) {
    console.error(`${method} request to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Creates a debounce function that delays the execution of the callback function.
 * @param {Function} callback - The function to be debounced.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} A debounced function that delays the callback execution.
 */
export function debounce(callback, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback.apply(this, args), delay);
  };
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
