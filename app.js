// app.js - Linkify (full)
const LS_KEY = 'urlTemplateBuilder_v1';
const CONFIG_KEY = 'linkify_config_v1';

// DOM
const templatesList = document.getElementById('templatesList');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const tplNameInput = document.getElementById('tplNameInput');
const tplInput = document.getElementById('tplInput');
const saveModal = document.getElementById('saveModal');
const cancelModal = document.getElementById('cancelModal');
const templatesSearch = document.getElementById('search');
const workspace = document.getElementById('workspace');
const emptyState = document.getElementById('emptyState');
const tplNameEl = document.getElementById('tplName');
const tplMeta = document.getElementById('tplMeta');
const tplTemplate = document.getElementById('tplTemplate');
const varsForm = document.getElementById('varsForm');
const openBtn = document.getElementById('openBtn');
const copyBtn = document.getElementById('copyBtn');
const copyTemplateBtn = document.getElementById('copyTemplateBtn');
const resolvedPreview = document.getElementById('resolvedPreview');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const duplicateBtn = document.getElementById('duplicateBtn');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const fileInput = document.getElementById('fileInput');
const resetBtn = document.getElementById('resetBtn');
const varPreview = document.getElementById('varPreview');
const varCount = document.getElementById('varCount');
const domainBadge = document.getElementById('domainBadge');
const urlExample = document.getElementById('urlExample');
const toasts = document.getElementById('toasts');
const yearEl = document.getElementById('year');
const configModal = document.getElementById('configModal');
const configBtn = document.getElementById('configBtn');
const configClose = document.getElementById('configClose');
const configSave = document.getElementById('configSave');
const themeLight = document.getElementById('themeLight');
const themeDark = document.getElementById('themeDark');
const reorderToggle = document.getElementById('reorderToggle');

// State
let templates = [];
let selectedId = null;
let editMode = false;
let config = { theme: 'dark', reorderEnabled: true };

// Utilities
const uuid = () => 't-' + Math.random().toString(36).slice(2, 9);
const now = () => Date.now();
const VAR_RE = /\{([A-Za-z0-9_\-]+)\}/g;
const debounce = (fn, wait = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };

yearEl.textContent = new Date().getFullYear();

// Storage
function loadTemplates() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        templates = raw ? JSON.parse(raw) : [];
    } catch (e) { templates = []; }
}
function saveTemplates() {
    localStorage.setItem(LS_KEY, JSON.stringify(templates));
}

function loadConfig() {
    try {
        const raw = localStorage.getItem(CONFIG_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            config = { theme: parsed.theme || 'dark', reorderEnabled: parsed.reorderEnabled !== false };
        }
    } catch (e) {}
}
function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
function applyTheme() {
    document.documentElement.setAttribute('data-theme', config.theme);
}

// Variable detection & resolution
function detectVariables(tpl) {
    const set = [];
    let m;
    while ((m = VAR_RE.exec(tpl)) !== null) {
        const name = m[1];
        if (!set.includes(name)) set.push(name);
    }
    return set;
}
function resolveTemplate(tpl, values, encodeMap = {}) {
    return tpl.replace(VAR_RE, (_, k) => {
        const raw = values[k] ?? '';
        return encodeMap[k] === false ? raw : encodeURIComponent(raw);
    });
}
function sanitize(s) { return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Sample data
function sampleTemplates() {
    return [
        { id: uuid(), name: 'GitBranch', template: 'https://github.com/FanBasis/fanbasis-web-app/tree/{branch_name}', createdAt: now(), updatedAt: now(), _values: {}, _encode: {} },
        { id: uuid(), name: 'GitIssue', template: 'https://github.com/{owner}/{repo}/issues/{issue_number}', createdAt: now(), updatedAt: now(), _values: {}, _encode: {} },
        { id: uuid(), name: 'ServiceDashboard', template: 'https://dashboard.example.com/{service}/overview?env={env}', createdAt: now(), updatedAt: now(), _values: {}, _encode: {} }
    ];
}

// Toasts
function toast(msg, ms = 2200) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(() => el.classList.add('hide'), ms - 300);
    setTimeout(() => el.remove(), ms);
}

