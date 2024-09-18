/**
 * get site config
 */
export default function getConfig() {
  if (window.shengage && window.shengage.config) {
    return window.shengage.config;
  }

  const HOSTS = [
    {
      env: 'PROD',
      hlxPreview: 'main--shengage--acs-ui.hlx.page',
      hlxLive: 'main--shengage--acs-ui.hlx.live',
    },
    {
      env: 'STAGE',
      hlxPreview: 'stage--shengage--acs-ui.hlx.page',
      hlxLive: 'stage--shengage--acs-ui.hlx.live',
    },
    {
      env: 'DEV',
      hlxPreview: 'dev--shengage--acs-ui.hlx.page',
      hlxLive: 'dev--shengage--acs-ui.hlx.live',
    },
  ];

  const currentHost = window.location.hostname;
  const currentEnv = HOSTS.find((hostObj) => Object.values(hostObj).includes(currentHost));
  const isProd = currentEnv?.env === 'PROD' || currentEnv?.authorUrl === 'author-p122525-e1219150.adobeaemcloud.com';
  const ppsOrigin = isProd ? 'https://pps.adobe.io' : 'https://pps-stage.adobe.io';
  const ims = {
    client_id: 'shengage',
    environment: isProd ? 'prod' : 'stg1',
  };

  window.shengage = window.shengage || {};
  window.shengage.config = {
    ims,
    adobeIoEndpoint: `https://51837-shengageapp${!isProd ? '-dev' : ''}.adobeioruntime.net/api/v1/web/shengage/`,
    giphyApiKey: 'vcXGLBipjtwyEqhVQgBf8yfU6wAegwA3',
    ppsOrigin,
  };
  return window.shengage.config;
}
