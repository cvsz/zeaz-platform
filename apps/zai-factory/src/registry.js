import { read, write } from './json-store.js';

export const getRegistry = (filePath) => read(filePath) || { items: [] };
export const saveRegistry = (filePath, data) => write(filePath, { ...data, generated_at: new Date().toISOString() });
