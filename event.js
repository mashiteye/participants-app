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
  let html = `<div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Registered</div></div>`;
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
      <th style="width:24%">Name</th>
      <th style="width:7%">Sex</th>
      <th style="width:24%">Organization</th>
      <th style="width:18%">Position</th>
      <th style="width:16%">Type</th>
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

// ── Edit event (password protected) ──
function promptEditEvent() {
  document.getElementById('pwd-input').value = '';
  document.getElementById('pwd-err').style.display = 'none';
  const m = document.getElementById('pwd-modal');
  m.style.display = 'flex';
  setTimeout(() => document.getElementById('pwd-input').focus(), 100);
}

function closePwdModal() {
  document.getElementById('pwd-modal').style.display = 'none';
}

function checkPwd() {
  const pwd = document.getElementById('pwd-input').value;
  if (pwd === 'METSSLBG') {
    closePwdModal();
    openEditModal();
  } else {
    document.getElementById('pwd-err').style.display = 'block';
    document.getElementById('pwd-input').value = '';
  }
}

async function openEditModal() {
  const { data: ev } = await db.from('events').select('*').eq('id', eventId).single();
  if (!ev) return;
  document.getElementById('em-name').value = ev.name || '';
  document.getElementById('em-organizer').value = ev.organizer || '';
  document.getElementById('em-program').value = ev.program || '';
  document.getElementById('em-date').value = ev.event_date || '';
  document.getElementById('em-days').value = String(ev.days || 1);
  document.getElementById('em-mel').value = ev.mel_question || '';
  document.getElementById('em-err').style.display = 'none';
  document.getElementById('edit-modal').style.display = 'block';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveEventEdit() {
  const name = document.getElementById('em-name').value.trim();
  const errEl = document.getElementById('em-err');
  if (!name) { errEl.textContent = 'Event name is required.'; errEl.style.display = 'block'; return; }

  const btn = document.querySelector('#edit-modal .btn-submit');
  btn.textContent = 'Saving...'; btn.disabled = true;

  const { error } = await db.from('events').update({
    name,
    organizer: document.getElementById('em-organizer').value.trim() || null,
    program: document.getElementById('em-program').value.trim() || null,
    event_date: document.getElementById('em-date').value || null,
    days: parseInt(document.getElementById('em-days').value) || 1,
    mel_question: document.getElementById('em-mel').value.trim() || null
  }).eq('id', eventId);

  btn.textContent = 'Save changes'; btn.disabled = false;

  if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; return; }
  closeEditModal();
  // Refresh header
  init();
}

async function exportEventPDF() {
  const btn = [...document.querySelectorAll('.reg-back-btn')].find(b => b.textContent === 'Export PDF');
  if (btn) { btn.textContent = 'Building...'; btn.disabled = true; }
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const MARGIN = 30;

    const evName = document.getElementById('event-name').textContent;
    const evMeta = document.getElementById('event-meta').textContent;

    // Header
    doc.setFillColor(235, 0, 27);   doc.rect(0, 0, pageW * 0.4, 50, 'F');
    doc.setFillColor(243, 112, 33); doc.rect(pageW * 0.4, 0, pageW * 0.4, 50, 'F');
    doc.setFillColor(247, 158, 27); doc.rect(pageW * 0.8, 0, pageW * 0.2, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text(evName, MARGIN, 22);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(evMeta + '  ·  ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }), MARGIN, 36);
    doc.text('Total registered: ' + allParticipants.length, MARGIN, 47);

    const head = [['#','Code','Name','Sex','Organization','Position','Program','Type']];
    const body = allParticipants.map((p, i) => [
      String(i + 1),
      p.code || '—',
      p.name || '',
      p.sex || '—',
      p.org || '',
      p.position_title || '',
      p.prog || '',
      p.reg_type === 'Walk-in' ? 'Walk-in' : 'Pre-reg'
    ]);

    doc.autoTable({
      head,
      body,
      startY: 58,
      margin: { left: MARGIN, right: MARGIN },
      styles: { fontSize: 8, cellPadding: 4, overflow: 'ellipsize' },
      headStyles: { fillColor: [26, 26, 26], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [250, 250, 248] },
      columnStyles: {
        0: { cellWidth: 20 }, 1: { cellWidth: 45 }, 2: { cellWidth: 110 },
        3: { cellWidth: 30 }, 4: { cellWidth: 110 }, 5: { cellWidth: 90 },
        6: { cellWidth: 90 }, 7: { cellWidth: 45 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.textColor = [243, 112, 33];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.section === 'body' && data.column.index === 7) {
          const p = allParticipants[data.row.index];
          data.cell.styles.textColor = p?.reg_type === 'Walk-in' ? [243, 112, 33] : [0, 92, 42];
        }
      }
    });

    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(160, 160, 160);
      doc.text('Page ' + i + ' of ' + pages + '  ·  ' + evName + '  ·  METSS LBG Participants App', MARGIN, pageH - 14);
    }

    doc.save('participants-' + evName.replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0,10) + '.pdf');
  } catch(e) {
    alert('PDF export failed: ' + e.message);
  } finally {
    if (btn) { btn.textContent = 'Export PDF'; btn.disabled = false; }
  }
}
