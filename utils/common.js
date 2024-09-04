import constants from './constants.js';

const addLaunchScript = () => {
    const script = document.createElement('script');
    script.src = constants.DEV_LAUNCH_SCRIPT;
    script.async = true;
    document.head.appendChild(script);
}

export default addLaunchScript;
