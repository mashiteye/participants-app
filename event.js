const SUPABASE_URL = 'https://cpqhljqwxjgscdoepant.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcWhsanF3eGpnc2Nkb2VwYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTM1NTcsImV4cCI6MjA5Mzc4OTU1N30.XATDTbvL7iDrsn-Si0crJWZebw5FSx0weWRmmcL2Z7c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
const BASE_URL = window.location.origin + window.location.pathname.replace('event.html', '');
let allParticipants = [];
let eventDays = 1;
let currentFilter = 'all';
let currentFilterDay = 'Day 1';
let attendanceByDay = {}; // day -> Set of participant_ids

async function init() {
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data: ev, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !ev) { document.getElementById('no-event').style.display = 'block'; return; }

  eventDays = ev.days || 1;
  // Store for stats use
  window._eventDays = eventDays;
  document.getElementById('event-ui').style.display = 'block';
  document.getElementById('event-name').textContent = ev.name;
  const evDisplayProg = (ev.program && ev.program !== 'Other') ? ev.program : null;
  document.getElementById('event-code-prog').textContent = [ev.event_code, evDisplayProg].filter(Boolean).join(' · ') || 'Participant View';
  document.getElementById('event-meta').textContent = [
    ev.organizer,
    ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null,
    ev.days > 1 ? ev.days + ' days' : null
  ].filter(Boolean).join(' · ');
  document.title = ev.name + ' — Participants';

  await loadParticipants();
}

async function loadParticipants() {
  const [{ data: parts }, { data: att }] = await Promise.all([
    db.from('participants').select('*').eq('event_id', eventId).order('code', { ascending: true }),
    db.from('attendance').select('day').eq('event_id', eventId)
  ]);
  allParticipants = parts || [];
  // Build day counts
  window._attendanceByDay = {};
  (att || []).forEach(a => {
    window._attendanceByDay[a.day] = (window._attendanceByDay[a.day] || 0) + 1;
  });
  renderStats();
  filterParticipants();
}

function renderStats() {
  const total = allParticipants.length;
  const female = allParticipants.filter(p => p.sex === 'Female').length;
  const male = allParticipants.filter(p => p.sex === 'Male').length;
  // Count signed (any day)
  const signedCount = allParticipants.filter(p =>
    Object.values(attendanceByDay).some(set => set.has(p.id))
  ).length;

  let html = `<div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Registered</div></div>`;
  if (signedCount) html += `<div class="stat-card"><div class="stat-num">${signedCount}</div><div class="stat-label">Signed</div></div>`;
  if (female) html += `<div class="stat-card"><div class="stat-num">${female}</div><div class="stat-label">Female</div></div>`;
  if (male) html += `<div class="stat-card"><div class="stat-num">${male}</div><div class="stat-label">Male</div></div>`;

  // Per-day attendance stats — fetched separately
  if (window._attendanceByDay) {
    const numDays = window._eventDays || 1;
    Array.from({ length: numDays }, (_, i) => 'Day ' + (i + 1)).forEach(d => {
      const c = window._attendanceByDay[d] || 0;
      html += `<div class="stat-card"><div class="stat-num">${c}</div><div class="stat-label">${d}</div></div>`;
    });
  }
  document.getElementById('view-stats').innerHTML = html;
}

function buildDaySelector() {
  const sel = document.getElementById('filter-day');
  sel.innerHTML = '';
  Array.from({ length: eventDays }, (_, i) => 'Day ' + (i + 1)).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = d;
    if (d === currentFilterDay) opt.selected = true;
    sel.appendChild(opt);
  });
}

function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-' + f).classList.add('active');
  // Show day selector only when filtering by signed status
  const daySelVisible = f !== 'all';
  document.getElementById('filter-day').style.display = daySelVisible ? 'block' : 'none';
  filterParticipants();
}

