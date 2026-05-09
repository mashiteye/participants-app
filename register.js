const SUPABASE_URL = 'https://cpqhljqwxjgscdoepant.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcWhsanF3eGpnc2Nkb2VwYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTM1NTcsImV4cCI6MjA5Mzc4OTU1N30.XATDTbvL7iDrsn-Si0crJWZebw5FSx0weWRmmcL2Z7c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
const returnUrl = decodeURIComponent(params.get('return') || '') || 'event.html?event=' + eventId;
const BASE_URL = window.location.origin + window.location.pathname.replace('register.html', '');

let eventData = null;
let allParticipants = [];
let attendanceMap = {};
let selectedParticipant = null;
let selectedDay = null;
let selectedSex = null;
let activeTab = 'code';
let sigs = {};
let drawing = {};

async function init() {
  if (!eventId) return;
  const { data: ev } = await db.from('events').select('*').eq('id', eventId).single();
  if (!ev) return;
  eventData = ev;

  document.getElementById('header-event-name').textContent = ev.name;
  const dateStr = ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '';
  document.getElementById('header-meta').textContent = [dateStr, (ev.days||1) > 1 ? ev.days + ' days' : '1 day'].filter(Boolean).join(' · ');

  await loadData();
  buildDayButtons('sign-day-row');
  buildDayButtons('new-day-row');
  buildStatsDays();
  updateStats();
  initSig('sign-canvas', 'sign');
  initSig('new-canvas', 'new');
  showScreen('find');
  setTimeout(() => { const i = document.getElementById('code-input'); if(i) i.focus(); }, 400);
}

async function loadData() {
  const [pr, ar] = await Promise.all([
    db.from('participants').select('*').eq('event_id', eventId).order('created_at', { ascending: true }),
    db.from('attendance').select('*').eq('event_id', eventId)
  ]);
  allParticipants = pr.data || [];
  attendanceMap = {};
  (ar.data || []).forEach(a => {
    if (!attendanceMap[a.participant_id]) attendanceMap[a.participant_id] = {};
    attendanceMap[a.participant_id][a.day] = a;
  });
  updateStats();
}

function buildStatsDays() {
  const days = eventData.days || 1;
  const container = document.getElementById('stat-days-boxes');
  container.style.display = 'contents';
  container.innerHTML = '';
  for (let i = 1; i <= days; i++) {
    const d = 'Day ' + i;
    const box = document.createElement('div');
    box.className = 'stat-box';
    box.id = 'stat-day-' + i;
    box.innerHTML = '<div class="stat-num orange" id="stat-day-num-' + i + '">0</div><div class="stat-label">' + d + '</div>';
    container.appendChild(box);
  }
}

function updateStats() {
  const days = eventData ? eventData.days || 1 : 1;
  document.getElementById('stat-registered').textContent = allParticipants.length;
  const female = allParticipants.filter(p => (p.sex||'').toLowerCase() === 'female').length;
  document.getElementById('stat-female').textContent = female;
  for (let i = 1; i <= days; i++) {
    const d = 'Day ' + i;
    const count = Object.values(attendanceMap).filter(a => a[d]).length;
    const el = document.getElementById('stat-day-num-' + i);
    if (el) el.textContent = count;
  }
}

function buildDayButtons(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const days = eventData.days || 1;
  for (let i = 1; i <= days; i++) {
    const label = 'Day ' + i;
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    btn.textContent = label;
    btn.dataset.day = label;
    btn.onclick = () => {
      selectedDay = label;
      container.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (containerId === 'sign-day-row' && selectedParticipant) {
        const att = attendanceMap[selectedParticipant.id] || {};
        if (att[label]) {
          document.getElementById('sign-err').textContent = label + ' already signed ✓';
          document.getElementById('sign-err').style.display = 'block';
        } else {
          document.getElementById('sign-err').style.display = 'none';
        }
      }
    };
    container.appendChild(btn);
  }
}

function markSignedDays(containerId, participantId) {
  const att = attendanceMap[participantId] || {};
  document.querySelectorAll('#' + containerId + ' .day-btn').forEach(btn => {
    if (att[btn.dataset.day]) {
      btn.classList.add('done');
      btn.textContent = btn.dataset.day + ' ✓';
      btn.classList.remove('active');
    }
  });
}

