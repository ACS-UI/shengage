import { pushAnalytics } from './analytics.js';

const clickanalytics = () => {
  const anchorTags = document.querySelectorAll('a');

  anchorTags.forEach((anchor) => {
    const linkName = anchor.innerText || '';
    const linkRegion = anchor.closest('.block').getAttribute('data-block-name') || '';

    anchor.addEventListener('click', () => {
      pushAnalytics({ event: 'linkClicks', state: { linkName, linkRegion } });
    });
  });
};

export default clickanalytics;
