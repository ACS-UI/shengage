// eslint-disable-next-line import/no-cycle
import { pushAnalytics } from '../utils/analytics.js';
import { sampleRUM } from './aem.js';
import clickanalytics from "../utils/clickanalytics.js";

// Core Web Vitals RUM collection
sampleRUM('cwv');
pushAnalytics({ event: 'pageLoaded' });
clickanalytics();

// add more delayed functionality here
