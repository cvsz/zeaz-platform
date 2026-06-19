export const validatePath = (p) => {
    // Prevent directory traversal: ensure it stays within apps/zai-factory/ or apps/
    return p.startsWith('apps/') && !p.includes('..');
};

export const validateContent = (data) => {
    // Ensure no secrets/sensitive data are passed in registry updates
    const forbiddenKeys = ['apiKey', 'password', 'secret', 'token'];
    const stringified = JSON.stringify(data).toLowerCase();
    for (const key of forbiddenKeys) {
        if (stringified.includes(key)) {
            return false;
        }
    }
    return true; 
};
