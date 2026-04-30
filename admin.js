const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = window.location.origin + window.location.pathname.replace('admin.html', '');

let currentEventId = null;
let currentParticipants = [];

function showPane(name) {
  ['create','link','events','participants','edit'].forEach(p => {
    document.getElementById('pane-' + p).style.display = p === name ? 'block' : 'none';
  });
  if (name === 'events') loadEvents();
}

function val(id) { return document.getElementById(id).value.trim(); }

async function submitEvent() {
  const errEl = document.getElementById('e-err');
  try {
    const name = val('e-name');
    if (!name) { errEl.textContent = 'Event name is required.'; errEl.style.display = 'inline'; return; }
    errEl.style.display = 'none';

    const btn = document.querySelector('#pane-create .btn-primary');
    btn.textContent = 'Creating...'; btn.disabled = true;

    const { data, error } = await db.from('events').insert([{
      name,
      organizer: val('e-organizer') || null,
      program: document.getElementById('e-prog').value || null,
      event_date: document.getElementById('e-date').value || null,
      days: parseInt(document.getElementById('e-days').value) || 1,
      mel_question: val('e-mel') || null
    }]).select();

    btn.textContent = 'Create event'; btn.disabled = false;

    if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'inline'; return; }
    if (!data || !data.length) { errEl.textContent = 'No data returned.'; errEl.style.display = 'inline'; return; }

    ['e-name','e-organizer','e-date','e-mel','e-code','e-prog-other'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('e-prog').selectedIndex = 0;
    document.getElementById('e-days').selectedIndex = 0;
    document.getElementById('e-prog-other-group').style.display = 'none';

    document.getElementById('share-link').textContent = BASE_URL + 'index.html?event=' + data[0].id;
    showPane('link');
  } catch(e) {
    errEl.textContent = 'Unexpected error: ' + e.message; errEl.style.display = 'inline';
  }
}

