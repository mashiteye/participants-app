const SUPABASE_URL = 'https://cpqhljqwxjgscdoepant.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcWhsanF3eGpnc2Nkb2VwYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTM1NTcsImV4cCI6MjA5Mzc4OTU1N30.XATDTbvL7iDrsn-Si0crJWZebw5FSx0weWRmmcL2Z7c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
const BASE_URL = window.location.origin + window.location.pathname.replace('checkin.html', '');

let eventData = null;
let foundParticipant = null;
let existingAttendance = {};
let sigCanvas, sigCtx, drawing = false;

async function init() {
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data: ev, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !ev) { document.getElementById('no-event').style.display = 'block'; return; }

  eventData = ev;
  document.getElementById('event-ui').style.display = 'block';
  document.getElementById('event-name').textContent = ev.name;
  const prog = (ev.program && ev.program !== 'Other') ? ev.program : null;
  document.getElementById('event-code-prog').textContent = [ev.event_code, prog].filter(Boolean).join(' · ') || 'Attendance Check-in';
  document.getElementById('event-meta').textContent = [
    ev.organizer,
    ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null
  ].filter(Boolean).join(' · ');
  document.title = ev.name + ' — Check In';

  setTimeout(() => document.getElementById('code-input').focus(), 300);
}

async function findParticipant() {
  const code = document.getElementById('code-input').value.trim().toUpperCase();
  document.getElementById('not-found-msg').style.display = 'none';

  if (!code) {
    document.getElementById('not-found-detail').textContent = 'Please enter your participant code.';
    document.getElementById('not-found-msg').style.display = 'block';
    return;
  }

  const btn = document.getElementById('find-btn');
  btn.textContent = 'Searching...'; btn.disabled = true;

  const { data, error } = await db.from('participants')
    .select('*').eq('event_id', eventId).ilike('code', code).single();

  btn.textContent = 'Find Me'; btn.disabled = false;

  if (error || !data) {
    document.getElementById('not-found-detail').textContent =
      'No participant found with code "' + code + '". Check your code and try again.';
    document.getElementById('not-found-msg').style.display = 'block';
    document.getElementById('code-input').select();
    return;
  }

  foundParticipant = data;

  // Fetch existing attendance
  const { data: att } = await db.from('attendance')
    .select('*').eq('participant_id', data.id).eq('event_id', eventId);
  existingAttendance = {};
  (att || []).forEach(a => { existingAttendance[a.day] = a; });

  // Show participant card
  document.getElementById('found-name').textContent = data.name;
  document.getElementById('found-details').textContent = [data.position_title, data.org].filter(Boolean).join(' · ');
  document.getElementById('found-code').textContent = data.code || '';

  // Build day buttons
  const days = eventData.days || 1;
  if (days > 1) {
    const container = document.getElementById('found-day-buttons');
    container.innerHTML = '';
    for (let i = 1; i <= days; i++) {
      const label = 'Day ' + i;
      const btn = document.createElement('button');
      btn.className = 'toggle-btn';
      btn.textContent = label;
      if (existingAttendance[label]) {
        btn.style.opacity = '0.5';
        btn.title = 'Already signed';
      }
      btn.onclick = () => setFoundDay(label);
      container.appendChild(btn);
    }
    document.getElementById('found-day-group').style.display = 'block';
  } else {
    document.getElementById('found-day').value = 'Day 1';
  }

  // Init signature
  initFoundSig();

  document.getElementById('code-entry').style.display = 'none';
  document.getElementById('participant-found').style.display = 'block';
}

function setFoundDay(day) {
  document.getElementById('found-day').value = day;
  document.querySelectorAll('#found-day-buttons .toggle-btn').forEach(b =>
    b.classList.toggle('active', b.textContent === day));
}

function initFoundSig() {
  sigCanvas = document.getElementById('found-sig-canvas');
  sigCtx = sigCanvas.getContext('2d');
  sigCanvas.width = sigCanvas.parentElement.offsetWidth || 320;
  sigCanvas.height = 130;
  sigCtx.strokeStyle = '#000000';
  sigCtx.lineWidth = 2;
  sigCtx.lineCap = 'round';

  const getPos = e => {
    const r = sigCanvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };
  const start = e => { drawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); hideSigHint(); };
  const move  = e => { if (!drawing) return; const p = getPos(e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); };
  const stop  = () => drawing = false;
  sigCanvas.addEventListener('mousedown', start);
  sigCanvas.addEventListener('mousemove', move);
  sigCanvas.addEventListener('mouseup', stop);
  sigCanvas.addEventListener('mouseleave', stop);
  sigCanvas.addEventListener('touchstart', e => { e.preventDefault(); start(e); }, { passive: false });
  sigCanvas.addEventListener('touchmove',  e => { e.preventDefault(); move(e);  }, { passive: false });
  sigCanvas.addEventListener('touchend', stop);
}

function hideSigHint() { const h = document.querySelector('.sig-hint'); if (h) h.style.display = 'none'; }
function clearFoundSig() {
  if (!sigCtx) return;
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  const h = document.querySelector('.sig-hint'); if (h) h.style.display = 'block';
}
function isSigEmpty() {
  if (!sigCtx) return true;
  return !sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height).data.some(v => v !== 0);
}

async function submitFoundAttendance() {
  const errEl = document.getElementById('found-err');
  errEl.style.display = 'none';
  const day = document.getElementById('found-day').value;
  if (!day) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty()) { errEl.textContent = 'Please sign before submitting.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('sign-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;

  try {
    // Upload signature
    const blob = await new Promise(resolve => sigCanvas.toBlob(resolve, 'image/png'));
    const path = eventId + '/' + foundParticipant.id + '/' + day.replace(' ','_') + '_' + Date.now() + '.png';
    const { error: upErr } = await db.storage.from('signatures').upload(path, blob, { contentType: 'image/png' });

    if (upErr) { errEl.textContent = 'Upload failed: ' + upErr.message; errEl.style.display = 'block'; btn.textContent = 'Sign Attendance'; btn.disabled = false; return; }

    const { data: { publicUrl } } = db.storage.from('signatures').getPublicUrl(path);

    // Upsert attendance (update if same day, insert if new)
    const existing = existingAttendance[day];
    if (existing) {
      await db.from('attendance').update({ signature_url: publicUrl, signed_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await db.from('attendance').insert([{ participant_id: foundParticipant.id, event_id: eventId, day, signature_url: publicUrl }]);
    }

    // Show success
    document.getElementById('success-name').textContent = foundParticipant.name;
    document.getElementById('success-day').textContent = day;
    document.getElementById('participant-found').style.display = 'none';
    document.getElementById('checkin-success').style.display = 'block';

  } catch(e) {
    errEl.textContent = 'Error: ' + e.message;
    errEl.style.display = 'block';
    btn.textContent = 'Sign Attendance'; btn.disabled = false;
  }
}

function resetCheckin() {
  foundParticipant = null;
  existingAttendance = {};
  document.getElementById('code-input').value = '';
  document.getElementById('not-found-msg').style.display = 'none';
  document.getElementById('found-err').style.display = 'none';
  document.getElementById('participant-found').style.display = 'none';
  document.getElementById('checkin-success').style.display = 'none';
  document.getElementById('code-entry').style.display = 'block';
  setTimeout(() => document.getElementById('code-input').focus(), 100);
}

function openWalkin() {
  window.open(BASE_URL + 'index.html?event=' + eventId + '&walkin=1', '_blank');
}

init();
