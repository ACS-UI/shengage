/**
 * get site config
 */
export default function getConfig() {
  if (window.shengage && window.shengage.config) {
    return window.shengage.config;
  }
  const ims = {
    client_id: 'shengage',
    environment: 'stg1',
  };
  const ppsOrigin = 'https://pps-stage.adobe.io';

  window.shengage = window.shengage || {};
  window.shengage.config = {
    ims,
    adobeIoEndpoint: 'https://51837-shengageapp-dev.adobeioruntime.net/api/v1/web/shengage/',
    giphyApiKey: 'vcXGLBipjtwyEqhVQgBf8yfU6wAegwA3',
    ppsOrigin,
  };
  return window.shengage.config;
}
