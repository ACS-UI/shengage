// eslint-disable-next-line import/no-cycle
import { pushAnalytics } from '../utils/Analytics.js';
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');
pushAnalytics({ event: 'pageLoaded' });

// add more delayed functionality here
