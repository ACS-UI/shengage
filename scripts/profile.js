import { loadScript } from './aem.js';

/**
 * get site config
 */
export function getConfig() {
  if (window.exlm && window.exlm.config) {
    return window.exlm.config;
  }
  const ims = {
    client_id: 'shengage',
    environment: 'stage',
  };

  window.exlm = window.exlm || {};
  window.exlm.config = {
    ims,
  };
  return window.exlm.config;
}

/**
 * load IMS
 */
export async function loadIms() {
  const { ims } = getConfig();
  window.imsLoaded = window.imsLoaded || new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('IMS timeout')), 5000);
    window.adobeid = {
      scope:
        'additional_info,AdobeID,openid,person',
      locale: 'en_US',
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
 * Fetches user data
 */
export async function getUserData() {
  return {
    avatar: '../assets/profile.png',
    id: (await window.adobeIMS.getProfile()).userId,
    name: (await window.adobeIMS.getProfile()).displayName,
  };
}

export async function isSignedInUser() {
  try {
    await loadIms();
    return window?.adobeIMS?.isSignedInUser() || false;
  } catch (err) {
    return false;
  }
}