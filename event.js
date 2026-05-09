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

function goBackToEvents() {
  window.location.href = BASE_URL + 'admin.html';
}

function openRegistration() {
  window.location.href = BASE_URL + 'register.html?event=' + eventId + '&return=' + encodeURIComponent('event.html?event=' + eventId);
}
function openPreReg() { window.location.href = BASE_URL + 'index.html?event=' + eventId; }
function openWalkin() { window.location.href = BASE_URL + 'index.html?event=' + eventId + '&walkin=1'; }

async function viewSig(participantId, day, e) {
  e.stopPropagation();
  const { data: att } = await db.from('attendance')
    .select('signature_url').eq('participant_id', participantId)
    .eq('event_id', eventId).eq('day', day).single();
  if (att?.signature_url) window.open(att.signature_url, '_blank');
}

async function generateEventCertificates() {
  const btn = document.getElementById('cert-btn');
  if (btn) { btn.textContent = 'Building...'; btn.disabled = true; }

  try {
    const { jsPDF } = window.jspdf;
    const evName = document.getElementById('event-name').textContent;
    const { data: ev } = await db.from('events').select('*').eq('id', eventId).single();
    if (!ev) { alert('Event not found.'); return; }

    const { data: attendance } = await db.from('attendance').select('participant_id').eq('event_id', eventId);
    const signedIds = new Set((attendance || []).map(a => a.participant_id));
    const eligible = allParticipants.filter(p => signedIds.has(p.id));

    if (!eligible.length) { alert('No participants have signed attendance yet.'); return; }

    async function loadImg(url) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise(r => { const reader = new FileReader(); reader.onload = () => r(reader.result); reader.readAsDataURL(blob); });
      } catch { return null; }
    }

    const sigB64 = ev.signatory_signature_url ? await loadImg(ev.signatory_signature_url) : null;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const RED=[235,0,27], ORANGE=[255,95,0], YELLOW=[247,158,27], BLACK=[0,0,0], WHITE=[255,255,255];
    const dateStr = ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});

    eligible.forEach((p, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFillColor(...WHITE); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...RED); doc.rect(0,0,W,55,'F');
      doc.setFillColor(...ORANGE); doc.rect(0,40,W,15,'F');
      doc.setFillColor(...YELLOW); doc.rect(0,55,W,6,'F');
      doc.setFillColor(...BLACK); doc.rect(0,H-55,W,55,'F');
      doc.setFillColor(...YELLOW); doc.rect(0,H-55,W,8,'F');
      doc.setFillColor(...RED); doc.rect(0,61,10,H-116,'F');
      doc.setFillColor(...ORANGE); doc.rect(W-10,61,10,H-116,'F');
      doc.setTextColor(...WHITE); doc.setFontSize(13); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE OF PARTICIPATION',W/2,28,{align:'center'});
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      doc.text('',30,H-22);
      doc.text(dateStr,W-30,H-22,{align:'right'});
      const CX=40, CY=85;
      doc.setTextColor(120,120,120); doc.setFontSize(13); doc.setFont('helvetica','italic');
      doc.text('This is to certify that',CX,CY);
      const fs = p.name.length>25?32:p.name.length>20?36:42;
      doc.setFontSize(fs); doc.setFont('helvetica','bold'); doc.setTextColor(...RED);
      doc.text(p.name||'',CX,CY+50);
      const nw=Math.min(doc.getTextWidth(p.name||''),W-80);
      doc.setFillColor(...YELLOW); doc.rect(CX,CY+56,nw,4,'F');
      const det=[p.position_title,p.org].filter(Boolean).join('   ·   ');
      doc.setTextColor(80,80,80); doc.setFontSize(12); doc.setFont('helvetica','normal');
      if(det) doc.text(det,CX,CY+78);
      doc.setTextColor(100,100,100); doc.setFontSize(13); doc.setFont('helvetica','italic');
      doc.text('has successfully participated in',CX,CY+108);
      doc.setTextColor(...ORANGE); doc.setFontSize(22); doc.setFont('helvetica','bold');
      const evLines=doc.splitTextToSize(evName,W-320);
      doc.text(evLines,CX,CY+135);
      doc.setTextColor(100,100,100); doc.setFontSize(11); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text('Organised by  '+ev.organizer,CX,CY+135+evLines.length*26+8);
      const SX=W-260, SY=H-110;
      if(sigB64) doc.addImage(sigB64,'PNG',SX,SY-45,150,40);
      doc.setDrawColor(...BLACK); doc.setLineWidth(1); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',SX,SY+14);
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
      if(ev.signatory_title) doc.text(ev.signatory_title,SX,SY+26);
      doc.setFillColor(...YELLOW); doc.roundedRect(CX,H-100-14,90,20,4,4,'F');
      doc.setTextColor(...BLACK); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(p.code||'',CX+45,H-100-0.5,{align:'center'});
    });

    doc.save('certificates-'+evName.replace(/\s+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.pdf');
  } catch(e) { alert('Certificate generation failed: '+e.message); console.error(e); }
  finally { if(btn){btn.textContent='🎓 Certificates';btn.disabled=false;} }
}

