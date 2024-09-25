const adobeAnalyticWrapper = ({ ...obj }) => {
  const { state, event } = obj;
  let dataLayerObj = {};

  switch (event) {
    case 'linkClick':
      dataLayerObj = {
        event: 'socialClicks',
        web: {
          webPageDetails: {
            name: ' <Page-Name> ',
          },
        },
        social: {
          socialPlatform: '<social platform name>',
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
