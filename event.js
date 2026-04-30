const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
const BASE_URL = window.location.origin + window.location.pathname.replace('event.html', '');
let allParticipants = [];
let eventDays = 1;

async function init() {
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data: ev, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !ev) { document.getElementById('no-event').style.display = 'block'; return; }

  eventDays = ev.days || 1;
  document.getElementById('event-ui').style.display = 'block';
  document.getElementById('event-name').textContent = ev.name;
  document.getElementById('event-code-prog').textContent = [ev.event_code, ev.program].filter(Boolean).join(' · ') || 'Participant View';
  document.getElementById('event-meta').textContent = [
    ev.organizer,
    ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null,
    ev.days > 1 ? ev.days + ' days' : null
  ].filter(Boolean).join(' · ');
  document.title = ev.name + ' — Participants';

  await loadParticipants();
}

async function loadParticipants() {
  const { data } = await db.from('participants').select('*').eq('event_id', eventId).order('code', { ascending: true });
  allParticipants = data || [];
  renderStats();
  filterParticipants();
}

function renderStats() {
  const total = allParticipants.length;
  const female = allParticipants.filter(p => p.sex === 'Female').length;
  const male = allParticipants.filter(p => p.sex === 'Male').length;
  let html = `<div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Registered</div></div>`;
  if (female) html += `<div class="stat-card"><div class="stat-num">${female}</div><div class="stat-label">Female</div></div>`;
  if (male) html += `<div class="stat-card"><div class="stat-num">${male}</div><div class="stat-label">Male</div></div>`;
  document.getElementById('view-stats').innerHTML = html;
}

function filterParticipants() {
  const q = (document.getElementById('p-search').value || '').toLowerCase();
  const filtered = allParticipants.filter(p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.org || '').toLowerCase().includes(q) ||
    (p.position_title || '').toLowerCase().includes(q) ||
    (p.code || '').toLowerCase().includes(q)
  );
  const container = document.getElementById('participants-list');
  if (!filtered.length) {
    container.innerHTML = `<div class="empty">${allParticipants.length ? 'No results.' : 'No participants registered yet.'}</div>`;
    return;
  }
  let html = `<div style="overflow-x:auto"><table>
    <thead><tr>
      <th style="width:13%">Code</th>
      <th style="width:28%">Name</th>
      <th style="width:9%">Sex</th>
      <th style="width:28%">Organization</th>
      <th style="width:22%">Position</th>
    </tr></thead><tbody>`;
  filtered.forEach(p => {
    html += `<tr>
      <td style="font-weight:700;font-family:monospace;color:var(--orange)">${esc(p.code) || '&mdash;'}</td>
      <td><span class="td-link" onclick="openSignForm('${p.id}')">${esc(p.name)}</span></td>
      <td>${esc(p.sex) || '&mdash;'}</td>
      <td title="${esc(p.org)}">${esc(p.org)}</td>
      <td>${esc(p.position_title) || '&mdash;'}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function openPreReg() {
  window.open(BASE_URL + 'index.html?event=' + eventId, '_blank');
}

function openWalkin() {
  window.open(BASE_URL + 'index.html?event=' + eventId + '&walkin=1', '_blank');
}

function openSignForm(participantId) {
  window.open(BASE_URL + 'sign.html?participant=' + participantId + '&event=' + eventId, '_blank');
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

init();
