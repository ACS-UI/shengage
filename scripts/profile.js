// eslint-disable-next-line import/no-cycle, max-classes-per-file
import { getConfig } from './scripts.js';
import { loadScript } from './aem.js';

/**
 * load IMS
 */
export async function loadIms() {
  const { ims } = getConfig();
  window.imsLoaded = window.imsLoaded || new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('IMS timeout')), 5000);
    window.adobeid = {
      scope:
        'AdobeID,additional_info.company,additional_info.ownerOrg,avatar,openid,read_organizations,read_pc,session,account_cluster.read',
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
    image: '../assets/profile.png',
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
