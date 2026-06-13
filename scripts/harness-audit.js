#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const scope = process.argv[2] || 'repo';
let format = 'text';
const formatIndex = process.argv.indexOf('--format');
if (formatIndex !== -1 && process.argv[formatIndex + 1]) {
    format = process.argv[formatIndex + 1];
}

const rootIndex = process.argv.indexOf('--root');
const rootDir = (rootIndex !== -1 && process.argv[rootIndex + 1]) ? process.argv[rootIndex + 1] : process.cwd();

function checkExists(subPath) {
    return fs.existsSync(path.join(rootDir, subPath));
}

const categories = [];
let totalScore = 0;
let maxScore = 0;
const failingChecks = [];
const topActions = [];

// 1. Tool Coverage
maxScore += 10;
if (checkExists('Makefile') || checkExists('package.json')) {
    categories.push({ name: 'Tool Coverage', score: 10, max: 10 });
    totalScore += 10;
} else {
    categories.push({ name: 'Tool Coverage', score: 0, max: 10 });
    failingChecks.push('Makefile or package.json not found');
    topActions.push('[Tool Coverage] Add standard build tools like Makefile or package.json');
}

// 2. Context Efficiency
maxScore += 10;
if (checkExists('.gitignore') || checkExists('.dockerignore')) {
    categories.push({ name: 'Context Efficiency', score: 10, max: 10 });
    totalScore += 10;
} else {
    categories.push({ name: 'Context Efficiency', score: 0, max: 10 });
}

// 3. Quality Gates
maxScore += 10;
if (checkExists('.github/workflows/validate.yml') || checkExists('.github/workflows/ci.yml')) {
    categories.push({ name: 'Quality Gates', score: 10, max: 10 });
    totalScore += 10;
} else {
    categories.push({ name: 'Quality Gates', score: 0, max: 10 });
    failingChecks.push('CI/CD workflows not found');
    topActions.push('[Quality Gates] Add CI/CD workflows under .github/workflows/');
}

// 4. Memory Persistence
maxScore += 10;
if (checkExists('docs/') || checkExists('README.md')) {
    categories.push({ name: 'Memory Persistence', score: 10, max: 10 });
    totalScore += 10;
} else {
    categories.push({ name: 'Memory Persistence', score: 0, max: 10 });
}

// 5. Eval Coverage
maxScore += 10;
if (checkExists('tests/') || checkExists('__tests__/')) {
    categories.push({ name: 'Eval Coverage', score: 10, max: 10 });
    totalScore += 10;
} else {
    categories.push({ name: 'Eval Coverage', score: 2, max: 10 });
    topActions.push('[Eval Coverage] Increase automated test coverage across scripts/hooks/lib. (tests/)');
}

// 6. Security Guardrails
maxScore += 10;
if (checkExists('SECURITY.md') || checkExists('.github/workflows/security-scanning.yml')) {
    categories.push({ name: 'Security Guardrails', score: 10, max: 10 });
    totalScore += 10;
} else {
    categories.push({ name: 'Security Guardrails', score: 5, max: 10 });
}

// 7. Cost Efficiency
maxScore += 10;
categories.push({ name: 'Cost Efficiency', score: 10, max: 10 });
totalScore += 10;

// 8. GitHub Integration
maxScore += 10;
if (checkExists('.github/workflows/')) {
    categories.push({ name: 'GitHub Integration', score: 10, max: 10 });
    totalScore += 10;
} else {
    categories.push({ name: 'GitHub Integration', score: 0, max: 10 });
    topActions.push('[GitHub Integration] Add at least one workflow under .github/workflows/. (.github/workflows/)');
}

// Conditional Integrations
if (checkExists('vercel.json') || checkExists('.vercel/')) {
    maxScore += 10;
    categories.push({ name: 'Vercel Integration', score: 10, max: 10 });
    totalScore += 10;
}

if (checkExists('netlify.toml') || checkExists('.netlify/')) {
    maxScore += 10;
    categories.push({ name: 'Netlify Integration', score: 10, max: 10 });
    totalScore += 10;
}

if (checkExists('wrangler.toml') || checkExists('wrangler.jsonc') || checkExists('infra/cloudflare/')) {
    maxScore += 10;
    categories.push({ name: 'Cloudflare Integration', score: 10, max: 10 });
    totalScore += 10;
}

if (checkExists('fly.toml')) {
    maxScore += 10;
    categories.push({ name: 'Fly Integration', score: 10, max: 10 });
    totalScore += 10;
}

const result = {
    overall_score: totalScore,
    max_score: maxScore,
    category_count: categories.length,
    applicable_categories: categories,
    failing_checks: failingChecks,
    top_actions: topActions,
    suggested_skills: ['zeaz-platform', 'cloudflare-best-practices']
};

if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
} else {
    console.log(`Harness Audit (${scope}, ${scope}): ${totalScore}/${maxScore}`);
    categories.forEach(cat => {
        console.log(`- ${cat.name}: ${cat.score}/${cat.max} (${cat.score}/${cat.max} pts)`);
    });
    
    if (topActions.length > 0) {
        console.log('\nTop Actions:');
        topActions.forEach((action, idx) => {
            console.log(`${idx + 1}) ${action}`);
        });
    }
}
