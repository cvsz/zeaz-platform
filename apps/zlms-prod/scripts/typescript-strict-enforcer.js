#!/usr/bin/env node

import fs from 'node:fs';

const tsconfig = {
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
    exactOptionalPropertyTypes: true,
    noFallthroughCasesInSwitch: true,
    forceConsistentCasingInFileNames: true,
    isolatedModules: true,
    skipLibCheck: false,
    allowJs: false,
    checkJs: false,
    jsx: 'react-jsx'
  },
  exclude: [
    'node_modules',
    'vendor',
    'dist',
    'build'
  ]
};

fs.writeFileSync(
  'tsconfig.strict.json',
  JSON.stringify(tsconfig, null, 2)
);

console.log('TypeScript strict configuration generated');
