import { getRegistry } from './registry.js';
import { DATA_DIR } from './constants.js';
import path from 'node:path';

export const getAssets = (type) => getRegistry(path.join(DATA_DIR, `${type}-registry.json`));