function copyLink() {
  const link = document.getElementById('share-link').textContent;
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.querySelector('#pane-link .btn-sm');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

async function loadEvents() {
  document.getElementById('events-loading').style.display = 'block';
  document.getElementById('events-list').style.display = 'none';

  const { data: events } = await db.from('events').select('*').order('created_at', { ascending: false });
  const { data: counts } = await db.from('participants').select('event_id');

  const countMap = {};
  (counts || []).forEach(p => { countMap[p.event_id] = (countMap[p.event_id] || 0) + 1; });

  document.getElementById('events-loading').style.display = 'none';
  document.getElementById('events-list').style.display = 'block';

  if (!events || !events.length) {
    document.getElementById('events-list').innerHTML = '<div class="empty">No events yet. Create your first event.</div>';
    return;
  }

  let html = '';
  events.forEach(e => {
    const count = countMap[e.id] || 0;
    const dateStr = e.event_date ? new Date(e.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '';
    const meta = [e.program, e.organizer, dateStr, e.days > 1 ? e.days + ' days' : null].filter(Boolean).join(' · ');
    html += `<div class="event-card">
      <div class="event-card-main">
        <div>
          <p class="event-card-name">${esc(e.name)}</p>
          ${e.event_code ? `<p class="event-card-code">${esc(e.event_code)}</p>` : ''}
          <p class="event-card-meta">${esc(meta)}</p>
          ${e.mel_question ? `<p class="event-card-meta" style="margin-top:3px;font-style:italic">${esc(e.mel_question)}</p>` : ''}
        </div>
        <div class="event-card-count">
          <span class="count-num">${count}</span>
          <span class="count-label">participants</span>
        </div>
      </div>
      <div class="event-card-actions">
        <button class="btn-sm" onclick="viewParticipants('${e.id}','${esc(e.name)}')">View participants</button>
        <button class="btn-sm" onclick="fetchAndEdit('${e.id}')">Edit</button>
        <button class="btn-sm accent" onclick="copyEventLink('${e.id}','prereg',this)">Copy pre-reg link</button>
        <button class="btn-sm accent" onclick="copyEventLink('${e.id}','walkin',this)">Copy walk-in link</button>
        <button class="btn-sm accent" onclick="copyEventLink('${e.id}','view',this)">Copy participant view</button>
        <button class="btn-sm danger" onclick="deleteEvent('${e.id}')">Delete</button>
      </div>
    </div>`;
  });
  document.getElementById('events-list').innerHTML = html;
}

function copyEventLink(id, type, btn) {
  let url;
  if (type === 'view') url = BASE_URL + 'event.html?event=' + id;
  else if (type === 'walkin') url = BASE_URL + 'index.html?event=' + id + '&walkin=1';
  else url = BASE_URL + 'index.html?event=' + id;
  navigator.clipboard.writeText(url).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

async function deleteEvent(id) {
  if (!confirm('Delete this event and all its participants? This cannot be undone.')) return;
  await db.from('participants').delete().eq('event_id', id);
  await db.from('events').delete().eq('id', id);
  loadEvents();
}

let currentAttendance = {};

async function viewParticipants(eventId, eventName) {
  currentEventId = eventId;
  document.getElementById('view-event-name').textContent = eventName;
  showPane('participants');

  const { data: parts } = await db.from('participants').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
  currentParticipants = parts || [];
  currentAttendance = {};
  try {
    const { data: att } = await db.from('attendance').select('*').eq('event_id', eventId);
    (att || []).forEach(a => {
      if (!currentAttendance[a.participant_id]) currentAttendance[a.participant_id] = [];
      currentAttendance[a.participant_id].push(a);
    });
  } catch(e) { console.warn('Attendance table not available:', e.message); }
  renderStats();
  filterParticipants();
}

function renderStats() {
  const total = currentParticipants.length;
  const female = currentParticipants.filter(p => p.sex === 'Female').length;
  const male = currentParticipants.filter(p => p.sex === 'Male').length;

  // Count attendance per day from attendance table
  const dayCounts = {};
  Object.values(currentAttendance).forEach(records => {
    records.forEach(a => { dayCounts[a.day] = (dayCounts[a.day] || 0) + 1; });
  });
  const totalSigned = Object.values(currentAttendance).filter(r => r.length > 0).length;

  let html = `<div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Registered</div></div>`;
  if (totalSigned) html += `<div class="stat-card"><div class="stat-num">${totalSigned}</div><div class="stat-label">Signed</div></div>`;
  if (female) html += `<div class="stat-card"><div class="stat-num">${female}</div><div class="stat-label">Female</div></div>`;
  if (male) html += `<div class="stat-card"><div class="stat-num">${male}</div><div class="stat-label">Male</div></div>`;
  Object.entries(dayCounts).sort().forEach(([d, c]) => {
    html += `<div class="stat-card"><div class="stat-num">${c}</div><div class="stat-label">${d}</div></div>`;
  });
  document.getElementById('view-stats').innerHTML = html;
}

function filterParticipants() {
  const q = (document.getElementById('p-search').value || '').toLowerCase();
  const filtered = currentParticipants.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.org.toLowerCase().includes(q) ||
    (p.position_title || '').toLowerCase().includes(q) ||
    (p.prog || '').toLowerCase().includes(q) ||
    (p.code || '').toLowerCase().includes(q)
  );
  const container = document.getElementById('participants-list');
  if (!filtered.length) {
    container.innerHTML = `<div class="empty">${currentParticipants.length ? 'No results.' : 'No participants registered yet.'}</div>`;
    return;
  }
  let html = `<div style="overflow-x:auto"><table>
    <thead><tr>
      <th style="width:9%">Code</th>
      <th style="width:16%">Name</th>
      <th style="width:6%">Sex</th>
      <th style="width:16%">Organization</th>
      <th style="width:13%">Position</th>
      <th style="width:10%">Program</th>
      <th style="width:11%">Type</th>
      <th style="width:10%">Days Signed</th>
      <th style="width:9%">Sig</th>
    </tr></thead><tbody>`;
  filtered.forEach(p => {
    const att = currentAttendance[p.id] || [];
    const daysSigned = att.map(a => a.day).join(', ') || '&mdash;';
    const sigCell = att.length > 0
      ? att.map(a => a.signature_url ? `<a href="${a.signature_url}" target="_blank" style="color:var(--orange);font-size:11px">${a.day}</a>` : '').filter(Boolean).join(' ')
      : (p.signature ? `<img src="${p.signature}" style="height:28px;max-width:60px;object-fit:contain" title="Legacy signature" />` : '&mdash;');
    const regTypeBadge = p.reg_type === 'Walk-in'
      ? '<span style="background:#fff3e8;color:var(--orange);font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Walk-in</span>'
      : '<span style="background:#f0f9f4;color:#005c2a;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Pre-reg</span>';
    html += `<tr data-pid="${p.id}" style="cursor:pointer">
      <td style="font-weight:700;font-family:monospace;color:var(--orange)">${esc(p.code) || '&mdash;'}</td>
      <td title="${esc(p.name)}" style="font-weight:500">${esc(p.name)}</td>
      <td>${esc(p.sex) || '&mdash;'}</td>
      <td title="${esc(p.org)}">${esc(p.org)}</td>
      <td>${esc(p.position_title) || '&mdash;'}</td>
      <td>${esc(p.prog) || '&mdash;'}</td>
      <td>${regTypeBadge}</td>
      <td style="font-size:12px">${daysSigned}</td>
      <td>${sigCell}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;

  // Event delegation for row clicks → open sign form
  const tbody = container.querySelector('tbody');
  if (tbody) {
    tbody.addEventListener('click', e => {
      const row = e.target.closest('tr[data-pid]');
      if (row) {
        window.open(BASE_URL + 'sign.html?participant=' + row.dataset.pid + '&event=' + currentEventId, '_blank');
      }
    });
  }
}

async function exportCSV() {
  const { data: attendance } = await db.from('attendance')
    .select('*').eq('event_id', currentEventId).order('signed_at', { ascending: true });

  const attMap = {};
  (attendance || []).forEach(a => {
    if (!attMap[a.participant_id]) attMap[a.participant_id] = [];
    attMap[a.participant_id].push(a);
  });

  // Wrap plain text values in quotes, escaping internal quotes
  function q(v) { return '"' + (v || '').toString().replace(/"/g, '""') + '"'; }

  const headers = ['Code','Name','Sex','Organization','Program','Position','Registration Type',
    'Email','Phone','Signed','Days Signed','Signed At',
    'Signature Image (Sheets)','Signature URL','MEL Response','Registered'];

  const rows = currentParticipants.map(p => {
    const att = attMap[p.id] || [];
    const daysSigned = att.map(a => a.day).join('; ');
    const signedAt = att.map(a => a.signed_at ? new Date(a.signed_at).toLocaleString() : '').join('; ');
    const lastSigUrl = (att.filter(a => a.signature_url).slice(-1)[0] || {}).signature_url || '';
    const allUrls = att.filter(a => a.signature_url).map(a => a.signature_url).join('; ');

    // =IMAGE() is a Sheets formula — must NOT be wrapped in quotes or the quotes inside escape incorrectly
    // Output as bare formula cell; CSV parsers treat unquoted cells starting with = as formulas in Sheets
    const imageCell = lastSigUrl ? '=IMAGE("' + lastSigUrl + '")' : '';

    return [
      q(p.code), q(p.name), q(p.sex), q(p.org), q(p.prog), q(p.position_title),
      q(p.reg_type || 'Pre-registration'),
      q(p.email), q(p.phone),
      q(att.length > 0 ? 'Yes' : 'No'),
      q(daysSigned), q(signedAt),
      imageCell,
      q(allUrls),
      q(p.notes), q(p.created_at)
    ].join(',');
  });

  const csv = [headers.map(h => '"' + h + '"').join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'participants-' + document.getElementById('view-event-name').textContent.replace(/\s+/g,'-') + '-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

showPane('events');

function openEdit(e) {
  document.getElementById('edit-id').value = e.id;
  document.getElementById('edit-name').value = e.name || '';
  document.getElementById('edit-organizer').value = e.organizer || '';
  document.getElementById('edit-date').value = e.event_date || '';
  document.getElementById('edit-mel').value = e.mel_question || '';
  document.getElementById('edit-code').value = e.event_code || '';
  const ep = document.getElementById('edit-prog');
  ep.value = e.program || '';
  document.getElementById('edit-prog-other-group').style.display = (e.program && !['AYAW','FIRST+II','BIA','FILMA','MCF'].includes(e.program)) ? 'block' : 'none';
  document.getElementById('edit-prog-other').value = (e.program && !['AYAW','FIRST+II','BIA','FILMA','MCF'].includes(e.program)) ? e.program : '';

  const progSel = document.getElementById('edit-prog');
  progSel.value = e.program || '';

  const daysSel = document.getElementById('edit-days');
  daysSel.value = String(e.days || 1);

  document.getElementById('edit-err').style.display = 'none';
  ['create','link','events','participants','edit'].forEach(p => {
    document.getElementById('pane-' + p).style.display = p === 'edit' ? 'block' : 'none';
  });
}

async function saveEdit() {
  const errEl = document.getElementById('edit-err');
  const name = document.getElementById('edit-name').value.trim();
  if (!name) { errEl.textContent = 'Event name is required.'; errEl.style.display = 'inline'; return; }

  const btn = document.querySelector('#pane-edit .btn-primary');
  btn.textContent = 'Saving...'; btn.disabled = true;

  const { error } = await db.from('events').update({
    name,
    organizer: document.getElementById('edit-organizer').value.trim() || null,
    program: getProgram('edit-prog', 'edit-prog-other'),
    event_date: document.getElementById('edit-date').value || null,
    days: parseInt(document.getElementById('edit-days').value) || 1,
    mel_question: document.getElementById('edit-mel').value.trim() || null,
    event_code: document.getElementById('edit-code').value.trim().toUpperCase() || null
  }).eq('id', document.getElementById('edit-id').value);

  btn.textContent = 'Save changes'; btn.disabled = false;

  if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'inline'; return; }
  showPane('events');
}

async function fetchAndEdit(id) {
  const { data, error } = await db.from('events').select('*').eq('id', id).single();
  if (error || !data) { alert('Could not load event.'); return; }
  openEdit(data);
}

function openRegLink() {
  window.open(BASE_URL + 'index.html?event=' + currentEventId, '_blank');
}

function openWalkinLink() {
  window.open(BASE_URL + 'index.html?event=' + currentEventId + '&walkin=1', '_blank');
}

function openViewLink() {
  window.open(BASE_URL + 'event.html?event=' + currentEventId, '_blank');
}

function toggleGuide() {
  const box = document.getElementById('guide-box');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

function toggleOther(selectId, groupId) {
  const val = document.getElementById(selectId).value;
  document.getElementById(groupId).style.display = val === 'Other' ? 'block' : 'none';
}

function getProgram(selectId, otherId) {
  const val = document.getElementById(selectId).value;
  if (val === 'Other') {
    const other = document.getElementById(otherId).value.trim();
    return other || 'Other';
  }
  return val || null;
}

async function generateEventCode(inputId) {
  const manual = document.getElementById(inputId).value.trim().toUpperCase();
  if (manual) return manual;
  // Auto-generate: EVT + 3-digit sequence
  const { data } = await db.from('events').select('event_code').not('event_code', 'is', null);
  const nums = (data || []).map(e => {
    const m = (e.event_code || '').match(/(\d+)$/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return 'EVT-' + String(next).padStart(3, '0');
}
