const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allEvents = [], allParticipants = [], allAttendance = [];

async function loadDashboard() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('dashboard-content').style.display = 'none';

  const [evRes, partsRes, attRes] = await Promise.all([
    db.from('events').select('*').order('event_date', { ascending: false }),
    db.from('participants').select('*'),
    db.from('attendance').select('participant_id, event_id, day')
  ]);

  allEvents = evRes.data || [];
  allParticipants = partsRes.data || [];
  allAttendance = attRes.data || [];

  // Populate year filter
  const years = [...new Set(allEvents
    .filter(e => e.event_date)
    .map(e => new Date(e.event_date).getFullYear())
  )].sort((a,b) => b-a);
  const yearSel = document.getElementById('filter-year');
  const currentYears = [...yearSel.options].map(o => o.value);
  years.forEach(y => {
    if (!currentYears.includes(String(y))) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSel.appendChild(opt);
    }
  });

  document.getElementById('last-updated').textContent = 'Updated ' + new Date().toLocaleTimeString();
  renderDashboard();
}

function getFiltered() {
  const prog = document.getElementById('filter-program').value;
  const year = document.getElementById('filter-year').value;
  const quarterEl = document.getElementById('filter-quarter');
  const quarter = quarterEl ? quarterEl.value : '';

  let events = allEvents;
  if (prog) events = events.filter(e => e.program === prog);
  if (year) events = events.filter(e => e.event_date && new Date(e.event_date).getFullYear() === parseInt(year));

  const eventIds = new Set(events.map(e => e.id));
  const participants = allParticipants.filter(p => eventIds.has(p.event_id));
  const attendance = allAttendance.filter(a => eventIds.has(a.event_id));

  return { events, participants, attendance };
}

function pct(n, total) { return total ? Math.round(n / total * 100) : 0; }

function renderDashboard() {
  const { events, participants, attendance } = getFiltered();

  const signedIds = new Set(attendance.map(a => a.participant_id));
  const female = participants.filter(p => p.sex === 'Female').length;
  const male = participants.filter(p => p.sex === 'Male').length;
  const signed = participants.filter(p => signedIds.has(p.id)).length;
  const total = participants.length;
  const signRate = pct(signed, total);

  // Headline stats
  document.getElementById('headline-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num" style="color:var(--red)">${events.length}</div><div class="stat-label">Events</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--red)">${total}</div><div class="stat-label">Registered</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--orange)">${signed}</div><div class="stat-label">Signed</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--orange)">${signRate}%</div><div class="stat-label">Sign Rate</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--black)">${female}</div><div class="stat-label">Female</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--black)">${male}</div><div class="stat-label">Male</div></div>
  `;

  // Sign rate bar
  document.getElementById('sign-rate-bar').style.width = signRate + '%';
  document.getElementById('sign-rate-label').textContent =
    signed + ' of ' + total + ' participants signed (' + signRate + '%)';

  // Gender bars
  const femPct = pct(female, total);
  const malPct = pct(male, total);
  document.getElementById('gender-bars').innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600">Female</span>
        <span style="font-size:13px;font-weight:700;color:var(--red)">${female} (${femPct}%)</span>
      </div>
      <div style="background:#f0f0f0;border-radius:20px;height:14px;overflow:hidden">
        <div style="width:${femPct}%;height:100%;background:var(--red);border-radius:20px"></div>
      </div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600">Male</span>
        <span style="font-size:13px;font-weight:700;color:var(--orange)">${male} (${malPct}%)</span>
      </div>
      <div style="background:#f0f0f0;border-radius:20px;height:14px;overflow:hidden">
        <div style="width:${malPct}%;height:100%;background:var(--orange);border-radius:20px"></div>
      </div>
    </div>
  `;

  // Per-event table
  const attByEvent = {};
  allAttendance.forEach(a => { attByEvent[a.event_id] = (attByEvent[a.event_id] || new Set()).add(a.participant_id); });
  const partByEvent = {};
  allParticipants.forEach(p => { if (!partByEvent[p.event_id]) partByEvent[p.event_id] = []; partByEvent[p.event_id].push(p); });

  let tableHtml = `<thead><tr>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Event</th>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Program</th>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Date</th>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Registered</th>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Signed</th>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Sign Rate</th>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Female</th>
    <th style="background:var(--black);color:white;padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Male</th>
  </tr></thead><tbody>`;

  events.forEach((e, i) => {
    const eParts = partByEvent[e.id] || [];
    const eSigned = (attByEvent[e.id] || new Set()).size;
    const eTotal = eParts.length;
    const eRate = pct(eSigned, eTotal);
    const eFemale = eParts.filter(p => p.sex === 'Female').length;
    const eMale = eParts.filter(p => p.sex === 'Male').length;
    const dateStr = e.event_date ? new Date(e.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';
    const prog = (e.program && e.program !== 'Other') ? e.program : '—';
    const bg = i % 2 === 0 ? '#fff' : '#f9f9f9';

    // Sign rate colour
    const rateColor = eRate >= 80 ? 'var(--green)' : eRate >= 50 ? 'var(--orange)' : 'var(--red)';

    tableHtml += `<tr style="background:${bg};cursor:pointer" onclick="window.open('admin.html#event-${e.id}','_self')">
      <td style="padding:10px 12px;font-weight:600;border-bottom:0.5px solid #eee">${e.name}</td>
      <td style="padding:10px 12px;color:var(--text-muted);border-bottom:0.5px solid #eee">${prog}</td>
      <td style="padding:10px 12px;color:var(--text-muted);border-bottom:0.5px solid #eee;white-space:nowrap">${dateStr}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:var(--red);border-bottom:0.5px solid #eee">${eTotal}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:var(--orange);border-bottom:0.5px solid #eee">${eSigned}</td>
      <td style="padding:10px 12px;text-align:right;border-bottom:0.5px solid #eee">
        <span style="font-weight:700;color:${rateColor}">${eRate}%</span>
      </td>
      <td style="padding:10px 12px;text-align:right;border-bottom:0.5px solid #eee">${eFemale}</td>
      <td style="padding:10px 12px;text-align:right;border-bottom:0.5px solid #eee">${eMale}</td>
    </tr>`;
  });

  if (!events.length) {
    tableHtml += '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted)">No events found</td></tr>';
  }
  tableHtml += '</tbody>';
  document.getElementById('events-table').innerHTML = tableHtml;



  document.getElementById('loading').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';
}

loadDashboard();