// Render list with drag & drop reordering
function renderList(filter = '') {
    templatesList.innerHTML = '';
    const list = templates.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()) || t.template.toLowerCase().includes(filter.toLowerCase()));
    if (list.length === 0) {
        templatesList.innerHTML = '<div class="text-sm text-white/40 py-4" role="status" aria-live="polite">No templates found</div>';
        return;
    }
    list.forEach((t, idx) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'tpl-item';
        if (t.id === selectedId) {
            el.classList.add('active');
            el.setAttribute('aria-selected', 'true');
        } else {
            el.setAttribute('aria-selected', 'false');
        }

        el.classList.add('cursor-pointer');
        if (!config.reorderEnabled) el.classList.add('no-reorder');
        el.setAttribute('role', 'option');
        el.setAttribute('aria-label', `${sanitize(t.name)}, template: ${sanitize(t.template)}, updated ${new Date(t.updatedAt).toLocaleDateString()}`);
        el.setAttribute('aria-posinset', String(idx + 1));
        el.setAttribute('aria-setsize', String(list.length));
        el.draggable = config.reorderEnabled;
        el.dataset.id = t.id;
        el.dataset.index = String(idx);
        el.innerHTML = `
      <div class="tpl-item-content">
        <div class="tpl-item-drag" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 12h14"/></svg>
        </div>
        <div class="tpl-item-body">
          <div class="tpl-item-name">${sanitize(t.name)}</div>
          <div class="tpl-meta">${sanitize(t.template)}</div>
        </div>
      </div>
      <div class="tpl-item-date">${new Date(t.updatedAt).toLocaleDateString()}</div>
    `;
        el.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target !== el) return;
            selectTemplate(t.id);
        });
        if (config.reorderEnabled) {
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', t.id);
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', () => el.classList.remove('dragging'));
            el.addEventListener('dragover', (e) => e.preventDefault());
            el.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromId = e.dataTransfer.getData('text/plain');
                const toId = t.id;
                reorderTemplates(fromId, toId);
            });
        }
        templatesList.appendChild(el);
    });
}

function handleListKeydown(e) {
    const items = Array.from(templatesList.querySelectorAll('.tpl-item'));
    const focused = document.activeElement;
    const idx = items.indexOf(focused);
    if (idx < 0) return;
    let nextIdx = -1;
    if (e.key === 'ArrowDown' && idx < items.length - 1) nextIdx = idx + 1;
    else if (e.key === 'ArrowUp' && idx > 0) nextIdx = idx - 1;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = items.length - 1;
    if (nextIdx >= 0) {
        e.preventDefault();
        const next = items[nextIdx];
        next.focus();
        selectTemplate(next.dataset.id);
    }
}

// Reorder helper
function reorderTemplates(fromId, toId) {
    const fromIdx = templates.findIndex(x => x.id === fromId);
    const toIdx = templates.findIndex(x => x.id === toId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
    const [item] = templates.splice(fromIdx, 1);
    templates.splice(toIdx, 0, item);
    saveTemplates();
    renderList(templatesSearch.value);
    toast('Reordered templates');
}

// Select template
function selectTemplate(id) {
    selectedId = id;
    const t = templates.find(x => x.id === id);
    if (!t) return;
    workspace.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tplNameEl.textContent = t.name;
    tplMeta.textContent = `Updated: ${new Date(t.updatedAt).toLocaleString()}`;
    tplTemplate.innerHTML = sanitize(t.template);
    renderDomainBadge(t.template);
    renderVars(t);
    renderList(templatesSearch.value);
}

// Domain badge & example
function renderDomainBadge(tpl) {
    try {
        const url = tpl.replace(VAR_RE, 'example');
        const u = new URL(url);
        domainBadge.textContent = u.hostname;
        urlExample.textContent = url;
    } catch (e) {
        domainBadge.textContent = '';
        urlExample.textContent = tpl;
    }
}

// Render variable form
function renderVars(t) {
    varsForm.innerHTML = '';
    const vars = detectVariables(t.template);
    varCount.textContent = vars.length;
    const saved = t._values || {};
    const encodeMap = t._encode || {};
    if (vars.length === 0) {
        const note = document.createElement('div');
        note.className = 'text-sm text-white/60';
        note.textContent = 'No variables detected in this template.';
        varsForm.appendChild(note);
        updateResolvedPreview();
        return;
    }
    vars.forEach(name => {
        const row = document.createElement('div');
        row.className = 'variable-row';
        row.innerHTML = `
      <div class="variable-label">${sanitize(name)}</div>
      <div class="variable-controls">
        <input data-var="${sanitize(name)}" class="input" placeholder="${sanitize(name)}" value="${sanitize(saved[name] || '')}">
        <button class="small-toggle" data-encode="${name}" title="Toggle URL-encode">${encodeMap[name] === false ? 'RAW' : 'ENC'}</button>
      </div>
    `;
        // encode toggle handler
        row.querySelector(`[data-encode="${name}"]`).addEventListener('click', (e) => {
            t._encode = t._encode || {};
            t._encode[name] = t._encode[name] === false ? true : false;
            e.target.textContent = t._encode[name] === false ? 'RAW' : 'ENC';
            saveTemplates();
            updateResolvedPreview();
            toast(`Encoding for ${name}: ${t._encode[name] === false ? 'raw' : 'encoded'}`);
        });
        varsForm.appendChild(row);
    });
    updateResolvedPreview();
}

// Get current form values
function getFormValues() {
    const inputs = varsForm.querySelectorAll('input[data-var]');
    const out = {};
    inputs.forEach(i => out[i.dataset.var] = i.value);
    return out;
}

// Update preview and button states
function updateResolvedPreview() {
    const t = templates.find(x => x.id === selectedId);
    if (!t) { resolvedPreview.textContent = ''; return; }
    const values = getFormValues();
    const encodeMap = t._encode || {};
    const url = resolveTemplate(t.template, values, encodeMap);
    resolvedPreview.textContent = url;
    const vars = detectVariables(t.template);
    openBtn.disabled = vars.length > 0 && vars.some(v => !values[v]);
}

// Modal
function showModal() { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); tplNameInput.focus(); }
function hideModal() { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }

