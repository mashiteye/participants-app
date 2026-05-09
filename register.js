const SUPABASE_URL = 'https://cpqhljqwxjgscdoepant.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcWhsanF3eGpnc2Nkb2VwYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTM1NTcsImV4cCI6MjA5Mzc4OTU1N30.XATDTbvL7iDrsn-Si0crJWZebw5FSx0weWRmmcL2Z7c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
const returnUrl = params.get('return') || document.referrer || 'event.html?event=' + eventId;
const BASE_URL = window.location.origin + window.location.pathname.replace('register.html', '');

let eventData = null;
let allParticipants = [];
let attendanceMap = {}; // participantId -> { day: attendanceRecord }
let selectedParticipant = null;
let selectedDay = null;
let selectedSex = null;
let activeTab = 'code';
let sigCanvases = {};
let sigDrawing = {};

async function init() {
  if (!eventId) { showScreen('loading'); document.getElementById('screen-loading').textContent = 'No event specified.'; return; }

  const { data: ev } = await db.from('events').select('*').eq('id', eventId).single();
  if (!ev) { document.getElementById('screen-loading').textContent = 'Event not found.'; return; }

  eventData = ev;
  document.getElementById('reg-event-name').textContent = ev.name;
  document.title = ev.name + ' — Registration';
  const dateStr = ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '';
  document.getElementById('reg-event-meta').textContent = [dateStr, (ev.days||1) > 1 ? ev.days + ' days' : '1 day'].filter(Boolean).join(' · ');

  await loadData();
  buildDayButtons('sign-day-group');
  buildDayButtons('new-day-group');
  initSig('sign-canvas', 'sign');
  initSig('new-canvas', 'new');
  showScreen('find');
  setTimeout(() => document.getElementById('code-input').focus(), 300);
}

async function loadData() {
  const [partsRes, attRes] = await Promise.all([
    db.from('participants').select('*').eq('event_id', eventId).order('code', { ascending: true }),
    db.from('attendance').select('*').eq('event_id', eventId)
  ]);
  allParticipants = partsRes.data || [];
  attendanceMap = {};
  (attRes.data || []).forEach(a => {
    if (!attendanceMap[a.participant_id]) attendanceMap[a.participant_id] = {};
    attendanceMap[a.participant_id][a.day] = a;
  });
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
    btn.onclick = () => selectDay(containerId, label);
    container.appendChild(btn);
  }
}

function selectDay(containerId, day) {
  selectedDay = day;
  document.querySelectorAll('#' + containerId + ' .day-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.day === day);
  });
  // If participant already signed this day, show indicator
  if (containerId === 'sign-day-group' && selectedParticipant) {
    const att = attendanceMap[selectedParticipant.id] || {};
    document.querySelectorAll('#sign-day-group .day-btn').forEach(b => {
      if (att[b.dataset.day]) {
        b.classList.add('signed');
        b.textContent = b.dataset.day + ' ✓';
      }
    });
    if (att[day]) {
      document.getElementById('sign-err').textContent = 'Already signed for ' + day + '. Select another day.';
      document.getElementById('sign-err').style.display = 'block';
    } else {
      document.getElementById('sign-err').style.display = 'none';
    }
  }
}

// ── Signature ──
function initSig(canvasId, key) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.offsetWidth || 400;
  canvas.height = 140;
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  sigCanvases[key] = { canvas, ctx };
  sigDrawing[key] = false;

  const getPos = e => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * (canvas.width / r.width), y: (src.clientY - r.top) * (canvas.height / r.height) };
  };
  const start = e => { e.preventDefault(); sigDrawing[key] = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); hideHint(key); };
  const move  = e => { e.preventDefault(); if (!sigDrawing[key]) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const stop  = () => sigDrawing[key] = false;
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('mouseleave', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', stop);
}

function hideHint(key) {
  const hint = document.getElementById(key + '-hint');
  if (hint) hint.style.display = 'none';
}

function clearSig(key) {
  const { canvas, ctx } = sigCanvases[key];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const hint = document.getElementById(key + '-hint');
  if (hint) hint.style.display = 'block';
}

function isSigEmpty(key) {
  const { canvas, ctx } = sigCanvases[key];
  return !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(v => v !== 0);
}

// ── Navigation ──
function showScreen(name) {
  ['loading','find','sign','new','success'].forEach(s => {
    const el = document.getElementById('screen-' + s);
    if (el) el.style.display = s === name ? 'block' : 'none';
  });
}

function showFind() {
  selectedParticipant = null; selectedDay = null;
  document.getElementById('code-input').value = '';
  document.getElementById('name-input').value = '';
  document.getElementById('name-results').innerHTML = '';
  document.getElementById('find-err').style.display = 'none';
  clearSig('sign'); clearSig('new');
  showScreen('find');
  loadData(); // refresh attendance
  if (activeTab === 'code') setTimeout(() => document.getElementById('code-input').focus(), 100);
}

function showFind_keep() { showFind(); }

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
  window.location.href = returnUrl + '&from=admin';
}