function showSkeletonStats() {
  const container = document.getElementById('stat-days');
  if (!container) return;
  container.innerHTML = Array(3).fill(
    '<div class="stat-card" style="border-top:3px solid #e0e0e0">' +
    '<div class="skeleton skeleton-num"></div>' +
    '<div class="skeleton skeleton-text"></div></div>'
  ).join('');
}

async function init() {
  // Show Back to Events button if opened from admin
  const fromAdmin = new URLSearchParams(window.location.search).get('from') === 'admin';
  if (fromAdmin) {
    // back-to-events-btn always visible
    document.getElementById('cert-btn').style.display = 'block';
    document.getElementById('edit-event-btn').style.display = 'block';
    document.getElementById('import-csv-btn').style.display = 'block';
    document.getElementById('delete-event-btn').style.display = 'block';
  }
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data: ev, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !ev) { document.getElementById('no-event').style.display = 'block'; return; }

  eventDays = ev.days || 1;
  // Store for stats use
  window._eventDays = eventDays;
  document.getElementById('event-ui').style.display = 'block';
  document.getElementById('event-name').textContent = ev.name;
  // Status badge removed
  const evDisplayProg = (ev.program && ev.program !== 'Other') ? ev.program : null;
  document.getElementById('event-code-prog').textContent = [ev.event_code, evDisplayProg].filter(Boolean).join(' · ');
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
  // Data loaded — exports now have allParticipants available
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
  if (!q) {
    document.getElementById('participants-list').innerHTML =
      '<div style="padding:2.5rem 1rem;text-align:center;color:var(--text-muted);font-size:13px">Type a name, code, or organisation to search.</div>';
    document.getElementById('list-count-label').textContent = '';
    return;
  }
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
      <th style="width:9%">Code</th>
      <th style="width:16%">Name</th>
      <th style="width:6%">Sex</th>
      <th style="width:16%">Organization</th>
      <th style="width:13%">Position</th>
      <th style="width:13%">Program</th>
      <th style="width:8%">Type</th>
      <th style="width:11%">Days Signed</th>
      <th style="width:8%">Signature</th>
    </tr></thead><tbody>`;
  filtered.forEach(p => {
    const pAtt = attendanceByDay;
    const daysSigned = Object.entries(pAtt)
      .filter(([, set]) => set.has(p.id))
      .map(([d]) => d).sort().join(', ') || '&mdash;';
    const sigLinks = Object.entries(pAtt)
      .filter(([, set]) => set.has(p.id))
      .map(([d]) => `<a href="#" style="font-size:10px;color:var(--orange)" onclick="viewSig('${p.id}','${d}',event)">${d}</a>`)
      .join(' ');
    const regTypeBadge = p.reg_type === 'Walk-in'
      ? '<span style="background:#fff3e8;color:var(--orange);font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Walk-in</span>'
      : '<span style="background:#f0f9f4;color:#005c2a;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Pre-reg</span>';
    const sigUrl = BASE_URL + 'sign.html?participant=' + p.id + '&event=' + eventId + (new URLSearchParams(window.location.search).get('from') === 'admin' ? '&from=admin' : '');
    html += `<tr data-pid="${p.id}" data-url="${sigUrl}" style="cursor:pointer">
      <td style="font-weight:700;font-family:monospace;color:var(--orange)">${esc(p.code) || '&mdash;'}</td>
      <td style="font-weight:500">${esc(p.name)}</td>
      <td>${esc(p.sex) || '&mdash;'}</td>
      <td title="${esc(p.org)}">${esc(p.org)}</td>
      <td>${esc(p.position_title) || '&mdash;'}</td>
      <td>${esc(p.prog) || '&mdash;'}</td>
      <td>${regTypeBadge}</td>
      <td style="font-size:12px">${daysSigned}</td>
      <td style="font-size:11px">${sigLinks || '&mdash;'}</td>
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





