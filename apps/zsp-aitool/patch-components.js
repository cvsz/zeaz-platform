const fs = require('fs');

function patch(path, patterns) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    for (const [from, to] of patterns) {
        content = content.replace(from, to);
    }
    fs.writeFileSync(path, content);
}

patch('src/components/hyperframes/RenderJobCard.tsx', [
    [/const actionClass = "rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1";/g, 'const actionClass = "cyber-button-secondary";'],
    [/className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"/g, 'className="cyber-card p-5"'],
    [/text-slate-900/g, 'text-slate-100'],
    [/text-slate-500/g, 'text-slate-400'],
    [/text-slate-600/g, 'text-slate-300'],
    [/text-rose-600/g, 'text-rose-400'],
    [/text-slate-400/g, 'text-slate-500'],
    [/bg-slate-50/g, 'bg-white/5'],
    [/border-slate-100/g, 'border-white/10'],
    [/className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"/g, 'className="cyber-button-primary"']
]);

patch('src/components/hyperframes/TemplateSelector.tsx', [
    [/className="space-y-2 rounded border border-slate-200 bg-white p-3"/g, 'className="space-y-2 rounded border border-white/10 bg-cyber-surface2 p-3"'],
    [/text-slate-700/g, 'text-slate-200'],
    [/text-slate-900/g, 'text-slate-100'],
    [/text-slate-600/g, 'text-slate-300']
]);
