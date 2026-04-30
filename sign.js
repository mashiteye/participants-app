const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const participantId = params.get('participant');
const eventId = params.get('event');
const BASE_URL = window.location.origin + window.location.pathname.replace('sign.html', '');

let sigCanvas, sigCtx, drawing = false;
let participant = null;
let eventData = null;

async function init() {
  if (!participantId || !eventId) {
    showError('Missing participant or event ID in link.');
    return;
  }

  try {
    const [pRes, evRes] = await Promise.all([
      db.from('participants').select('*').eq('id', participantId).single(),
      db.from('events').select('*').eq('id', eventId).single()
    ]);

    if (pRes.error || !pRes.data) { showError('Participant not found: ' + (pRes.error?.message || 'unknown')); return; }
    if (evRes.error || !evRes.data) { showError('Event not found: ' + (evRes.error?.message || 'unknown')); return; }

    participant = pRes.data;
    eventData = evRes.data;

    document.getElementById('sign-ui').style.display = 'block';
    document.getElementById('event-name').textContent = eventData.name;
    document.getElementById('event-code-prog').textContent = [eventData.event_code, eventData.program].filter(Boolean).join(' · ') || 'Attendance';
    document.getElementById('event-meta').textContent = [
      eventData.organizer,
      eventData.event_date ? new Date(eventData.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null
    ].filter(Boolean).join(' · ');
    document.title = 'Sign In — ' + participant.name;

    // Populate participant card
    document.getElementById('p-name').textContent = participant.name;
    document.getElementById('p-details').textContent = [participant.position_title, participant.org, participant.prog].filter(Boolean).join(' · ');
    document.getElementById('p-code').textContent = participant.code || '';

    // Fetch existing attendance for this participant
    const { data: existing } = await db.from('attendance')
      .select('day')
      .eq('participant_id', participantId)
      .eq('event_id', eventId);

    const signedDays = (existing || []).map(a => a.day);
    if (signedDays.length) {
      document.getElementById('already-signed').textContent = 'Already signed: ' + signedDays.join(', ');
      document.getElementById('already-signed').style.display = 'block';
    }

    // Day buttons
    const days = eventData.days || 1;
    if (days > 1) {
      const container = document.getElementById('day-buttons');
      container.innerHTML = '';
      for (let i = 1; i <= days; i++) {
        const btn = document.createElement('button');
        btn.className = 'toggle-btn';
        btn.textContent = 'Day ' + i;
        if (signedDays.includes('Day ' + i)) {
          btn.style.opacity = '0.5';
          btn.title = 'Already signed';
        }
        btn.onclick = () => setDay('Day ' + i);
        container.appendChild(btn);
      }
      document.getElementById('day-group').style.display = 'block';
    } else {
      document.getElementById('f-day').value = 'Day 1';
    }

    initSignature();

  } catch(e) {
    showError('Unexpected error: ' + e.message);
  }
}

function showError(msg) {
  document.getElementById('no-participant').style.display = 'block';
  document.getElementById('no-participant').querySelector('.empty-sub').textContent = msg;
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
  const start = e => { drawing = true; const p = getPos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); hideSigHint(); };
  const move  = e => { if (!drawing) return; const p = getPos(e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); };
  const stop  = () => drawing = false;

  sigCanvas.addEventListener('mousedown', start);
  sigCanvas.addEventListener('mousemove', move);
  sigCanvas.addEventListener('mouseup', stop);
  sigCanvas.addEventListener('mouseleave', stop);
  sigCanvas.addEventListener('touchstart', e => { e.preventDefault(); start(e); }, { passive: false });
  sigCanvas.addEventListener('touchmove',  e => { e.preventDefault(); move(e); },  { passive: false });
  sigCanvas.addEventListener('touchend', stop);
}

function hideSigHint() {
  const hint = document.querySelector('.sig-hint');
  if (hint) hint.style.display = 'none';
}

function clearSig() {
  if (!sigCtx) return;
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  const hint = document.querySelector('.sig-hint');
  if (hint) hint.style.display = 'block';
}

function isSigEmpty() {
  if (!sigCtx) return true;
  return !sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height).data.some(v => v !== 0);
}

function setDay(v) {
  document.getElementById('f-day').value = v;
  document.querySelectorAll('#day-buttons .toggle-btn').forEach(b => b.classList.toggle('active', b.textContent === v));
}

function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function submitAttendance() {
  const errEl = document.getElementById('err-msg');
  errEl.style.display = 'none';

  const day = document.getElementById('f-day').value;
  if (!day) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty()) { errEl.textContent = 'Please provide your signature.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Uploading signature...'; btn.disabled = true;

  try {
    // Upload signature to Supabase Storage
    const blob = await canvasToBlob(sigCanvas);
    const path = `${eventId}/${participantId}/${day.replace(' ', '_')}_${Date.now()}.png`;

    const { error: uploadError } = await db.storage.from('signatures').upload(path, blob, {
      contentType: 'image/png',
      upsert: false
    });

    if (uploadError) {
      errEl.textContent = 'Signature upload failed: ' + uploadError.message;
      errEl.style.display = 'block';
      btn.textContent = 'Sign Attendance'; btn.disabled = false;
      return;
    }

    const { data: { publicUrl } } = db.storage.from('signatures').getPublicUrl(path);

    btn.textContent = 'Saving attendance...';

    // Insert into attendance table (never overwrites — one row per day)
    const { error: attError } = await db.from('attendance').insert([{
      participant_id: participantId,
      event_id: eventId,
      day,
      signature_url: publicUrl
    }]);

    if (attError) {
      errEl.textContent = 'Attendance save failed: ' + attError.message;
      errEl.style.display = 'block';
      btn.textContent = 'Sign Attendance'; btn.disabled = false;
      return;
    }

    // Show success — scope resets to sign form only, not registration form
    document.getElementById('confirm-name').textContent = participant.name;
    document.getElementById('confirm-code').textContent = participant.code || '';
    document.getElementById('confirm-day').textContent = day;
    document.getElementById('sign-success').style.display = 'block';
    document.getElementById('sign-success').scrollIntoView({ behavior: 'smooth' });

    // Reset ONLY signature and day — participant card stays visible
    clearSig();
    document.getElementById('f-day').value = '';
    document.querySelectorAll('#day-buttons .toggle-btn').forEach(b => b.classList.remove('active'));
    btn.textContent = 'Sign Attendance'; btn.disabled = false;

    // Update already-signed indicator
    const signedText = document.getElementById('already-signed');
    const current = signedText.textContent.replace('Already signed: ', '').split(', ').filter(Boolean);
    current.push(day);
    signedText.textContent = 'Already signed: ' + [...new Set(current)].join(', ');
    signedText.style.display = 'block';

    setTimeout(() => document.getElementById('sign-success').style.display = 'none', 5000);

  } catch(e) {
    errEl.textContent = 'Unexpected error: ' + e.message;
    errEl.style.display = 'block';
    btn.textContent = 'Sign Attendance'; btn.disabled = false;
  }
}

init();
