// app.js
// Jarvis -> Aiz: compact, clear, single-file app logic.
// LocalStorage key
const LS_KEY = 'urlTemplateBuilder_v1';

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
const resolvedPreview = document.getElementById('resolvedPreview');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const fileInput = document.getElementById('fileInput');
const resetBtn = document.getElementById('resetBtn');

// State
let templates = [];
let selectedId = null;
let editMode = false;

// Utilities
const uuid = () => 't-' + Math.random().toString(36).slice(2, 9);
const now = () => Date.now();
const VAR_RE = /\{([A-Za-z0-9_\-]+)\}/g;

function loadTemplates() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        templates = raw ? JSON.parse(raw) : [];
    } catch (e) { templates = []; }
}
function saveTemplates() {
    localStorage.setItem(LS_KEY, JSON.stringify(templates));
}
function detectVariables(tpl) {
    const set = [];
    let m;
    while ((m = VAR_RE.exec(tpl)) !== null) {
        const name = m[1];
        if (!set.includes(name)) set.push(name);
    }
    return set;
}
function resolveTemplate(tpl, values) {
    return tpl.replace(VAR_RE, (_, k) => encodeURIComponent(values[k] ?? ''));
}
function sanitize(s) { return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Sample data (used by Reset)
function sampleTemplates() {
    return [
        { id: uuid(), name: 'GitBranch', template: 'https://github.com/FanBasis/fanbasis-web-app/tree/{branch_name}', createdAt: now(), updatedAt: now() },
        { id: uuid(), name: 'GitIssue', template: 'https://github.com/{owner}/{repo}/issues/{issue_number}', createdAt: now(), updatedAt: now() },
        { id: uuid(), name: 'ServiceDashboard', template: 'https://dashboard.example.com/{service}/overview?env={env}', createdAt: now(), updatedAt: now() }
    ];
}

// Renderers
function renderList(filter = '') {
    templatesList.innerHTML = '';
    const list = templates.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()) || t.template.toLowerCase().includes(filter.toLowerCase()));
    if (list.length === 0) {
        templatesList.innerHTML = '<div class="text-sm text-white/40">No templates</div>';
        return;
    }
    for (const t of list) {
        const el = document.createElement('div');
        el.className = 'tpl-item';
        if (t.id === selectedId) el.classList.add('active');
        el.setAttribute('role', 'listitem');
        el.dataset.id = t.id;
        el.innerHTML = `<div class="flex justify-between items-center">
      <div>
        <div class="font-medium">${sanitize(t.name)}</div>
        <div class="text-xs text-white/50 mt-1 truncate" style="max-width:220px">${sanitize(t.template)}</div>
      </div>
      <div class="text-xs text-white/40">${new Date(t.updatedAt).toLocaleDateString()}</div>
    </div>`;
        el.addEventListener('click', () => selectTemplate(t.id));
        templatesList.appendChild(el);
    }
}
function selectTemplate(id) {
    selectedId = id;
    const t = templates.find(x => x.id === id);
    if (!t) return;
    workspace.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tplNameEl.textContent = t.name;
    tplMeta.textContent = `Updated: ${new Date(t.updatedAt).toLocaleString()}`;
    tplTemplate.innerHTML = sanitize(t.template);
    renderVars(t);
    renderList(templatesSearch.value);
}
function renderVars(t) {
    varsForm.innerHTML = '';
    const vars = detectVariables(t.template);
    const saved = t._values || {};
    if (vars.length === 0) {
        const note = document.createElement('div');
        note.className = 'text-sm text-white/60';
        note.textContent = 'No variables detected in this template.';
        varsForm.appendChild(note);
        updateResolvedPreview();
        return;
    }
    for (const name of vars) {
        const row = document.createElement('div');
        row.className = 'flex gap-2 items-center';
        row.innerHTML = `
      <label class="w-40 text-sm text-white/60">${sanitize(name)}</label>
      <input data-var="${sanitize(name)}" class="input flex-1" placeholder="${sanitize(name)}" value="${sanitize(saved[name] || '')}">
    `;
        varsForm.appendChild(row);
    }
    updateResolvedPreview();
}
function getFormValues() {
    const inputs = varsForm.querySelectorAll('input[data-var]');
    const out = {};
    inputs.forEach(i => out[i.dataset.var] = i.value);
    return out;
}
function updateResolvedPreview() {
    const t = templates.find(x => x.id === selectedId);
    if (!t) {
        resolvedPreview.textContent = '';
        return;
    }
    const values = getFormValues();
    const url = resolveTemplate(t.template, values);
    resolvedPreview.textContent = url;
    const vars = detectVariables(t.template);
    openBtn.disabled = vars.length > 0 && vars.some(v => !values[v]);
}