// ── Find ──
async function findByCode() {
  const code = document.getElementById('code-input').value.trim().toUpperCase();
  if (!code) return;
  const p = allParticipants.find(x => (x.code || '').toUpperCase() === code || (x.code || '').toUpperCase().endsWith('-' + code.replace(/^0+/,'')));
  if (!p) {
    document.getElementById('find-err').textContent = 'No participant found with code "' + code + '"';
    document.getElementById('find-err').style.display = 'block';
    return;
  }
  document.getElementById('find-err').style.display = 'none';
  showSignScreen(p);
}

async function findByName() {
  const q = document.getElementById('name-input').value.trim().toLowerCase();
  if (!q) return;
  const results = allParticipants.filter(p =>
    (p.name || '').toLowerCase().includes(q) || (p.org || '').toLowerCase().includes(q)
  );
  const container = document.getElementById('name-results');
  if (!results.length) {
    container.innerHTML = '<p style="color:#aaa;font-size:13px;text-align:center;padding:8px">No results found</p>';
    return;
  }
  container.innerHTML = results.slice(0, 8).map(p => `
    <div class="result-item" onclick="selectFromResults('${p.id}')">
      <strong>${esc(p.name)}</strong>
      <span>${esc(p.code || '')} · ${esc(p.org || '')}</span>
    </div>
  `).join('');
}

function selectFromResults(id) {
  const p = allParticipants.find(x => x.id === id);
  if (p) showSignScreen(p);
}

function showSignScreen(p) {
  selectedParticipant = p;
  document.getElementById('sign-code').textContent = p.code || '';
  document.getElementById('sign-name').textContent = p.name;
  document.getElementById('sign-detail').textContent = [p.position_title, p.org].filter(Boolean).join(' · ');

  // Reset day buttons, mark already signed days
  buildDayButtons('sign-day-group');
  const att = attendanceMap[p.id] || {};
  document.querySelectorAll('#sign-day-group .day-btn').forEach(b => {
    if (att[b.dataset.day]) {
      b.classList.add('signed');
      b.textContent = b.dataset.day + ' ✓';
    }
  });

  // Auto-select first unsigned day
  const days = Array.from({ length: eventData.days || 1 }, (_, i) => 'Day ' + (i + 1));
  const firstUnsigned = days.find(d => !att[d]);
  if (firstUnsigned) selectDay('sign-day-group', firstUnsigned);

  clearSig('sign');
  document.getElementById('sign-err').style.display = 'none';
  showScreen('sign');
}

