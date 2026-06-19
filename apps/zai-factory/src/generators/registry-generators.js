import { logger } from '../logger.js';
import { safeWrite } from '../fs-safe.js';
import path from 'node:path';

const scaffold = (config, type) => {
    logger.info(`Generating ${type}: ${config.name}`);
    const destPath = path.join('apps', 'zai-factory', 'generated', `${type}s`, config.name);
    
    safeWrite(path.join(destPath, 'package.json'), {
        name: `${type}-${config.name}`,
        version: '0.1.0'
    });
    
    logger.info(`${type} generated at ${destPath}`);
    return { path: destPath };
};

export const generateAgent = (config) => scaffold(config, 'agent');
export const generateSkill = (config) => scaffold(config, 'skill');
export const generatePlugin = (config) => scaffold(config, 'plugin');
export const generateWorkflow = (config) => scaffold(config, 'workflow');
