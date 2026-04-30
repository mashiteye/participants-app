const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const participantId = params.get('participant');
const eventId = params.get('event');
const BASE_URL = window.location.origin + window.location.pathname.replace('sign.html', '');

let sigCanvas, sigCtx, drawing = false;
let participant = null;

async function init() {
  if (!participantId || !eventId) { document.getElementById('no-participant').style.display = 'block'; return; }

  const [{ data: p }, { data: ev }] = await Promise.all([
    db.from('participants').select('*').eq('id', participantId).single(),
    db.from('events').select('*').eq('id', eventId).single()
  ]);

  if (!p || !ev) { document.getElementById('no-participant').style.display = 'block'; return; }

  participant = p;
  document.getElementById('sign-ui').style.display = 'block';
  document.getElementById('event-name').textContent = ev.name;
  document.getElementById('event-code-prog').textContent = [ev.event_code, ev.program].filter(Boolean).join(' · ') || 'Attendance';
  document.getElementById('event-meta').textContent = [
    ev.organizer,
    ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null
  ].filter(Boolean).join(' · ');
  document.title = 'Sign In — ' + p.name;

  document.getElementById('p-name').textContent = p.name;
  document.getElementById('p-details').textContent = [p.position_title, p.org].filter(Boolean).join(' · ');
  document.getElementById('p-code').textContent = p.code || '';

  const days = ev.days || 1;
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

function setDay(v) {
  document.getElementById('f-day').value = v;
  document.querySelectorAll('#day-buttons .toggle-btn').forEach(b => b.classList.toggle('active', b.textContent === v));
}

async function submitAttendance() {
  const errEl = document.getElementById('err-msg');
  const day = document.getElementById('f-day').value;
  if (!day) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty()) { errEl.textContent = 'Please provide your signature.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;

  const { error } = await db.from('participants').update({
    day_attended: day,
    signature: sigCanvas.toDataURL('image/png')
  }).eq('id', participantId);

  btn.textContent = 'Sign Attendance'; btn.disabled = false;

  if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; return; }

  document.getElementById('confirm-name').textContent = participant.name;
  document.getElementById('confirm-code').textContent = participant.code || '';
  document.getElementById('confirm-day').textContent = day;
  const s = document.getElementById('success');
  s.style.display = 'block';
  s.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('participant-card').style.display = 'none';
  document.getElementById('day-group').style.display = 'none';
  document.getElementById('submit-btn').style.display = 'none';
  document.querySelectorAll('.field-group').forEach(g => g.style.display = 'none');
}

init();
