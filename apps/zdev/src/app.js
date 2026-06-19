const features = [
  {
    icon: '🖥️',
    title: 'All-in-one development environment',
    body: 'Unify websites, applications, and software projects inside a single browser-accessible workspace.',
  },
  {
    icon: '🌐',
    title: 'Web-based development',
    body: 'Keep your development environment a browser tab away without cluttering local machines with project-specific installs.',
  },
  {
    icon: '🧩',
    title: 'Versatile tooling',
    body: 'Shape the workspace around preferred languages, tools, and extensions while preserving a consistent team baseline.',
  },
  {
    icon: '💼',
    title: 'Seamless collaboration',
    body: 'Support real-time teamwork patterns so developers can share code, coordinate reviews, and improve productivity.',
  },
];

const workflow = [
  ['Access from anywhere', 'Log in from a web browser and enter a ready-to-use development surface without local installation steps.'],
  ['Choose your stack', 'Select the programming languages, tools, and extensions required for the project workspace.'],
  ['Start coding', 'Write, build, and test software from inside a versatile environment powered by a code-server foundation.'],
  ['Collaborate and share', 'Work with teammates in real time, share projects, and streamline the delivery process.'],
];

const checklist = [
  'Account access path is defined for new and returning users.',
  'Workspace stack choices are documented before launch.',
  'Collaboration model is approved by the team.',
  'Security controls are reviewed before production use.',
];

const trustItems = [
  ['Simplicity', 'Ready-to-use browser access reduces installation friction and helps developers start faster.'],
  ['Flexibility', 'Workspace tooling can be adapted to the development stack for each project.'],
  ['Collaboration', 'Shared coding sessions help colleagues pair, review, and unblock each other.'],
  ['Accessibility', 'Developers can reach their environment anywhere they have an approved internet connection.'],
  ['Security', 'The product surface keeps credentials out of the app and frames runtime secrets as external operator-managed inputs.'],
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderFeatures() {
  const grid = document.querySelector('#feature-grid');
  features.forEach((feature) => {
    const card = el('article', 'feature-card glass-panel');
    card.append(el('div', 'card-icon', feature.icon));
    card.append(el('h3', '', feature.title));
    card.append(el('p', '', feature.body));
    grid.append(card);
  });
}

function renderWorkflow() {
  const timeline = document.querySelector('#workflow-steps');
  workflow.forEach(([title, body], index) => {
    const item = el('article', 'timeline-item glass-panel');
    item.append(el('span', 'step-number', String(index + 1).padStart(2, '0')));
    item.append(el('h3', '', title));
    item.append(el('p', '', body));
    timeline.append(item);
  });
}

function renderChecklist() {
  const list = document.querySelector('#checklist');
  const progress = document.querySelector('#progress-value');
  const storageKey = 'zdev-readiness-checklist';
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');

  function update() {
    const checked = [...list.querySelectorAll('input')].filter((input) => input.checked).length;
    progress.textContent = `${Math.round((checked / checklist.length) * 100)}%`;
    localStorage.setItem(storageKey, JSON.stringify([...list.querySelectorAll('input')].map((input) => input.checked)));
  }

  checklist.forEach((item, index) => {
    const label = el('label', 'check-item');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(saved[index]);
    input.addEventListener('change', update);
    label.append(input, el('span', '', item));
    list.append(label);
  });
  update();
}

function renderTrust() {
  const grid = document.querySelector('#trust-grid');
  trustItems.forEach(([title, body]) => {
    const card = el('article', 'trust-card glass-panel');
    card.append(el('h3', '', title));
    card.append(el('p', '', body));
    grid.append(card);
  });
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
}

renderFeatures();
renderWorkflow();
renderChecklist();
renderTrust();
revealOnScroll();