function showConfigModal() {
    themeLight.classList.toggle('active', config.theme === 'light');
    themeDark.classList.toggle('active', config.theme === 'dark');
    reorderToggle.checked = config.reorderEnabled;
    configModal.classList.remove('hidden');
    configModal.setAttribute('aria-hidden', 'false');
}
function hideConfigModal() {
    configModal.classList.add('hidden');
    configModal.setAttribute('aria-hidden', 'true');
}

// Create new
addBtn.addEventListener('click', () => {
    editMode = false;
    tplNameInput.value = '';
    tplInput.value = '';
    modalTitle.textContent = 'New Template';
    varPreview.textContent = '';
    showModal();
});

// Save modal (create or update)
saveModal.addEventListener('click', () => {
    const name = tplNameInput.value.trim();
    const template = tplInput.value.trim();
    if (!name || !template) { alert('Name and template are required.'); return; }
    if (/\{\s*\}/.test(template)) { alert('Empty variable braces detected.'); return; }
    const vars = detectVariables(template);
    if (editMode && selectedId) {
        const t = templates.find(x => x.id === selectedId);
        if (!t) return;
        t.name = name;
        t.template = template;
        t.updatedAt = now();
        const prev = t._values || {};
        const prevEnc = t._encode || {};
        t._values = {};
        t._encode = {};
        vars.forEach(v => { t._values[v] = prev[v] || ''; t._encode[v] = prevEnc[v] === false ? false : true; });
    } else {
        const obj = { id: uuid(), name, template, createdAt: now(), updatedAt: now(), _values: {}, _encode: {} };
        const vars0 = detectVariables(template);
        vars0.forEach(v => obj._encode[v] = true);
        templates.unshift(obj);
        selectedId = obj.id;
    }
    saveTemplates();
    hideModal();
    renderList(templatesSearch.value);
    selectTemplate(selectedId);
    toast('Saved');
});

// Cancel modal
cancelModal.addEventListener('click', hideModal);

// Search (debounced)
templatesSearch.addEventListener('input', debounce((e) => {
    if (e.target.value.startsWith('http')) {
        // quick-create: paste template then open modal with template prefilled
        tplInput.value = e.target.value;
        modalTitle.textContent = 'New Template (quick)';
        showModal();
        templatesSearch.value = '';
        return;
    }
    renderList(e.target.value);
}, 150));

// Handle variable input changes
varsForm.addEventListener('input', (e) => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    const values = getFormValues();
    t._values = Object.assign(t._values || {}, values);
    saveTemplates();
    updateResolvedPreview();
});