// ── Signature ──
function initSig(canvasId, key) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth || 360;
  canvas.height = 150;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  sigs[key] = { canvas, ctx };
  drawing[key] = false;

  const pos = e => {
    const r = canvas.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: (s.clientX - r.left) * (canvas.width / r.width), y: (s.clientY - r.top) * (canvas.height / r.height) };
  };
  const start = e => { e.preventDefault(); drawing[key] = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); document.getElementById(key + '-hint').style.display = 'none'; };
  const move  = e => { e.preventDefault(); if (!drawing[key]) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const stop  = () => drawing[key] = false;
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('mouseleave', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', stop);
}

function clearSig(key) {
  const { canvas, ctx } = sigs[key];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById(key + '-hint').style.display = 'block';
}

function isSigEmpty(key) {
  const { canvas, ctx } = sigs[key];
  return !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(v => v !== 0);
}

// ── Screens ──
function showScreen(name) {
  ['find','sign','new','success'].forEach(s => {
    const el = document.getElementById('screen-' + s);
    if (el) el.style.display = s === name ? 'block' : 'none';
  });
  window.scrollTo(0, 0);
}

function showFind() {
  document.getElementById('stats-row').style.display = 'flex';
  selectedParticipant = null; selectedDay = null;
  document.getElementById('code-input').value = '';
  document.getElementById('name-input').value = '';
  document.getElementById('name-results').innerHTML = '';
  document.getElementById('find-err').style.display = 'none';
  clearSig('sign'); clearSig('new');
  buildDayButtons('sign-day-row');
  buildDayButtons('new-day-row');
  showScreen('find');
  loadData();
  setTimeout(() => { const i = document.getElementById(activeTab === 'code' ? 'code-input' : 'name-input'); if(i) i.focus(); }, 200);
}

function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-code').classList.toggle('active', tab === 'code');
  document.getElementById('tab-name').classList.toggle('active', tab === 'name');
  document.getElementById('find-by-code').style.display = tab === 'code' ? 'block' : 'none';
  document.getElementById('find-by-name').style.display = tab === 'name' ? 'block' : 'none';
  document.getElementById('find-err').style.display = 'none';
  setTimeout(() => document.getElementById(tab === 'code' ? 'code-input' : 'name-input').focus(), 100);
}

function exitRegistration() {
  window.location.href = BASE_URL + returnUrl + (returnUrl.includes('?') ? '&' : '?') + 'from=admin';
}

// ── Find ──
async function findByCode() {
  const raw = document.getElementById('code-input').value.trim().toUpperCase();
  if (!raw) return;
  const rawNorm = raw.replace(/[\s\-().+]/g, '').replace(/^233/, '0');
  // Match by code OR phone number
  const p = allParticipants.find(x => {
    const c = (x.code || '').toUpperCase();
    const phone = (x.phone || '').replace(/[\s\-().+]/g, '').replace(/^233/, '0');
    return c === raw ||
      c.endsWith('-' + raw) ||
      c.endsWith('-' + raw.replace(/^0+/, '')) ||
      (rawNorm.length >= 7 && phone === rawNorm);
  });
  if (!p) {
    document.getElementById('find-err').textContent = 'No participant found with code or phone "' + raw + '"';
    document.getElementById('find-err').style.display = 'block';
    return;
  }
  document.getElementById('find-err').style.display = 'none';
  openSignScreen(p);
}

function findByName() {
  const q = document.getElementById('name-input').value.trim().toLowerCase();
  if (!q) return;
  const results = allParticipants.filter(p =>
    (p.name||'').toLowerCase().includes(q) ||
    (p.org||'').toLowerCase().includes(q) ||
    (p.prog||'').toLowerCase().includes(q)
  ).slice(0, 10);
  const container = document.getElementById('name-results');
  if (!results.length) {
    container.innerHTML = '<p style="color:#aaa;font-size:13px;text-align:center;padding:10px 0">No results. Use New Participant below.</p>';
    return;
  }
  container.innerHTML = results.map(p =>
    '<div class="result-item" onclick="selectResult(\'' + p.id + '\')">' +
      '<div class="result-name">' + esc(p.name) + '</div>' +
      '<div class="result-meta">' + esc(p.code||'') + ' · ' + esc(p.org||'') + '</div>' +
    '</div>'
  ).join('');
}

function selectResult(id) {
  const p = allParticipants.find(x => x.id === id);
  if (p) openSignScreen(p);
}

function openSignScreen(p) {
  selectedParticipant = p;
  document.getElementById('sign-code').textContent = p.code || '';
  document.getElementById('sign-name').textContent = p.name || '';
  document.getElementById('sign-org').textContent = p.org || '';
  document.getElementById('sign-pos').textContent = p.position_title || '';
  buildDayButtons('sign-day-row');
  markSignedDays('sign-day-row', p.id);
  // Auto-select first unsigned day
  const days = Array.from({ length: eventData.days || 1 }, (_, i) => 'Day ' + (i + 1));
  const att = attendanceMap[p.id] || {};
  const firstUnsigned = days.find(d => !att[d]);
  if (firstUnsigned) {
    selectedDay = firstUnsigned;
    document.querySelector('#sign-day-row [data-day="' + firstUnsigned + '"]')?.classList.add('active');
  }
  clearSig('sign');
  document.getElementById('sign-err').style.display = 'none';
  showScreen('sign');
}

