const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
let eventPrefix = 'P';
let sigCanvas, sigCtx, drawing = false;

async function init() {
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !data) { document.getElementById('no-event').style.display = 'block'; return; }

  // Derive prefix from program name e.g. AYAW → AYW, MEL CoP → MEL
  if (data.program) {
    eventPrefix = data.program.replace(/[^A-Z]/g, '').slice(0, 3) || 'P';
  }

  document.getElementById('event-ui').style.display = 'block';
  document.getElementById('event-name').textContent = data.name;
  document.getElementById('event-program').textContent = data.program || 'Participant Registration';
  document.title = data.name;

  if (data.mel_question) {
    document.getElementById('mel-question-group').style.display = 'block';
    document.getElementById('mel-question-label').textContent = data.mel_question;
  }

  const days = data.days || 1;
  if (days > 1) {
    const container = document.getElementById('day-buttons');
    for (let i = 1; i <= days; i++) {
      const btn = document.createElement('button');
      btn.className = 'toggle-btn';
      btn.textContent = 'Day ' + i;
      btn.onclick = () => setDay('Day ' + i);
      container.appendChild(btn);
    }
    document.getElementById('day-group').style.display = 'block';
  } else {
    document.getElementById('f-day').value = 'Day 1';
  }

  initSignature();
}

function initSignature() {
  sigCanvas = document.getElementById('sig-canvas');
  sigCtx = sigCanvas.getContext('2d');
  sigCanvas.width = sigCanvas.offsetWidth;
  sigCanvas.height = sigCanvas.offsetHeight;
  sigCtx.strokeStyle = '#1a1a1a';
  sigCtx.lineWidth = 2;
  sigCtx.lineCap = 'round';

  const getPos = (e) => {
    const r = sigCanvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  sigCanvas.addEventListener('mousedown', e => { drawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); hideSigHint(); });
  sigCanvas.addEventListener('mousemove', e => { if (!drawing) return; const p = getPos(e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); });
  sigCanvas.addEventListener('mouseup', () => drawing = false);
  sigCanvas.addEventListener('mouseleave', () => drawing = false);
  sigCanvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); hideSigHint(); }, { passive: false });
  sigCanvas.addEventListener('touchmove', e => { e.preventDefault(); if (!drawing) return; const p = getPos(e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); }, { passive: false });
  sigCanvas.addEventListener('touchend', () => drawing = false);
}

function hideSigHint() { document.querySelector('.sig-hint').style.display = 'none'; }

function clearSig() {
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  document.querySelector('.sig-hint').style.display = 'block';
}

function isSigEmpty() {
  return !sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height).data.some(v => v !== 0);
}

function setSex(val) {
  document.getElementById('f-sex').value = val;
  document.getElementById('btn-male').classList.toggle('active', val === 'Male');
  document.getElementById('btn-female').classList.toggle('active', val === 'Female');
}

function setDay(val) {
  document.getElementById('f-day').value = val;
  document.querySelectorAll('#day-buttons .toggle-btn').forEach(b => b.classList.toggle('active', b.textContent === val));
}

function val(id) { return document.getElementById(id).value.trim(); }

async function getNextCode() {
  const { data } = await db.from('participants').select('code').eq('event_id', eventId).not('code', 'is', null);
  if (!data || !data.length) return eventPrefix + '-001';
  const nums = data.map(p => {
    const parts = (p.code || '').split('-');
    return parseInt(parts[parts.length - 1]) || 0;
  });
  const next = Math.max(...nums) + 1;
  return eventPrefix + '-' + String(next).padStart(3, '0');
}

async function registerParticipant() {
  const errEl = document.getElementById('err-msg');
  const name = val('f-name'), sex = val('f-sex'), org = val('f-org'),
        prog = val('f-prog'), position = val('f-position'),
        email = val('f-email'), phone = val('f-phone'), day = val('f-day');

  if (!name || !sex || !org || !prog || !position || !email || !phone) {
    errEl.textContent = 'Please fill in all required fields.'; errEl.style.display = 'block'; return;
  }
  if (!day) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty()) { errEl.textContent = 'Please provide your signature.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Submitting...'; btn.disabled = true;

  const code = await getNextCode();
  const signature = sigCanvas.toDataURL('image/png');

  const { error } = await db.from('participants').insert([{
    name, sex, org, prog,
    position_title: position,
    email, phone,
    notes: val('f-mel'),
    day_attended: day,
    signature,
    event_id: eventId,
    code
  }]);

  btn.textContent = 'Submit & Sign'; btn.disabled = false;

  if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; return; }

  // Reset
  ['f-name','f-org','f-prog','f-position','f-email','f-phone','f-mel'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-sex').value = '';
  document.getElementById('f-day').value = document.getElementById('day-group').style.display === 'none' ? 'Day 1' : '';
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  clearSig();

  // Show code confirmation
  document.getElementById('confirm-code').textContent = code;
  document.getElementById('confirm-name').textContent = name;
  document.getElementById('success').style.display = 'block';
  document.getElementById('success').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.getElementById('success').style.display = 'none', 8000);
}

init();