// Open URL
openBtn.addEventListener('click', () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    const values = getFormValues();
    const vars = detectVariables(t.template);
    if (vars.length > 0 && vars.some(v => !values[v])) { alert('Fill all variables.'); return; }
    const url = resolveTemplate(t.template, values, t._encode || {});
    try {
        window.open(url, '_blank', 'noopener');
    } catch (e) {
        alert('Unable to open URL: ' + e.message);
    }
});

// Copy resolved URL
copyBtn.addEventListener('click', async () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    const url = resolveTemplate(t.template, getFormValues(), t._encode || {});
    try {
        await navigator.clipboard.writeText(url);
        toast('URL copied to clipboard');
    } catch (e) {
        alert('Copy failed: ' + (e.message || e));
    }
});

// Copy template string
copyTemplateBtn.addEventListener('click', async () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    try {
        await navigator.clipboard.writeText(t.template);
        toast('Template copied');
    } catch (e) {
        alert('Copy failed');
    }
});

// Edit
editBtn.addEventListener('click', () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    editMode = true;
    modalTitle.textContent = 'Edit Template';
    tplNameInput.value = t.name;
    tplInput.value = t.template;
    varPreview.textContent = detectVariables(t.template).join(', ');
    showModal();
});

// Duplicate
duplicateBtn.addEventListener('click', () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    const copy = Object.assign({}, t, { id: uuid(), name: t.name + ' (copy)', createdAt: now(), updatedAt: now() });
    templates.unshift(copy);
    saveTemplates();
    renderList(templatesSearch.value);
    selectTemplate(copy.id);
    toast('Template duplicated');
});

// Delete
deleteBtn.addEventListener('click', () => {
    if (!confirm('Delete this template?')) return;
    templates = templates.filter(x => x.id !== selectedId);
    saveTemplates();
    selectedId = templates[0]?.id || null;
    renderList(templatesSearch.value);
    if (selectedId) selectTemplate(selectedId);
    else { workspace.classList.add('hidden'); emptyState.classList.remove('hidden'); }
    toast('Deleted');
});

// Import / Export
exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkify-templates.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Exported');
});

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (!Array.isArray(parsed)) throw new Error('Invalid format');
            const cleaned = parsed.map(p => {
                return {
                    id: p.id || uuid(),
                    name: String(p.name || 'Untitled'),
                    template: String(p.template || ''),
                    createdAt: p.createdAt || now(),
                    updatedAt: p.updatedAt || now(),
                    _values: p._values || {},
                    _encode: p._encode || {}
                };
            });
            // merge - imported items come first
            templates = cleaned.concat(templates);
            saveTemplates();
            renderList(templatesSearch.value);
            toast('Imported');
        } catch (err) {
            alert('Import failed: ' + (err.message || err));
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// Reset to sample
resetBtn.addEventListener('click', () => {
    if (!confirm('Replace all templates with sample data?')) return;
    templates = sampleTemplates();
    saveTemplates();
    selectedId = templates[0].id;
    renderList();
    selectTemplate(selectedId);
    toast('Reset to sample data');
});

configBtn.addEventListener('click', showConfigModal);
configClose.addEventListener('click', hideConfigModal);
configSave.addEventListener('click', () => {
    hideConfigModal();
    toast('Settings saved');
});
configModal.addEventListener('click', (e) => {
    if (e.target === configModal) hideConfigModal();
});

themeLight.addEventListener('click', () => {
    config.theme = 'light';
    saveConfig();
    applyTheme();
    themeLight.classList.add('active');
    themeDark.classList.remove('active');
});
themeDark.addEventListener('click', () => {
    config.theme = 'dark';
    saveConfig();
    applyTheme();
    themeDark.classList.add('active');
    themeLight.classList.remove('active');
});

reorderToggle.addEventListener('change', () => {
    config.reorderEnabled = reorderToggle.checked;
    saveConfig();
    renderList(templatesSearch.value);
});

// Init
function init() {
    loadConfig();
    applyTheme();
    loadTemplates();
    if (templates.length === 0) {
        templates = sampleTemplates();
        saveTemplates();
    }
    selectedId = templates[0]?.id || null;
    renderList();
    if (selectedId) selectTemplate(selectedId);
    templatesList.addEventListener('keydown', handleListKeydown);
}
init();

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!configModal.classList.contains('hidden')) hideConfigModal();
        else if (!modal.classList.contains('hidden')) hideModal();
    }
});