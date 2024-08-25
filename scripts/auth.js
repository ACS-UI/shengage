// eslint-disable-next-line import/no-cycle, max-classes-per-file
import { getConfig } from './scripts.js';
import { loadScript } from './aem.js';

/**
 * Loads Adobe IMS library and initializes the IMS object.
 * @returns {Promise<void>} - Resolves when IMS is ready or rejects on timeout/error.
 */
export async function loadIms() {
  const { ims } = getConfig();
  if (window.imsLoaded) {
    return window.imsLoaded;
  }
  window.imsLoaded = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('IMS timeout')), 5000);
    window.adobeid = {
      scope: 'AdobeID,additional_info.company,additional_info.ownerOrg,avatar,openid,read_organizations,read_pc,session,account_cluster.read',
      locale: 'en_US',
      ...ims,
      onReady: () => {
        // eslint-disable-next-line no-console
        console.log('Adobe IMS Ready!');
        clearTimeout(timeout);
        resolve(); // Resolve the promise; consumers can now use window.adobeIMS
      },
      onError: (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    };
    loadScript('https://auth.services.adobe.com/imslib/imslib.min.js');
  });
  return window.imsLoaded;
}

/**
 * Fetches user data from Adobe IMS.
 * @returns {Promise<Object>} - The user data, including image, id, and name.
 */
export async function getUserData() {
  try {
    await loadIms();
    const profile = await window.adobeIMS.getProfile();
    return {
      image: '../assets/profile.png',
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

/**
 * Adds tooltips to all elements with the 'auth' class.
 * Tooltips prompt users to log in when hovering over these elements.
 */
export function addTooltips(block) {
  const authElements = block.querySelectorAll('.auth');
  authElements.forEach((element) => {
    const tooltipContainer = block.createElement('div');
    tooltipContainer.classList.add('tooltip-container');

    element.parentNode.insertBefore(tooltipContainer, element);
    tooltipContainer.appendChild(element);

    // Create and configure tooltip text
    const tooltip = block.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = 'Please login .....';
    tooltipContainer.appendChild(tooltip);
  });
}
