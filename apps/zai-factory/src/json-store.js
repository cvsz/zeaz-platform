import fs from 'node:fs';
import path from 'node:path';
import { logger } from './logger.js';

export const read = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        logger.error(`Error reading ${filePath}: ${e.message}`);
        return null;
    }
};

export const write = (filePath, data) => {
    const tempPath = `${filePath}.tmp`;
    try {
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tempPath, filePath);
    } catch (e) {
        logger.error(`Error writing ${filePath}: ${e.message}`);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        throw e;
    }
};