function openSignForm(participantId) {
  window.location.href = BASE_URL + 'sign.html?participant=' + participantId + '&event=' + eventId;
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
      doc.text('Page '+i+' of '+pages+'  ·  '+evName, MARGIN, pageH-10);
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
  window.location.href = BASE_URL + 'unsigned.html?event=' + eventId;
}

async function exportEventQRSheet() {
  const btn = document.getElementById('qr-sheet-btn');
  if (btn) { btn.textContent = 'Building...'; btn.disabled = true; }
  try {
    const { jsPDF } = window.jspdf;
    const evName = document.getElementById('event-name').textContent;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const MARGIN = 30;

    doc.setFillColor(235, 0, 27);   doc.rect(0, 0, W * 0.4, 40, 'F');
    doc.setFillColor(255, 95, 0);   doc.rect(W * 0.4, 0, W * 0.35, 40, 'F');
    doc.setFillColor(247, 158, 27); doc.rect(W * 0.75, 0, W * 0.25, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(evName, MARGIN, 18);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('Participant QR Codes  ·  Scan to sign attendance', MARGIN, 32);

    const BASE = window.location.origin + window.location.pathname.replace('event.html', '');
    const COLS = 3;
    const CELL_W = (W - MARGIN * 2) / COLS;
    const QR_SIZE = 90;
    const CELL_H = QR_SIZE + 55;
    let x = MARGIN, y = 55, col = 0;

    for (const p of allParticipants) {
      const signUrl = BASE + 'sign.html?participant=' + p.id + '&event=' + eventId;
      const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + QR_SIZE + 'x' + QR_SIZE + '&data=' + encodeURIComponent(signUrl);
      const qrDataUrl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = QR_SIZE; c.height = QR_SIZE;
          c.getContext('2d').drawImage(img, 0, 0, QR_SIZE, QR_SIZE);
          resolve(c.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = qrApiUrl;
      });

      if (y + CELL_H > H - 20) { doc.addPage(); y = 20; }

      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x + 4, y + 2, CELL_W - 8, CELL_H - 4, 6, 6, 'FD');
      doc.addImage(qrDataUrl, 'PNG', x + (CELL_W - QR_SIZE) / 2, y + 8, QR_SIZE, QR_SIZE);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      doc.setTextColor(255, 95, 0);
      doc.text(p.code || '—', x + CELL_W / 2, y + QR_SIZE + 20, { align: 'center' });
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text((p.name||'').slice(0,22), x + CELL_W / 2, y + QR_SIZE + 33, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text((p.org||'').slice(0,25), x + CELL_W / 2, y + QR_SIZE + 44, { align: 'center' });

      col++;
      if (col >= COLS) { col = 0; x = MARGIN; y += CELL_H; } else { x += CELL_W; }
    }

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(6.5); doc.setTextColor(150, 150, 150);
      doc.text('Page ' + i + ' of ' + pages + '  ·  ' + evName, MARGIN, H - 10);
    }

    doc.save('qr-codes-' + evName.replace(/\s+/g, '-') + '.pdf');
  } catch(e) { alert('QR export failed: ' + e.message); }
  finally { if (btn) { btn.textContent = 'Export QR Sheet'; btn.disabled = false; } }
}

// ── Admin password modal ──
let _adminAction = null;

