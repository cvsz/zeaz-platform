import { read, write } from './json-store.js';
import { DATA_DIR } from './constants.js';
import path from 'node:path';

const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

export const getJobs = () => read(JOBS_FILE) || { jobs: [] };
export const addJob = (job) => {
    const data = getJobs();
    data.jobs.push({ ...job, id: Date.now().toString(), status: 'pending' });
    write(JOBS_FILE, data);
};
