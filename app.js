const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');
const isWalkin = params.get('walkin') === '1';
const BASE_URL = window.location.origin + window.location.pathname.replace('index.html', '');

let eventPrefix = 'P';
let sigCanvas, sigCtx, drawing = false;

async function init() {
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !data) { document.getElementById('no-event').style.display = 'block'; return; }

  if (data.program) eventPrefix = data.program.replace(/[^A-Z]/g, '').slice(0, 3) || 'P';

  document.getElementById('event-ui').style.display = 'block';
  // Live email validation on blur
  document.getElementById('f-email').addEventListener('blur', () => {
    const v = validateEmail(document.getElementById('f-email').value.trim());
    const errEl = document.getElementById('err-msg');
    if (!v.valid && document.getElementById('f-email').value.trim()) {
      errEl.textContent = v.msg; errEl.style.display = 'block';
    } else {
      errEl.style.display = 'none';
    }
  });
  document.getElementById('event-name').textContent = data.name;
  document.getElementById('event-program').textContent = [data.event_code, data.program].filter(Boolean).join(' · ') || 'Registration';
  document.getElementById('event-meta').textContent = [
    data.organizer,
    data.event_date ? new Date(data.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null
  ].filter(Boolean).join(' · ');
  document.title = data.name;

  if (data.mel_question) {
    document.getElementById('mel-question-group').style.display = 'block';
    document.getElementById('mel-question-label').textContent = data.mel_question;
  }

  if (isWalkin) {
    document.getElementById('form-type-label').textContent = 'Walk-in Registration';
    document.getElementById('walkin-fields').style.display = 'block';
    document.getElementById('submit-btn').textContent = 'Submit & Sign';

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
  } else {
    document.getElementById('form-type-label').textContent = 'Pre-Registration';
    document.getElementById('f-day').value = '';
  }
}

function goBack() {
  window.location.href = BASE_URL + 'event.html?event=' + eventId;
}

function initSignature() {
  sigCanvas = document.getElementById('sig-canvas');
  sigCtx = sigCanvas.getContext('2d');
  sigCanvas.width = sigCanvas.offsetWidth;
  sigCanvas.height = sigCanvas.offsetHeight;
  sigCtx.strokeStyle = '#1a1a1a';
  sigCtx.lineWidth = 2;
  sigCtx.lineCap = 'round';

  const getPos = e => {
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
function clearSig() { sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height); document.querySelector('.sig-hint').style.display = 'block'; }
function isSigEmpty() { return !sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height).data.some(v => v !== 0); }

function setSex(v) {
  document.getElementById('f-sex').value = v;
  document.getElementById('btn-male').classList.toggle('active', v === 'Male');
  document.getElementById('btn-female').classList.toggle('active', v === 'Female');
}

function setDay(v) {
  document.getElementById('f-day').value = v;
  document.querySelectorAll('#day-buttons .toggle-btn').forEach(b => b.classList.toggle('active', b.textContent === v));
}

function fval(id) { return document.getElementById(id).value.trim(); }

function validateEmail(email) {
  if (!email) return { valid: false, msg: 'Email is required.' };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return { valid: false, msg: 'Enter a valid email address (e.g. name@org.com).' };
  // Common typo domains
  const typos = { 'gmial.com':'gmail.com', 'gmai.com':'gmail.com', 'gmail.co':'gmail.com',
    'yahoocom':'yahoo.com', 'yaho.com':'yahoo.com', 'hotmai.com':'hotmail.com',
    'outlok.com':'outlook.com', 'outloook.com':'outlook.com' };
  const domain = email.split('@')[1].toLowerCase();
  if (typos[domain]) return { valid: false, msg: `Did you mean @${typos[domain]}?` };
  return { valid: true };
}

async function getNextCode() {
  const { data } = await db.from('participants').select('code').eq('event_id', eventId).not('code', 'is', null);
  if (!data || !data.length) return eventPrefix + '-001';
  const nums = data.map(p => { const m = (p.code || '').match(/(\d+)$/); return m ? parseInt(m[1]) : 0; });
  return eventPrefix + '-' + String(Math.max(...nums) + 1).padStart(3, '0');
}

async function registerParticipant() {
  const errEl = document.getElementById('err-msg');
  const name = fval('f-name'), sex = fval('f-sex'), org = fval('f-org'),
        prog = fval('f-prog'), position = fval('f-position'),
        email = fval('f-email'), phone = fval('f-phone');

  if (!name || !sex || !org || !prog || !position || !email || !phone) {
    errEl.textContent = 'Please fill in all required fields.'; errEl.style.display = 'block'; return;
  }
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) { errEl.textContent = emailCheck.msg; errEl.style.display = 'block'; return; }
  if (isWalkin) {
    const day = fval('f-day');
    if (!day) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
    if (isSigEmpty()) { errEl.textContent = 'Please provide your signature.'; errEl.style.display = 'block'; return; }
  }
  errEl.style.display = 'none';

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Submitting...'; btn.disabled = true;

  const code = await getNextCode();
  const payload = {
    name, sex, org, prog,
    position_title: position,
    email, phone,
    notes: fval('f-mel'),
    event_id: eventId,
    code,
    reg_type: isWalkin ? 'Walk-in' : 'Pre-registration'
  };
  if (isWalkin) {
    payload.day_attended = fval('f-day');
    payload.signature = sigCanvas.toDataURL('image/png');
  }

  const { error } = await db.from('participants').insert([payload]);
  btn.textContent = isWalkin ? 'Submit & Sign' : 'Submit & Register';
  btn.disabled = false;

  if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; return; }

  ['f-name','f-org','f-prog','f-position','f-email','f-phone','f-mel'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-sex').value = '';
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  if (isWalkin) { clearSig(); document.getElementById('f-day').value = ''; }

  document.getElementById('confirm-name').textContent = name;
  document.getElementById('confirm-code').textContent = code;
  const s = document.getElementById('success');
  s.style.display = 'block';
  s.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => s.style.display = 'none', 8000);
}

init();
