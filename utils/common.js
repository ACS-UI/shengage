import constants from './constants.js';

const addLaunchScript = () => {
  let source;
  if (window.location.hostname.includes('adobe.com')) {
    source = constants.PROD_LAUNCH_SCRIPT;
  } else {
    source = constants.DEV_LAUNCH_SCRIPT;
  }
  const script = document.createElement('script');
  script.src = source;
  script.async = true;
  document.head.appendChild(script);
};

export default addLaunchScript;
