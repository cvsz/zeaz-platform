const fs = require('fs');
const path = 'src/app/dashboard/hyperframes/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Header section
content = content.replace(
  /className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl"/g,
  'className="glass-panel p-6"'
);
content = content.replace(/text-indigo-200/g, 'text-cyber-cyan');
content = content.replace(/text-indigo-100/g, 'text-slate-300');
content = content.replace(
  /className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950"/g,
  'className="cyber-button-primary rounded-full"'
);
content = content.replace(
  /className="rounded-full bg-white\/10 px-4 py-2 font-semibold text-white ring-1 ring-white\/20"/g,
  'className="cyber-button-secondary rounded-full"'
);

// Main section
content = content.replace(
  /className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"/g,
  'className="cyber-card p-5"'
);

// Text colors
content = content.replace(/text-slate-950/g, 'text-white');
content = content.replace(/text-slate-700/g, 'text-slate-200');
content = content.replace(/text-slate-500/g, 'text-slate-400');
content = content.replace(/text-slate-600/g, 'text-slate-300');
content = content.replace(/text-amber-700/g, 'text-amber-400');

// Inputs and selects
content = content.replace(
  /border-slate-200 px-3 py-2\.5 text-sm shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/g,
  'border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white shadow-sm outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan'
);
content = content.replace(
  /border-slate-200 px-3 py-2\.5 text-sm/g,
  'border-white/10 bg-cyber-bg px-3 py-2.5 text-sm text-white'
);

// Button
content = content.replace(
  /className="rounded-xl bg-indigo-700 px-5 py-2\.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0\.5 hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"/g,
  'className="cyber-button-primary"'
);

// Workflow aside
content = content.replace(/bg-slate-50/g, 'bg-white/5');

fs.writeFileSync(path, content);
