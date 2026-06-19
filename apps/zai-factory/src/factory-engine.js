import { logger } from './logger.js';
import { addJob } from './jobs.js';
import * as appGenerator from './generators/app-generator.js';
import * as registryGenerators from './generators/registry-generators.js';

export const runTask = async (taskType, config) => {
    logger.info(`Starting task: ${taskType}`);
    addJob({ taskType, config });
    
    switch (taskType) {
        case 'app:create':
            return await appGenerator.generate(config);
        case 'agent:create':
            return await registryGenerators.generateAgent(config);
        case 'skill:create':
            return await registryGenerators.generateSkill(config);
        case 'plugin:create':
            return await registryGenerators.generatePlugin(config);
        case 'workflow:create':
            return await registryGenerators.generateWorkflow(config);
        default:
            logger.error(`Unknown task type: ${taskType}`);
            throw new Error(`Unknown task type: ${taskType}`);
    }
};
