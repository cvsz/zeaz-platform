import { getRegistry } from './registry.js';
import { DATA_DIR } from './constants.js';
import path from 'node:path';

export const getApps = () => getRegistry(path.join(DATA_DIR, 'apps-registry.json'));
