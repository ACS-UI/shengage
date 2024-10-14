/**
 * get site config
 */
export default function getConfig() {
  if (window.shengage && window.shengage.config) {
    return window.shengage.config;
  }

  const HOSTS = ['main--shengage--acs-ui.hlx.page', 'main--shengage--acs-ui.hlx.live', 'https://shengage.adobe.com'];

  const currentHost = window.location.hostname;
  const currentEnv = HOSTS.includes(currentHost);
  const isProd = currentEnv === 'PROD';
  const ppsOrigin = isProd ? 'https://pps.adobe.io' : 'https://pps-stage.adobe.io';
  const ims = {
    client_id: 'shengage',
    environment: isProd ? 'prod' : 'stg1',
  };

  window.shengage = window.shengage || {};
  window.shengage.config = {
    ims,
    adobeIoEndpoint: `https://51837-shengageapp${!isProd ? '-stage' : ''}.adobeioruntime.net/api/v1/web/shengage`,
    giphyApiKey: 'vcXGLBipjtwyEqhVQgBf8yfU6wAegwA3',
    ppsOrigin,
  };
  return window.shengage.config;
}
