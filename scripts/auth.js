// eslint-disable-next-line import/no-cycle, max-classes-per-file
import { loadIms } from './scripts.js';

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
export async function addTooltips(block) {
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
    tooltip.textContent = 'Please login .....';
    tooltipContainer.appendChild(tooltip);
    element.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isSignedIn) {
        window.adobeIMS.signIn();
      }
    });
  });
}
