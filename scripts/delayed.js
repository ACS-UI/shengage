// eslint-disable-next-line import/no-cycle
import addLaunchScript from '../utils/common.js';
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
addLaunchScript();
