const STORAGE_KEY = 'mel-cop-participants';
let participants = [];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    participants = raw ? JSON.parse(raw) : [];
  } catch (e) {
    participants = [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

function showTab(t) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  const tabs = document.querySelectorAll('.tab');
  tabs[t === 'register' ? 0 : 1].classList.add('active');
  document.getElementById('pane-register').style.display = t === 'register' ? 'block' : 'none';
  document.getElementById('pane-participants').style.display = t === 'participants' ? 'block' : 'none';
  if (t === 'participants') { renderStats(); renderList(); }
}

function val(id) {
  return document.getElementById(id).value.trim();
}

function registerParticipant() {
  const name = val('f-name'), org = val('f-org'), prog = val('f-prog');
  const errEl = document.getElementById('err-msg');

  if (!name || !org || !prog) {
    errEl.textContent = 'Name, organization, and program are required.';
    errEl.style.display = 'inline';
    return;
  }
  errEl.style.display = 'none';

  participants.push({
    id: Date.now(),
    name,
    org,
    role: val('f-role'),
    prog,
    phone: val('f-phone'),
    email: val('f-email'),
    region: val('f-region'),
    gender: val('f-gender'),
    notes: val('f-notes'),
    ts: new Date().toISOString()
  });

  save();
  clearForm();
  updateTabCount();

  const s = document.getElementById('success');
  s.classList.add('show');
  setTimeout(() => s.classList.remove('show'), 3000);
}

function clearForm() {
  ['f-name', 'f-org', 'f-role', 'f-phone', 'f-email', 'f-notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['f-prog', 'f-region', 'f-gender'].forEach(id => {
    document.getElementById(id).selectedIndex = 0;
  });
  document.getElementById('err-msg').style.display = 'none';
}

function badgeClass(prog) {
  const map = { AYAW: 'ayaw', 'FIRST+II': 'first', BIA: 'bia', FILMA: 'filma', MCF: 'mcf' };
  return 'badge badge-' + (map[prog] || 'other');
}

function renderStats() {
  const progs = ['AYAW', 'FIRST+II', 'BIA', 'FILMA', 'MCF', 'Other'];
  const counts = {};
  participants.forEach(p => { counts[p.prog] = (counts[p.prog] || 0) + 1; });

  let html = `<div class="stat-card"><div class="stat-num">${participants.length}</div><div class="stat-label">Total</div></div>`;
  progs.forEach(p => {
    if (counts[p]) {
      html += `<div class="stat-card"><div class="stat-num">${counts[p]}</div><div class="stat-label">${p}</div></div>`;
    }
  });
  document.getElementById('stats-grid').innerHTML = html;
}

function renderList() {
  const q = (document.getElementById('search').value || '').toLowerCase();
  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.org.toLowerCase().includes(q) ||
    p.prog.toLowerCase().includes(q) ||
    (p.role || '').toLowerCase().includes(q)
  );

  const container = document.getElementById('list-container');

  if (!filtered.length) {
    container.innerHTML = `<div class="empty">${participants.length ? 'No results for that search.' : 'No participants registered yet.'}</div>`;
    return;
  }

  let html = `<div style="overflow-x:auto"><table>
    <thead><tr>
      <th class="col-name">Name</th>
      <th class="col-org">Organization</th>
      <th class="col-role">Role</th>
      <th class="col-prog">Program</th>
      <th class="col-phone">Phone</th>
      <th class="col-act"></th>
    </tr></thead><tbody>`;

  filtered.forEach(p => {
    html += `<tr>
      <td title="${esc(p.name)}">${esc(p.name)}</td>
      <td title="${esc(p.org)}">${esc(p.org)}</td>
      <td title="${esc(p.role || '')}">${esc(p.role) || '&mdash;'}</td>
      <td><span class="${badgeClass(p.prog)}">${esc(p.prog)}</span></td>
      <td>${esc(p.phone) || '&mdash;'}</td>
      <td style="text-align:right">
        <button class="btn-sm danger" onclick="deleteP(${p.id})">Remove</button>
      </td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function deleteP(id) {
  if (!confirm('Remove this participant?')) return;
  participants = participants.filter(p => p.id !== id);
  save();
  updateTabCount();
  renderStats();
  renderList();
}

function clearAll() {
  participants = [];
  save();
  updateTabCount();
  renderStats();
  renderList();
}

function updateTabCount() {
  const el = document.getElementById('tab-participants');
  el.textContent = participants.length ? `Participants (${participants.length})` : 'Participants';
}

function exportCSV() {
  const headers = ['Name', 'Organization', 'Role', 'Program', 'Phone', 'Email', 'Region', 'Gender', 'Notes', 'Registered'];
  const rows = participants.map(p =>
    [p.name, p.org, p.role, p.prog, p.phone, p.email, p.region, p.gender, p.notes, p.ts]
      .map(v => `"${(v || '').replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `mel-cop-participants-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

// Init
load();
updateTabCount();
