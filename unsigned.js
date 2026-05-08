const SUPABASE_URL = 'https://cpqhljqwxjgscdoepant.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcWhsanF3eGpnc2Nkb2VwYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTM1NTcsImV4cCI6MjA5Mzc4OTU1N30.XATDTbvL7iDrsn-Si0crJWZebw5FSx0weWRmmcL2Z7c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
const BASE_URL = window.location.origin + window.location.pathname.replace('unsigned.html', '');

let allParticipants = [];
let attendanceByDay = {}; // day -> Set of participant_ids
let selectedDay = null;
let eventDays = 1;

async function init() {
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data: ev, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !ev) { document.getElementById('no-event').style.display = 'block'; return; }

  eventDays = ev.days || 1;
  document.getElementById('event-name').textContent = ev.name;
  const prog = (ev.program && ev.program !== 'Other') ? ev.program : null;
  document.getElementById('event-code-prog').textContent = [ev.event_code, prog].filter(Boolean).join(' · ') || 'Not Yet Signed';
  document.getElementById('event-meta').textContent = [
    ev.organizer,
    ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null,
    eventDays > 1 ? eventDays + ' days' : null
  ].filter(Boolean).join(' · ');
  document.title = ev.name + ' — Not Yet Signed';

  document.getElementById('main-ui').style.display = 'block';

  await loadData();
  buildDayButtons(eventDays);
}

async function loadData() {
  const [partsRes, attRes] = await Promise.all([
    db.from('participants').select('*').eq('event_id', eventId).order('code', { ascending: true }),
    db.from('attendance').select('day, participant_id').eq('event_id', eventId)
  ]);
  allParticipants = partsRes.data || [];
  attendanceByDay = {};
  (attRes.data || []).forEach(a => {
    if (!a.day || !a.participant_id) return;
    if (!attendanceByDay[a.day]) attendanceByDay[a.day] = new Set();
    attendanceByDay[a.day].add(a.participant_id);
  });
}

function buildDayButtons(numDays) {
  const container = document.getElementById('day-buttons');
  container.innerHTML = '';
  for (let i = 1; i <= numDays; i++) {
    const label = 'Day ' + i;
    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    btn.textContent = label;
    btn.onclick = () => selectDay(label, i);
    container.appendChild(btn);
  }
}

function selectDay(day, dayNum) {
  selectedDay = day;
  document.querySelectorAll('#day-buttons .toggle-btn').forEach(b => b.classList.toggle('active', b.textContent === day));

  // Show context note
  const noteEl = document.getElementById('day-note');
  noteEl.style.display = 'block';
  if (dayNum === 1) {
    noteEl.textContent = 'Day 1 · Pre-registered, not yet checked in';
  } else {
    noteEl.textContent = 'Day ' + dayNum + ' · All participants not yet signed for this day';
  }

  renderList();
}

function getUnsigned() {
  if (!selectedDay) return [];
  const signed = attendanceByDay[selectedDay] || new Set();
  return allParticipants.filter(p => !signed.has(p.id));
}

function renderList() {
  const q = (document.getElementById('p-search').value || '').toLowerCase();
  const unsigned = getUnsigned();
  const filtered = unsigned.filter(p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.org || '').toLowerCase().includes(q) ||
    (p.code || '').toLowerCase().includes(q) ||
    (p.position_title || '').toLowerCase().includes(q)
  );

  // Stats
  const total = allParticipants.length;
  const unsignedCount = unsigned.length;
  const signedCount = total - unsignedCount;
  document.getElementById('unsigned-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Total</div></div>
    <div class="stat-card"><div class="stat-num" style="color:#c0392b">${unsignedCount}</div><div class="stat-label">Not yet signed</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--green)">${signedCount}</div><div class="stat-label">Signed</div></div>
  `;

  const container = document.getElementById('unsigned-list');
  if (!selectedDay) { container.innerHTML = '<div class="empty">Select a day above.</div>'; return; }
  if (!filtered.length) {
    container.innerHTML = `<div class="empty">${unsigned.length === 0 ? '✓ Everyone has signed for ' + selectedDay + '!' : 'No results for that search.'}</div>`;
    return;
  }

  let html = `<div style="overflow-x:auto"><table>
    <thead><tr>
      <th style="width:12%">Code</th>
      <th style="width:26%">Name</th>
      <th style="width:8%">Sex</th>
      <th style="width:26%">Organization</th>
      <th style="width:18%">Position</th>
      <th style="width:10%">Type</th>
    </tr></thead><tbody>`;

  filtered.forEach(p => {
    const badge = p.reg_type === 'Walk-in'
      ? '<span style="background:#fff3e8;color:var(--orange);font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Walk-in</span>'
      : '<span style="background:#f0f9f4;color:#005c2a;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Pre-reg</span>';
    html += `<tr data-pid="${p.id}" style="cursor:pointer">
      <td style="font-weight:700;font-family:monospace;color:var(--orange)">${esc(p.code)||'—'}</td>
      <td style="font-weight:500">${esc(p.name)}</td>
      <td>${esc(p.sex)||'—'}</td>
      <td>${esc(p.org)}</td>
      <td>${esc(p.position_title)||'—'}</td>
      <td>${badge}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;

  // Click row to open sign form
  const tbody = container.querySelector('tbody');
  if (tbody) {
    tbody.addEventListener('click', e => {
      const row = e.target.closest('tr[data-pid]');
      if (row) window.open(BASE_URL + 'sign.html?participant=' + row.dataset.pid + '&event=' + eventId + '&day=' + encodeURIComponent(selectedDay) + '&from=unsigned', '_blank');
    });
  }
}

function goBack() { window.location.href = BASE_URL + 'event.html?event=' + eventId; }

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Refresh when returning from sign tab
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') { await loadData(); renderList(); }
});

init();
