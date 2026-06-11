const fs = require('fs');

function patch(path, patterns) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    for (const [from, to] of patterns) {
        content = content.replace(from, to);
    }
    fs.writeFileSync(path, content);
}

const commonPatterns = [
    // Backgrounds & Borders
    [/bg-white/g, 'bg-cyber-surface'],
    [/border-slate-200/g, 'border-white/10'],
    [/border-slate-300/g, 'border-white/20'],
    [/bg-slate-50/g, 'bg-white/5'],
    [/bg-indigo-50/g, 'bg-cyber-cyan/10'],
    [/border-indigo-100/g, 'border-cyber-cyan/30'],
    
    // Gradients
    [/bg-gradient-to-br from-slate-900 to-slate-800/g, 'bg-glass-gradient'],
    [/bg-gradient-to-br from-indigo-950 to-slate-900/g, 'bg-glass-gradient'],
    
    // Text Colors
    [/text-slate-900/g, 'text-slate-100'],
    [/text-slate-950/g, 'text-white'],
    [/text-slate-800/g, 'text-slate-200'],
    [/text-slate-700/g, 'text-slate-300'],
    [/text-slate-600/g, 'text-slate-400'],
    [/text-slate-500/g, 'text-slate-500'],
    [/text-indigo-600/g, 'text-cyber-cyan'],
    [/text-indigo-700/g, 'text-cyber-cyan'],
    [/text-indigo-900/g, 'text-cyber-cyan'],
    [/text-indigo-200/g, 'text-cyber-cyan'],
    
    // Buttons
    [/className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"/g, 'className="cyber-button-primary"'],
    [/className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"/g, 'className="cyber-button-primary"'],
    [/className="rounded-xl bg-indigo-700 px-5 py-2\.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0\.5 hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"/g, 'className="cyber-button-primary"'],
    [/className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"/g, 'className="cyber-button-secondary"'],
    [/className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"/g, 'className="cyber-button-primary"'],
    [/className="mt-6 rounded-xl bg-indigo-700 px-5 py-2\.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0\.5 hover:bg-indigo-800"/g, 'className="cyber-button-primary mt-6"'],
    
    // Cards & Panels
    [/rounded-3xl border border-white\/10 bg-cyber-surface p-5/g, 'cyber-card p-5'],
    [/rounded-2xl border border-white\/10 bg-cyber-surface p-5/g, 'cyber-card p-5'],
    [/rounded-3xl border border-white\/10 bg-cyber-surface p-6/g, 'cyber-card p-6'],
    [/rounded-2xl border border-white\/10 bg-cyber-surface p-4/g, 'cyber-card p-4'],
    
    // Inputs
    [/focus:border-indigo-500 focus:ring-indigo-500/g, 'focus:border-cyber-cyan focus:ring-cyber-cyan'],
    [/focus:ring-indigo-100/g, 'focus:ring-cyber-cyan/30'],
    [/focus:border-indigo-300/g, 'focus:border-cyber-cyan/50'],
];

patch('src/app/dashboard/hyperframes/batch/page.tsx', commonPatterns);
patch('src/app/dashboard/hyperframes/ops/page.tsx', commonPatterns);
patch('src/app/dashboard/hyperframes/ops/queue/page.tsx', commonPatterns);
patch('src/app/dashboard/hyperframes/renders/page.tsx', commonPatterns);