function showNewRegistration() {
  selectedDay = null;
  buildDayButtons('new-day-group');
  clearSig('new');
  ['new-name','new-org','new-prog','new-position','new-email','new-phone'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  setSex(null);
  document.getElementById('new-err').style.display = 'none';
  showScreen('new');
  setTimeout(() => document.getElementById('new-name').focus(), 200);
}

function setSex(sex) {
  selectedSex = sex;
  document.getElementById('sex-male').classList.toggle('active', sex === 'Male');
  document.getElementById('sex-female').classList.toggle('active', sex === 'Female');
}

// ── Confirm attendance (existing participant) ──
async function confirmAttendance() {
  const errEl = document.getElementById('sign-err');
  errEl.style.display = 'none';
  if (!selectedDay) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty('sign')) { errEl.textContent = 'Please sign before confirming.'; errEl.style.display = 'block'; return; }

  const att = attendanceMap[selectedParticipant.id] || {};
  if (att[selectedDay]) { errEl.textContent = 'Already signed for ' + selectedDay; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('btn-confirm');
  btn.textContent = 'Saving...'; btn.disabled = true;

  try {
    const { canvas } = sigCanvases['sign'];
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const path = eventId + '/' + selectedParticipant.id + '/' + selectedDay.replace(' ','_') + '_' + Date.now() + '.png';
    const { error: upErr } = await db.storage.from('signatures').upload(path, blob, { contentType: 'image/png' });
    if (upErr) throw new Error(upErr.message);
    const { data: { publicUrl } } = db.storage.from('signatures').getPublicUrl(path);
    await db.from('attendance').insert([{ participant_id: selectedParticipant.id, event_id: eventId, day: selectedDay, signature_url: publicUrl }]);
    showSuccessScreen(selectedParticipant.name, selectedDay);
  } catch(e) {
    errEl.textContent = 'Error: ' + e.message; errEl.style.display = 'block';
  } finally {
    btn.textContent = 'Confirm Attendance'; btn.disabled = false;
  }
}

// ── Submit new registration ──
async function submitNew() {
  const errEl = document.getElementById('new-err');
  errEl.style.display = 'none';
  const name = document.getElementById('new-name').value.trim();
  const org  = document.getElementById('new-org').value.trim();
  const prog = document.getElementById('new-prog').value.trim();
  const pos  = document.getElementById('new-position').value.trim();
  const email = document.getElementById('new-email').value.trim();
  const phone = document.getElementById('new-phone').value.trim();

  if (!name) { errEl.textContent = 'Full name is required.'; errEl.style.display = 'block'; return; }
  if (!selectedSex) { errEl.textContent = 'Please select sex.'; errEl.style.display = 'block'; return; }
  if (!org) { errEl.textContent = 'Organisation is required.'; errEl.style.display = 'block'; return; }
  if (!prog) { errEl.textContent = 'Program is required.'; errEl.style.display = 'block'; return; }
  if (!pos) { errEl.textContent = 'Position is required.'; errEl.style.display = 'block'; return; }
  if (!selectedDay) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty('new')) { errEl.textContent = 'Please sign.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('btn-submit-new');
  btn.textContent = 'Saving...'; btn.disabled = true;

  try {
    // Generate code
    const nums = allParticipants.map(p => { const m = (p.code||'').match(/(\d+)$/); return m ? parseInt(m[1]) : 0; });
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const prefix = eventData.event_code || 'P';
    const code = prefix + '-' + String(nextNum).padStart(3, '0');

    const { data: inserted, error } = await db.from('participants').insert([{
      name, sex: selectedSex, org, prog, position_title: pos,
      email: email || null, phone: phone || null,
      reg_type: 'Walk-in', event_id: eventId, code, day_attended: selectedDay
    }]).select().single();
    if (error) throw new Error(error.message);

    // Upload signature and create attendance
    const { canvas } = sigCanvases['new'];
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const base64 = canvas.toDataURL('image/png').split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const sigBlob = new Blob([bytes], { type: 'image/png' });
    const path = eventId + '/' + inserted.id + '/' + selectedDay.replace(' ','_') + '_' + Date.now() + '.png';
    const { error: upErr } = await db.storage.from('signatures').upload(path, sigBlob, { contentType: 'image/png' });
    if (!upErr) {
      const { data: { publicUrl } } = db.storage.from('signatures').getPublicUrl(path);
      await db.from('attendance').insert([{ participant_id: inserted.id, event_id: eventId, day: selectedDay, signature_url: publicUrl }]);
    }

    allParticipants.push(inserted);
    showSuccessScreen(name, selectedDay);
  } catch(e) {
    errEl.textContent = 'Error: ' + e.message; errEl.style.display = 'block';
  } finally {
    btn.textContent = 'Submit & Sign'; btn.disabled = false;
  }
}

function showSuccessScreen(name, day) {
  document.getElementById('success-name').textContent = name;
  document.getElementById('success-day').textContent = 'Signed for ' + day;
  showScreen('success');
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

init();
