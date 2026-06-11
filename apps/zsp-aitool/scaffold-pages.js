const fs = require('fs');
const path = require('path');

const pages = [
  {
    path: 'src/app/www/page.tsx',
    title: 'Public Marketing',
    desc: 'Public marketing page for Zeaz Platform products.'
  },
  {
    path: 'src/app/release/page.tsx',
    title: 'Release Evidence',
    desc: 'Verifiable proof and cryptographic evidence of releases.'
  },
  {
    path: 'src/app/docs/page.tsx',
    title: 'Documentation Portal',
    desc: 'Developer docs, API references, and architecture notes.'
  },
  {
    path: 'src/app/status/page.tsx',
    title: 'System Status',
    desc: 'Live operational status of Cloudflare Edge and plugins.'
  },
  {
    path: 'src/app/security/page.tsx',
    title: 'Security and Trust',
    desc: 'Zero-trust architecture details and compliance.'
  },
  {
    path: 'src/app/contact/page.tsx',
    title: 'Contact & Support',
    desc: 'Enterprise support and partnership inquiries.'
  }
];

const template = (title, desc) => `import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-cyber-bg text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="glass-panel max-w-2xl text-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-cyan to-cyber-violet" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">${title}</h1>
        <p className="text-slate-400 mb-8">${desc}</p>
        <Link href="/" className="cyber-button-secondary inline-block">
          Return Home
        </Link>
      </div>
    </main>
  );
}
`;

for (const p of pages) {
  fs.writeFileSync(p.path, template(p.title, p.desc));
}

console.log('Pages scaffolded successfully.');