function promptEditEvent() {
  _adminAction = 'edit';
  document.getElementById('admin-pwd-title').textContent = 'Enter admin password to edit event';
  document.getElementById('admin-pwd-input').value = '';
  document.getElementById('admin-pwd-err').style.display = 'none';
  document.getElementById('admin-pwd-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('admin-pwd-input').focus(), 100);
}

function promptDeleteEvent() {
  _adminAction = 'delete';
  document.getElementById('admin-pwd-title').textContent = 'Enter admin password to delete event';
  document.getElementById('admin-pwd-input').value = '';
  document.getElementById('admin-pwd-err').style.display = 'none';
  document.getElementById('admin-pwd-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('admin-pwd-input').focus(), 100);
}

function closeAdminPwd() {
  document.getElementById('admin-pwd-modal').style.display = 'none';
  _adminAction = null;
}

async function checkAdminPwd() {
  const pwd = document.getElementById('admin-pwd-input').value;
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd.toUpperCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
  if (hashHex !== '3b33a25d09dbd7a9f00296a32852e0cb064eaaa76d4294c370b1b6da15ebb0bc') {
    const errEl = document.getElementById('admin-pwd-err');
    const input = document.getElementById('admin-pwd-input');
    errEl.textContent = 'Incorrect password. Try again.';
    errEl.style.display = 'block';
    input.value = '';
    // Shake animation
    input.style.borderColor = '#EB001B';
    input.style.animation = 'shake 0.4s ease';
    setTimeout(() => { input.style.animation = ''; input.style.borderColor = ''; input.focus(); }, 500);
    return;
  }
  closeAdminPwd();
  if (_adminAction === 'edit') editEvent();
  else if (_adminAction === 'delete') deleteEventFromPage();
}

// ── Manage zone functions (admin only) ──
async function editEvent() {
  window.location.href = BASE_URL + 'edit-event.html?event=' + eventId;
}

async function editEvent_old() {
  const { data: ev } = await db.from('events').select('*').eq('id', eventId).single();
  if (!ev) { alert('Could not load event data.'); return; }

  const existing = document.getElementById('inline-edit-modal');
  if (existing) existing.remove();

  const days = ev.days || 1;

  // Build days options
  let daysOpts = '';
  for (let d = 1; d <= 5; d++) {
    daysOpts += '<option value="' + d + '"' + (d === days ? ' selected' : '') + '>' + d + ' day' + (d > 1 ? 's' : '') + '</option>';
  }

  const modal = document.createElement('div');
  modal.id = 'inline-edit-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:300;display:flex;align-items:flex-start;justify-content:center;padding:1.5rem 1rem;overflow-y:auto';

  const inner = document.createElement('div');
  inner.style.cssText = 'background:white;border-radius:16px;padding:1.75rem;max-width:480px;width:100%';

  const fields = [
    { id: 'ie-name',      label: 'Event Name *',     val: ev.name || '',           type: 'text' },
    { id: 'ie-organizer', label: 'Organiser',         val: ev.organizer || '',      type: 'text' },
    { id: 'ie-date',      label: 'Event Date',        val: ev.event_date || '',     type: 'date' },
    { id: 'ie-code',      label: 'Event Code',        val: ev.event_code || '',     type: 'text' },
    { id: 'ie-sig-name',  label: 'Signatory Name',    val: ev.signatory_name || '', type: 'text' },
    { id: 'ie-sig-title', label: 'Signatory Title',   val: ev.signatory_title || '', type: 'text' },
  ];

  inner.innerHTML = '<p style="font-size:16px;font-weight:800;margin-bottom:1.25rem;color:#000">Edit Event</p>';

  fields.forEach(f => {
    const wrap = document.createElement('div');
    wrap.style.marginBottom = '12px';
    const lbl = document.createElement('label');
    lbl.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;color:#666;display:block;margin-bottom:4px';
    lbl.textContent = f.label;
    const inp = document.createElement('input');
    inp.id = f.id; inp.type = f.type; inp.value = f.val;
    inp.style.cssText = 'width:100%;padding:12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:15px;font-family:inherit;box-sizing:border-box';
    wrap.appendChild(lbl); wrap.appendChild(inp);
    inner.appendChild(wrap);
  });

  // Days select
  const daysWrap = document.createElement('div');
  daysWrap.style.marginBottom = '12px';
  daysWrap.innerHTML = '<label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#666;display:block;margin-bottom:4px">Number of Days</label>' +
    '<select id="ie-days" style="width:100%;padding:12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:15px;font-family:inherit">' + daysOpts + '</select>';
  inner.insertBefore(daysWrap, inner.children[4]); // after date

  const err = document.createElement('p');
  err.id = 'ie-err'; err.style.cssText = 'color:#EB001B;font-size:13px;display:none;margin-bottom:0.75rem';
  inner.appendChild(err);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;margin-top:1.25rem';
  btnRow.innerHTML = '<button onclick="saveInlineEdit()" style="flex:1;padding:14px;background:#EB001B;color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Save Changes</button>' +
    '<button onclick="closeInlineEdit()" style="flex:1;padding:14px;background:white;border:1.5px solid #000;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Cancel</button>';
  inner.appendChild(btnRow);

  modal.appendChild(inner);
  document.body.appendChild(modal);
}


function closeInlineEdit() { var m = document.getElementById('inline-edit-modal'); if (m) m.remove(); }

async function saveInlineEdit() {
  const name = document.getElementById('ie-name').value.trim();
  if (!name) { document.getElementById('ie-err').textContent = 'Event name required.'; document.getElementById('ie-err').style.display = 'block'; return; }
  const btn = document.querySelector('#inline-edit-modal button');
  btn.textContent = 'Saving...'; btn.disabled = true;
  const { error } = await db.from('events').update({
    name,
    organizer: document.getElementById('ie-organizer').value.trim() || null,
    event_date: document.getElementById('ie-date').value || null,
    days: parseInt(document.getElementById('ie-days').value) || 1,
    event_code: document.getElementById('ie-code').value.trim() || null,
    signatory_name: document.getElementById('ie-sig-name').value.trim() || null,
    signatory_title: document.getElementById('ie-sig-title').value.trim() || null,
  }).eq('id', eventId);
  if (error) { document.getElementById('ie-err').textContent = 'Error: ' + error.message; document.getElementById('ie-err').style.display = 'block'; btn.textContent = 'Save Changes'; btn.disabled = false; return; }
  document.getElementById('inline-edit-modal').remove();
  init(); // reload page data
}

function importCSV() {
  // Open admin panel and trigger import for this event
  const adminUrl = BASE_URL + 'admin.html?importEvent=' + eventId;
  window.location.href = adminUrl;
}

function copyShareLink(type) {
  let url;
  if (type === 'prereg') url = BASE_URL + 'index.html?event=' + eventId;
  else if (type === 'walkin') url = BASE_URL + 'index.html?event=' + eventId + '&walkin=1';
  else if (type === 'view') url = BASE_URL + 'event.html?event=' + eventId; // no from=admin — public link
  else if (type === 'checkin') url = BASE_URL + 'checkin.html?event=' + eventId;

  const btn = document.getElementById('share-' + type + '-btn');
  const orig = btn ? btn.textContent : '';
  navigator.clipboard.writeText(url).then(() => {
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = orig, 2000); }
  });
}

async function deleteEventFromPage() {
  if (!confirm('Delete this event and all its participants? This cannot be undone.')) return;
  const { error } = await db.from('events').delete().eq('id', eventId);
  if (!error) window.location.href = BASE_URL + 'admin.html';
  else alert('Delete failed: ' + error.message);
}

// ── Participant list toggle ──
function toggleParticipantList() {
  window.location.href = BASE_URL + 'edit-participants.html?event=' + eventId;
}

// ── Check-in QR on Participants page ──
function showEventCheckinQR() {
  const evName = document.getElementById('event-name').textContent;
  document.getElementById('ev-qr-event-name').textContent = evName;
  const url = BASE_URL + 'checkin.html?event=' + eventId;
  const canvas = document.getElementById('ev-checkin-qr-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 220; canvas.height = 220;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,220,220);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => ctx.drawImage(img, 0, 0, 220, 220);
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(url);
  document.getElementById('checkin-qr-modal-ev').style.display = 'flex';
}

function downloadEvCheckinQR() {
  const canvas = document.getElementById('ev-checkin-qr-canvas');
  const evName = document.getElementById('event-name').textContent;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'checkin-qr-' + evName.replace(/\s+/g,'-') + '.png';
  a.click();
}
