const adobeAnalyticWrapper = ({ ...obj }) => {
  const { state, event } = obj;
  let dataLayerObj = {};

  switch (event) {
    case 'socialClicks':
      dataLayerObj = {
        event: 'socialClicks',
        web: {
          webPageDetails: {
            name: document.title || '',
          },
        },
        social: {
          socialPlatform: '<social platform name>',
        },
      };
      break;
    case 'linkClicks':
      dataLayerObj = {
        event: 'linkClicks',
        web: {
          webPageDetails: {
            name: document.title || '',
          },
        },
        webInteraction: {
          linkName: state.linkName,
          linkRegion: '<link-position>',
          type: 'other',
        },
      };
      break;
    case 'pageLoaded':
      dataLayerObj = {
        event: 'pageLoaded',
        web: {
          webPageDetails: {
            name: document.title || '',

          },
        },
      };
      break;
    default:
      break;
  }

  window?.adobeDataLayer.push({
    ...dataLayerObj,
  });
};

const pushAnalytics = (obj) => {
  try {
    adobeAnalyticWrapper(obj);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('-Error in analutics wrapper', error);
  }
};

export { pushAnalytics };
export default adobeAnalyticWrapper;
// pushAnalytics({ state: { linkName: 'viewmore', linkRegion: 'example' } });
