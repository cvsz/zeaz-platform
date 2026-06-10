import { checklist, commands, coverage, providers, securityControls, workloads } from './catalog.js';

const stateKey = 'zcloud-readiness-v1';
const selected = new Set(JSON.parse(localStorage.getItem(stateKey) || '[]'));
const searchBox = document.querySelector('#search-box');
const providerFilter = document.querySelector('#provider-filter');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function list(items) {
  const ul = el('ul', 'feature-list');
  items.forEach((item) => ul.appendChild(el('li', '', item)));
  return ul;
}

function renderCoverage() {
  const grid = document.querySelector('#coverage-grid');
  grid.replaceChildren(...coverage.map((item) => {
    const card = el('article', 'info-card glass-panel');
    card.append(el('span', 'status-pill success', item.status), el('h3', '', item.title), el('p', 'card-area', item.area), el('p', '', item.detail));
    return card;
  }));
}

function renderProviders() {
  const query = searchBox.value.toLowerCase();
  const filter = providerFilter.value;
  const grid = document.querySelector('#provider-grid');
  const filtered = providers.filter((provider) => {
    const blob = `${provider.name} ${provider.method} ${provider.os} ${provider.arch} ${provider.readiness.join(' ')}`.toLowerCase();
    return (!filter || provider.name === filter) && (!query || blob.includes(query));
  });
  grid.replaceChildren(...filtered.map((provider) => {
    const card = el('article', 'info-card glass-panel provider-card');
    const link = el('a', 'docs-link', 'View docs');
    link.href = provider.docs;
    link.target = '_blank';
    link.rel = 'noreferrer';
    card.append(el('h3', '', provider.name), el('p', 'card-area', provider.method), el('p', '', `${provider.os} · ${provider.arch}`), list(provider.readiness), link);
    return card;
  }));
}

function renderWorkloads() {
  const query = searchBox.value.toLowerCase();
  const grid = document.querySelector('#workload-grid');
  const filtered = workloads.filter((workload) => `${workload.name} ${workload.kind} ${workload.inputs.join(' ')} ${workload.guardrails.join(' ')}`.toLowerCase().includes(query));
  grid.replaceChildren(...filtered.map((workload) => {
    const card = el('article', 'workload-card glass-panel');
    card.append(el('h3', '', workload.name), el('p', 'card-area', workload.kind));
    card.append(el('h4', '', 'Operator inputs'), list(workload.inputs), el('h4', '', 'Guardrails'), list(workload.guardrails), el('p', 'outcome', workload.outcome));
    return card;
  }));
}

function renderSecurity() {
  const timeline = document.querySelector('#security-grid');
  timeline.replaceChildren(...securityControls.map((control) => {
    const item = el('article', 'timeline-item glass-panel');
    item.append(el('span', 'timeline-phase', control.phase), el('h3', '', control.title), el('p', '', control.detail));
    return item;
  }));
}

function renderCommands() {
  const query = searchBox.value.toLowerCase();
  const grid = document.querySelector('#cli-grid');
  const filtered = commands.filter((command) => `${command.title} ${command.role} ${command.command} ${command.note}`.toLowerCase().includes(query));
  grid.replaceChildren(...filtered.map((command) => {
    const card = el('article', 'command-card glass-panel');
    card.append(el('span', 'status-pill neutral', command.role), el('h3', '', command.title));
    const code = el('code', '', command.command);
    card.append(code, el('p', '', command.note));
    return card;
  }));
}

function updateProgress() {
  const percent = Math.round((selected.size / checklist.length) * 100);
  document.querySelector('#progress-value').textContent = `${percent}%`;
}

function renderChecklist() {
  const container = document.querySelector('#checklist');
  container.replaceChildren(...checklist.map((item, index) => {
    const id = `check-${index}`;
    const label = el('label', 'check-item');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = selected.has(index);
    input.addEventListener('change', () => {
      if (input.checked) selected.add(index);
      else selected.delete(index);
      localStorage.setItem(stateKey, JSON.stringify([...selected]));
      updateProgress();
    });
    label.append(input, el('span', '', item));
    return label;
  }));
  updateProgress();
}

function hydrateFilters() {
  providerFilter.append(el('option', '', ''));
  providerFilter.firstChild.textContent = 'All providers';
  providers.forEach((provider) => {
    const option = el('option', '', provider.name);
    option.value = provider.name;
    providerFilter.append(option);
  });
  providerFilter.addEventListener('change', renderProviders);
  searchBox.addEventListener('input', () => {
    renderProviders();
    renderWorkloads();
    renderCommands();
  });
}

hydrateFilters();
renderCoverage();
renderProviders();
renderWorkloads();
renderSecurity();
renderCommands();
renderChecklist();