// Modal controls
addBtn.addEventListener('click', () => {
    editMode = false;
    tplNameInput.value = '';
    tplInput.value = '';
    modalTitle.textContent = 'New Template';
    document.getElementById('varPreview').textContent = '';
    showModal();
});
function showModal() { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); tplNameInput.focus(); }
function hideModal() { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }

// Save template
saveModal.addEventListener('click', () => {
    const name = tplNameInput.value.trim();
    const template = tplInput.value.trim();
    if (!name || !template) { alert('Name and template are required.'); return; }
    // basic validation for variable tokens
    if (/\{\s*\}/.test(template)) { alert('Empty variable braces detected.'); return; }
    const vars = detectVariables(template);
    if (editMode && selectedId) {
        const t = templates.find(x => x.id === selectedId);
        if (!t) return;
        t.name = name;
        t.template = template;
        t.updatedAt = now();
        const prev = t._values || {};
        t._values = {};
        for (const v of vars) t._values[v] = prev[v] || '';
    } else {
        const obj = { id: uuid(), name, template, createdAt: now(), updatedAt: now(), _values: {} };
        templates.unshift(obj);
        selectedId = obj.id;
    }
    saveTemplates();
    hideModal();
    renderList(templatesSearch.value);
    selectTemplate(selectedId);
});

cancelModal.addEventListener('click', hideModal);

// Search
templatesSearch.addEventListener('input', (e) => renderList(e.target.value));

// Form input changes
varsForm.addEventListener('input', (e) => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    const values = getFormValues();
    t._values = Object.assign(t._values || {}, values);
    updateResolvedPreview();
});

// Open URL
openBtn.addEventListener('click', () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    const values = getFormValues();
    const vars = detectVariables(t.template);
    if (vars.length > 0 && vars.some(v => !values[v])) { alert('Fill all variables.'); return; }
    const url = resolveTemplate(t.template, values);
    // open safely
    try {
        window.open(url, '_blank', 'noopener');
    } catch (e) {
        alert('Unable to open URL: ' + e.message);
    }
});

// Copy URL
copyBtn.addEventListener('click', async () => {
    const t = templates.find(x => x.id === selectedId);
    if (!t) return;
    const url = resolveTemplate(t.template, getFormValues());
    try {
        await navigator.clipboard.writeText(url);
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(() => copyBtn.textContent = prev, 1200);
    } catch (e) {
        alert('Copy failed: ' + (e.message || e));
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
    document.getElementById('varPreview').textContent = detectVariables(t.template).join(', ');
    showModal();
});

// Delete
deleteBtn.addEventListener('click', () => {
    if (!confirm('Delete this template?')) return;
    templates = templates.filter(x => x.id !== selectedId);
    saveTemplates();
    selectedId = templates.length ? templates[0].id : null;
    renderList(templatesSearch.value);
    if (selectedId) selectTemplate(selectedId);
    else { workspace.classList.add('hidden'); emptyState.classList.remove('hidden'); }
});

// Import / Export
exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
            // basic validation: ensure objects have required keys
            const cleaned = parsed.map(p => {
                return {
                    id: p.id || uuid(),
                    name: String(p.name || 'Untitled'),
                    template: String(p.template || ''),
                    createdAt: p.createdAt || now(),
                    updatedAt: p.updatedAt || now(),
                    _values: p._values || {}
                };
            });
            templates = cleaned.concat(templates);
            saveTemplates();
            renderList(templatesSearch.value);
            alert('Import successful');
        } catch (err) {
            alert('Import failed: ' + (err.message || err));
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
});

// Reset to sample
resetBtn.addEventListener('click', () => {
    if (!confirm('Replace all templates with sample data?')) return;
    templates = sampleTemplates();
    saveTemplates();
    selectedId = templates[0].id;
    renderList();
    selectTemplate(selectedId);
});

// Init
function init() {
    loadTemplates();
    if (templates.length === 0) {
        templates = sampleTemplates();
        saveTemplates();
    }
    selectedId = templates[0]?.id || null;
    renderList();
    if (selectedId) selectTemplate(selectedId);
}
init();

// Close modal on Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) hideModal();
});