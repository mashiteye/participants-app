const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = window.location.origin + window.location.pathname.replace('admin.html', '');

let allEvents = [];
let currentEventId = null;
let currentParticipants = [];

function showPane(name) {
  ['create','link','events','participants'].forEach(p => {
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

    const payload = {
      name,
      organizer: val('e-organizer') || null,
      program: document.getElementById('e-prog').value || null,
      event_date: document.getElementById('e-date').value || null
    };

    const { data, error } = await db.from('events').insert([payload]).select();

    btn.textContent = 'Create event'; btn.disabled = false;

    if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'inline'; return; }
    if (!data || !data.length) { errEl.textContent = 'No data returned from insert.'; errEl.style.display = 'inline'; return; }

    ['e-name','e-organizer','e-date'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('e-prog').selectedIndex = 0;

    document.getElementById('share-link').textContent = BASE_URL + 'index.html?event=' + data[0].id;
    showPane('link');
  } catch(e) {
    errEl.textContent = 'Unexpected error: ' + e.message;
    errEl.style.display = 'inline';
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

  allEvents = events || [];
  const countMap = {};
  (counts || []).forEach(p => { countMap[p.event_id] = (countMap[p.event_id] || 0) + 1; });

  document.getElementById('events-loading').style.display = 'none';

  if (!allEvents.length) {
    document.getElementById('events-list').style.display = 'block';
    document.getElementById('events-list').innerHTML = '<div class="empty">No events yet. Create your first event.</div>';
    return;
  }

  let html = '';
  allEvents.forEach(e => {
    const count = countMap[e.id] || 0;
    const dateStr = e.event_date ? new Date(e.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '';
    html += `<div class="event-card">
      <div class="event-card-main">
        <div>
          <p class="event-card-name">${esc(e.name)}</p>
          <p class="event-card-meta">${[e.program, e.organizer, dateStr].filter(Boolean).join(' · ')}</p>
        </div>
        <div class="event-card-count">
          <span class="count-num">${count}</span>
          <span class="count-label">participants</span>
        </div>
      </div>
      <div class="event-card-actions">
        <button class="btn-sm" onclick="viewParticipants('${e.id}', '${esc(e.name)}')">View participants</button>
        <button class="btn-sm" onclick="copyEventLink('${e.id}', this)">Copy link</button>
        <button class="btn-sm danger" onclick="deleteEvent('${e.id}')">Delete</button>
      </div>
    </div>`;
  });

  document.getElementById('events-list').innerHTML = html;
  document.getElementById('events-list').style.display = 'block';
}

function copyEventLink(id, btn) {
  const link = BASE_URL + 'index.html?event=' + id;
  navigator.clipboard.writeText(link).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy link', 2000);
  });
}

async function deleteEvent(id) {
  if (!confirm('Delete this event and all its participants? This cannot be undone.')) return;
  await db.from('participants').delete().eq('event_id', id);
  await db.from('events').delete().eq('id', id);
  loadEvents();
}

async function viewParticipants(eventId, eventName) {
  currentEventId = eventId;
  document.getElementById('view-event-name').textContent = eventName;
  showPane('participants');

  const { data } = await db.from('participants').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
  currentParticipants = data || [];
  renderStats();
  filterParticipants();
}

function renderStats() {
  const progs = ['AYAW','FIRST+II','BIA','FILMA','MCF','Other'];
  const counts = {};
  currentParticipants.forEach(p => { counts[p.prog] = (counts[p.prog] || 0) + 1; });
  let html = `<div class="stat-card"><div class="stat-num">${currentParticipants.length}</div><div class="stat-label">Total</div></div>`;
  progs.forEach(p => {
    if (counts[p]) html += `<div class="stat-card"><div class="stat-num">${counts[p]}</div><div class="stat-label">${p}</div></div>`;
  });
  const gF = currentParticipants.filter(p => p.gender === 'Female').length;
  if (gF) html += `<div class="stat-card"><div class="stat-num">${gF}</div><div class="stat-label">Female</div></div>`;
  document.getElementById('view-stats').innerHTML = html;
}

function filterParticipants() {
  const q = (document.getElementById('p-search').value || '').toLowerCase();
  const filtered = currentParticipants.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.org.toLowerCase().includes(q) ||
    (p.role || '').toLowerCase().includes(q) ||
    p.prog.toLowerCase().includes(q)
  );
  const container = document.getElementById('participants-list');
  if (!filtered.length) {
    container.innerHTML = `<div class="empty">${currentParticipants.length ? 'No results.' : 'No participants registered yet.'}</div>`;
    return;
  }
  let html = `<div style="overflow-x:auto"><table>
    <thead><tr>
      <th class="col-name">Name</th><th class="col-org">Organization</th>
      <th class="col-role">Role</th><th class="col-prog">Program</th>
      <th class="col-phone">Phone</th><th class="col-act"></th>
    </tr></thead><tbody>`;
  filtered.forEach(p => {
    html += `<tr>
      <td title="${esc(p.name)}">${esc(p.name)}</td>
      <td title="${esc(p.org)}">${esc(p.org)}</td>
      <td>${esc(p.role) || '&mdash;'}</td>
      <td><span class="badge badge-${badgeClass(p.prog)}">${esc(p.prog)}</span></td>
      <td>${esc(p.phone) || '&mdash;'}</td>
      <td style="text-align:right"><button class="btn-sm danger" onclick="deleteP('${p.id}')">Remove</button></td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function badgeClass(prog) {
  const map = { AYAW:'ayaw', 'FIRST+II':'first', BIA:'bia', FILMA:'filma', MCF:'mcf' };
  return map[prog] || 'other';
}

async function deleteP(id) {
  if (!confirm('Remove this participant?')) return;
  await db.from('participants').delete().eq('id', id);
  currentParticipants = currentParticipants.filter(p => p.id !== id);
  renderStats(); filterParticipants();
}

function exportCSV() {
  const headers = ['Name','Organization','Role','Program','Phone','Email','Region','Gender','Notes','Registered'];
  const rows = currentParticipants.map(p =>
    [p.name,p.org,p.role,p.prog,p.phone,p.email,p.region,p.gender,p.notes,p.created_at]
      .map(v => `"${(v||'').replace(/"/g,'""')}"`)
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `participants-${document.getElementById('view-event-name').textContent.replace(/\s+/g,'-')}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

showPane('events');