function applyDayFilter() {
  currentFilterDay = document.getElementById('filter-day').value;
  filterParticipants();
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
  let html = `<div style="overflow-x:auto"><table id="participants-table">
    <thead><tr>
      <th style="width:11%">Code</th>
      <th style="width:26%">Name</th>
      <th style="width:8%">Sex</th>
      <th style="width:26%">Organization</th>
      <th style="width:20%">Position</th>
      <th style="width:9%">Type</th>
    </tr></thead><tbody>`;
  filtered.forEach(p => {
    const regTypeBadge = p.reg_type === 'Walk-in'
      ? '<span style="background:#fff3e8;color:var(--orange);font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Walk-in</span>'
      : '<span style="background:#f0f9f4;color:#005c2a;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Pre-reg</span>';
    html += `<tr data-pid="${p.id}" style="cursor:pointer">
      <td style="font-weight:700;font-family:monospace;color:var(--orange)">${esc(p.code) || '&mdash;'}</td>
      <td style="font-weight:500">${esc(p.name)}</td>
      <td>${esc(p.sex) || '&mdash;'}</td>
      <td title="${esc(p.org)}">${esc(p.org)}</td>
      <td>${esc(p.position_title) || '&mdash;'}</td>
      <td>${regTypeBadge}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;

  // Event delegation — attach once to table body
  const tbody = container.querySelector('tbody');
  if (tbody) {
    tbody.addEventListener('click', e => {
      const row = e.target.closest('tr[data-pid]');
      if (row) openSignForm(row.dataset.pid);
    });
  }
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


async function exportEventPDF() {
  const btn = [...document.querySelectorAll('.reg-back-btn')].find(b => b.textContent === 'Export PDF');
  if (btn) { btn.textContent = 'Building...'; btn.disabled = true; }
  try {
    const { jsPDF } = window.jspdf;
    const evName = document.getElementById('event-name').textContent;
    const evMeta = document.getElementById('event-meta').textContent;
    const MARGIN = 30;

    // Fetch attendance and event days
    const [{ data: ev }, { data: attendance }] = await Promise.all([
      db.from('events').select('days').eq('id', eventId).single(),
      db.from('attendance').select('*').eq('event_id', eventId).order('signed_at', { ascending: true })
    ]);
    const numDays = ev?.days || 1;
    const attMap = {};
    (attendance || []).forEach(a => {
      if (!attMap[a.participant_id]) attMap[a.participant_id] = {};
      attMap[a.participant_id][a.day] = a;
    });

    // Pre-fetch signatures
    async function urlToBase64(url) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch { return null; }
    }
    const sigCache = {};
    const urlsToFetch = [];
    allParticipants.forEach(p => {
      const days = attMap[p.id] || {};
      Object.values(days).forEach(a => {
        if (a.signature_url && !sigCache[a.signature_url]) urlsToFetch.push(a.signature_url);
      });
    });
    await Promise.all(urlsToFetch.map(async url => { sigCache[url] = await urlToBase64(url); }));

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(235, 0, 27);   doc.rect(0, 0, pageW * 0.4, 50, 'F');
    doc.setFillColor(255, 95, 0);   doc.rect(pageW * 0.4, 0, pageW * 0.4, 50, 'F');
    doc.setFillColor(247, 158, 27); doc.rect(pageW * 0.8, 0, pageW * 0.2, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text(evName, MARGIN, 22);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(evMeta + '  ·  ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }), MARGIN, 36);
    doc.text('Registered: ' + allParticipants.length + '   Signed: ' + Object.keys(attMap).length, MARGIN, 47);

    const dayLabels = Array.from({ length: numDays }, (_, i) => 'Day ' + (i + 1));
    const FIXED_COLS = [
      { label: '#', w: 18 }, { label: 'Code', w: 38 }, { label: 'Name', w: 85 },
      { label: 'Sex', w: 24 }, { label: 'Organization', w: 90 },
      { label: 'Position', w: 75 }, { label: 'Program', w: 70 }, { label: 'Type', w: 38 }
    ];
    const usable = pageW - MARGIN * 2 - FIXED_COLS.reduce((a,b) => a + b.w, 0);
    const dayW = Math.max(55, Math.floor(usable / numDays));
    const ALL_COLS = [...FIXED_COLS, ...dayLabels.map(d => ({ label: d, w: dayW }))];
    let cx = MARGIN;
    ALL_COLS.forEach(c => { c.x = cx; cx += c.w; });

    const SIG_H = 55;
    const TEXT_H = 20;

    function drawHeaderRow(y) {
      doc.setFillColor(0, 0, 0);
      doc.rect(MARGIN, y, pageW - MARGIN * 2, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
      ALL_COLS.forEach(c => doc.text(c.label, c.x + 2, y + 9.5));
    }

    function trunc(s, n) { s = s||''; return s.length > n ? s.slice(0,n-1)+'…' : s; }

    drawHeaderRow(58);
    let y = 72;

    for (let idx = 0; idx < allParticipants.length; idx++) {
      const p = allParticipants[idx];
      const pAtt = attMap[p.id] || {};
      const hasSig = Object.values(pAtt).some(a => a.signature_url && sigCache[a.signature_url]);
      const rowH = hasSig ? SIG_H : TEXT_H;

      if (y + rowH > pageH - 20) {
        doc.addPage();
        y = 14;
        drawHeaderRow(y); y += 14;
      }

      doc.setFillColor(idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 249);
      doc.rect(MARGIN, y, pageW - MARGIN * 2, rowH, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(MARGIN, y, pageW - MARGIN * 2, rowH, 'S');

      const ty = y + (rowH > TEXT_H ? 8 : 13);
      doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.setTextColor(0,0,0); doc.text(String(idx+1), FIXED_COLS[0].x+2, ty);
      doc.setTextColor(255,95,0); doc.setFont('helvetica','bold');
      doc.text(trunc(p.code||'—',10), FIXED_COLS[1].x+2, ty);
      doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
      doc.text(trunc(p.name||'',22), FIXED_COLS[2].x+2, ty);
      doc.text(trunc(p.sex||'—',6), FIXED_COLS[3].x+2, ty);
      doc.text(trunc(p.org||'',24), FIXED_COLS[4].x+2, ty);
      doc.text(trunc(p.position_title||'',20), FIXED_COLS[5].x+2, ty);
      doc.text(trunc(p.prog||'',18), FIXED_COLS[6].x+2, ty);
      const rt = p.reg_type==='Walk-in';
      doc.setTextColor(rt?255:0, rt?95:92, rt?0:42);
      doc.text(rt?'Walk-in':'Pre-reg', FIXED_COLS[7].x+2, ty);

      // Day signature columns
      dayLabels.forEach(dl => {
        const dc = ALL_COLS.find(c => c.label === dl);
        const att = pAtt[dl];
        if (att?.signature_url && sigCache[att.signature_url]) {
          try {
            doc.addImage(sigCache[att.signature_url],'PNG', dc.x+2, y+2, dc.w-4, rowH-4);
          } catch { doc.setFontSize(6); doc.setTextColor(180,180,180); doc.text('[err]',dc.x+2,ty); }
        } else {
          doc.setDrawColor(230,230,230);
          doc.rect(dc.x+2, y+2, dc.w-4, rowH-4);
        }
      });
      y += rowH;
    }

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(6.5); doc.setTextColor(150,150,150);
      doc.text('Page '+i+' of '+pages+'  ·  '+evName+'  ·  METSS LBG Participants App', MARGIN, pageH-10);
    }

    doc.save('attendance-'+evName.replace(/\s+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.pdf');
  } catch(e) {
    alert('PDF export failed: ' + e.message);
    console.error(e);
  } finally {
    if (btn) { btn.textContent = 'Export PDF'; btn.disabled = false; }
  }
}

function openUnsigned() {
  window.open(BASE_URL + 'unsigned.html?event=' + eventId, '_blank');
}