// ── Confirm attendance ──
async function confirmAttendance() {
  const errEl = document.getElementById('sign-err');
  if (!selectedDay) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  const att = attendanceMap[selectedParticipant.id] || {};
  if (att[selectedDay]) { errEl.textContent = selectedDay + ' already signed.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty('sign')) { errEl.textContent = 'Please sign before confirming.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('btn-confirm');
  btn.textContent = 'Saving...'; btn.disabled = true;
  try {
    const { canvas } = sigs['sign'];
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const path = eventId + '/' + selectedParticipant.id + '/' + selectedDay.replace(' ','_') + '_' + Date.now() + '.png';
    const { error: upErr } = await db.storage.from('signatures').upload(path, blob, { contentType: 'image/png' });
    if (upErr) throw new Error(upErr.message);
    const { data: { publicUrl } } = db.storage.from('signatures').getPublicUrl(path);
    const { error } = await db.from('attendance').insert([{ participant_id: selectedParticipant.id, event_id: eventId, day: selectedDay, signature_url: publicUrl }]);
    if (error) throw new Error(error.message);
    document.getElementById('success-name').textContent = selectedParticipant.name;
    document.getElementById('success-day').textContent = 'Attendance recorded for ' + selectedDay;
    showScreen('success');
  } catch(e) {
    errEl.textContent = 'Error: ' + e.message; errEl.style.display = 'block';
  } finally {
    btn.textContent = 'Confirm Attendance'; btn.disabled = false;
  }
}

// ── New registration ──
function showNewRegistration() {
  document.getElementById('stats-row').style.display = 'none';
  selectedDay = null; selectedSex = null;
  ['new-name','new-org','new-prog','new-position','new-email','new-phone'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  document.getElementById('sex-male').classList.remove('active');
  document.getElementById('sex-female').classList.remove('active');
  buildDayButtons('new-day-row');
  clearSig('new');
  document.getElementById('new-err').style.display = 'none';
  showScreen('new');
  setTimeout(() => document.getElementById('new-name').focus(), 200);
}

function setSex(sex) {
  selectedSex = sex;
  document.getElementById('sex-male').classList.toggle('active', sex === 'Male');
  document.getElementById('sex-female').classList.toggle('active', sex === 'Female');
}

async function submitNew() {
  const errEl = document.getElementById('new-err');
  errEl.style.display = 'none';
  const name = document.getElementById('new-name').value.trim();
  const org  = document.getElementById('new-org').value.trim();
  const prog = document.getElementById('new-prog').value.trim();
  const pos  = document.getElementById('new-position').value.trim();
  const email = document.getElementById('new-email').value.trim();
  const phone = document.getElementById('new-phone').value.trim();

  if (!name) { errEl.textContent = 'Full name required.'; errEl.style.display = 'block'; return; }
  if (!selectedSex) { errEl.textContent = 'Please select sex.'; errEl.style.display = 'block'; return; }
  if (!org) { errEl.textContent = 'Organisation required.'; errEl.style.display = 'block'; return; }
  if (!prog) { errEl.textContent = 'Program required.'; errEl.style.display = 'block'; return; }
  if (!pos) { errEl.textContent = 'Position required.'; errEl.style.display = 'block'; return; }
  if (!selectedDay) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty('new')) { errEl.textContent = 'Please sign.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('btn-submit-new');
  btn.textContent = 'Saving...'; btn.disabled = true;
  try {
    const nums = allParticipants.map(p => { const m = (p.code||'').match(/(\d+)$/); return m ? parseInt(m[1]) : 0; });
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    const prefix = eventData.event_code || 'P';
    const code = prefix + '-' + String(next).padStart(3, '0');

    const { data: ins, error } = await db.from('participants').insert([{
      name, sex: selectedSex, org, prog, position_title: pos,
      email: email || null, phone: phone || null,
      reg_type: 'Walk-in', event_id: eventId, code, day_attended: selectedDay
    }]).select().single();
    if (error) throw new Error(error.message);

    // Upload signature
    const { canvas } = sigs['new'];
    const b64 = canvas.toDataURL('image/png').split(',')[1];
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const sigBlob = new Blob([bytes], { type: 'image/png' });
    const path = eventId + '/' + ins.id + '/' + selectedDay.replace(' ','_') + '_' + Date.now() + '.png';
    const { error: upErr } = await db.storage.from('signatures').upload(path, sigBlob, { contentType: 'image/png' });
    if (!upErr) {
      const { data: { publicUrl } } = db.storage.from('signatures').getPublicUrl(path);
      await db.from('attendance').insert([{ participant_id: ins.id, event_id: eventId, day: selectedDay, signature_url: publicUrl }]);
    }
    allParticipants.push(ins);
    document.getElementById('success-name').textContent = name;
    document.getElementById('success-day').textContent = 'Registered and signed for ' + selectedDay;
    showScreen('success');
  } catch(e) {
    errEl.textContent = 'Error: ' + e.message; errEl.style.display = 'block';
  } finally {
    btn.textContent = 'Submit & Sign'; btn.disabled = false;
  }
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

init();
