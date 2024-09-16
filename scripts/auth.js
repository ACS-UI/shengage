// eslint-disable-next-line import/no-cycle, max-classes-per-file
import { loadIms } from './scripts.js';
import getConfig from './config.js';

/**
 * Checks if the user is signed in.
 * @returns {Promise<boolean>} - True if the user is signed in, otherwise false.
 */
export async function isSignedInUser() {
  try {
    await loadIms();
    return window?.adobeIMS?.isSignedInUser() || false;
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
}

export async function getPPSProfile() {
  const isSignedIn = await isSignedInUser();
  if (!isSignedIn) return null;

  const { token } = window.adobeIMS.getAccessToken();
  const accountId = (await window.adobeIMS.getProfile()).userId;

  const { ppsOrigin, ims } = getConfig();

  const promise = new Promise((resolve, reject) => {
    fetch(`${ppsOrigin}/api/profile`, {
      headers: {
        'X-Api-Key': ims.client_id,
        'X-Account-Id': accountId,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : undefined))
      .then((json) => {
        if (json) resolve(json);
        else reject(new Error('Failed to fetch PPS profile'));
      })
      .catch(reject);
  });
  return promise;
}

/**
 * Fetches user data from Adobe IMS.
 * @returns {Promise<Object>} - The user data, including image, id, and name.
 */
export async function getUserData() {
  try {
    await loadIms();
    const profile = await window.adobeIMS.getProfile();
    const ppsProfile = await getPPSProfile();

    return {
      image: ppsProfile ? ppsProfile?.images['50'] : '../assets/profile.png',
      id: profile.userId,
      name: profile.displayName,
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      image: '../assets/profile.png',
      id: null,
      name: 'Unknown',
    };
  }
}

/**
 * Adds tooltips to all elements with the 'auth' class.
 * Tooltips prompt users to log in when hovering over these elements.
 */
export async function addTooltips(block, msg) {
  const isSignedIn = await isSignedInUser();
  const authElements = block.querySelectorAll('.auth');
  authElements.forEach((element) => {
    const tooltipContainer = document.createElement('div');
    tooltipContainer.classList.add('tooltip-container');

    element.parentNode.insertBefore(tooltipContainer, element);
    tooltipContainer.appendChild(element);

    // Create and configure tooltip text
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = msg;
    tooltipContainer.appendChild(tooltip);
    element.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isSignedIn) {
        window.adobeIMS.signIn();
      }
    });
  });
}
