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
let currentDay = null;
let existingAttendance = {}; // day -> attendance record
let resignMode = false;

async function init() {
  if (!participantId || !eventId) { showError('Missing participant or event ID.'); return; }

  try {
    const [pRes, evRes, attRes] = await Promise.all([
      db.from('participants').select('*').eq('id', participantId).single(),
      db.from('events').select('*').eq('id', eventId).single(),
      db.from('attendance').select('*').eq('participant_id', participantId).eq('event_id', eventId)
    ]);

    if (pRes.error || !pRes.data) { showError('Participant not found: ' + (pRes.error?.message || '')); return; }
    if (evRes.error || !evRes.data) { showError('Event not found: ' + (evRes.error?.message || '')); return; }

    participant = pRes.data;
    eventData = evRes.data;
    existingAttendance = {};
    (attRes.data || []).forEach(a => { existingAttendance[a.day] = a; });

    // Populate header
    document.getElementById('event-name').textContent = eventData.name;
    const signDisplayProg = (eventData.program && eventData.program !== 'Other') ? eventData.program : null;
    document.getElementById('event-code-prog').textContent = [eventData.event_code, signDisplayProg].filter(Boolean).join(' · ') || 'Attendance';
    document.getElementById('event-meta').textContent = [
      eventData.organizer,
      eventData.event_date ? new Date(eventData.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null
    ].filter(Boolean).join(' · ');
    document.title = 'Sign In — ' + participant.name;

    // Populate participant card
    document.getElementById('p-name').textContent = participant.name;
    document.getElementById('p-details').textContent = [participant.position_title, participant.org, participant.prog].filter(Boolean).join(' · ');
    document.getElementById('p-code').textContent = participant.code || '';

    const signedDays = Object.keys(existingAttendance);
    if (signedDays.length) {
      document.getElementById('already-signed').textContent = 'Signed: ' + signedDays.join(', ');
      document.getElementById('already-signed').style.display = 'block';
    }

    // Build day buttons
    const days = eventData.days || 1;
    if (days > 1) {
      const container = document.getElementById('day-buttons');
      container.innerHTML = '';
      for (let i = 1; i <= days; i++) {
        const label = 'Day ' + i;
        const btn = document.createElement('button');
        btn.className = 'toggle-btn';
        btn.textContent = label;
        btn.onclick = () => selectDay(label);
        if (existingAttendance[label]) {
          btn.style.borderColor = 'var(--orange)';
          btn.title = 'Already signed';
        }
        container.appendChild(btn);
      }
      document.getElementById('day-group').style.display = 'block';
    } else {
      selectDay('Day 1');
    }

    document.getElementById('sign-ui').style.display = 'block';
    initSignature();

  } catch(e) { showError('Unexpected error: ' + e.message); }
}

function showError(msg) {
  const el = document.getElementById('no-participant');
  el.style.display = 'block';
  el.querySelector('.empty-sub').textContent = msg;
}

function goBack() { window.location.href = BASE_URL + 'event.html?event=' + eventId; }

function selectDay(day) {
  currentDay = day;
  resignMode = false;
  document.getElementById('f-day').value = day;
  document.querySelectorAll('#day-buttons .toggle-btn').forEach(b => b.classList.toggle('active', b.textContent === day));

  const existing = existingAttendance[day];
  const sigSection = document.getElementById('sig-section');
  const resignSection = document.getElementById('resign-section');
  const existingSigPreview = document.getElementById('existing-sig-preview');
  const submitBtn = document.getElementById('submit-btn');

  if (existing && existing.signature_url) {
    // Show existing signature as read-only preview
    existingSigPreview.src = existing.signature_url;
    existingSigPreview.style.display = 'block';
    document.getElementById('existing-sig-label').style.display = 'block';
    sigSection.style.display = 'none';
    resignSection.style.display = 'block';
    submitBtn.style.display = 'none';
  } else {
    // No existing signature — show canvas
    existingSigPreview.style.display = 'none';
    document.getElementById('existing-sig-label').style.display = 'none';
    sigSection.style.display = 'block';
    resignSection.style.display = 'none';
    submitBtn.style.display = 'block';
    // Resize canvas now that it is visible (offsetWidth was 0 when hidden)
    resizeCanvas();
    clearSig();
  }
}

function enableResign() {
  resignMode = true;
  document.getElementById('sig-section').style.display = 'block';
  document.getElementById('resign-section').style.display = 'none';
  document.getElementById('submit-btn').style.display = 'block';
  document.getElementById('submit-btn').textContent = 'Update Signature';
  resizeCanvas();
  clearSig();
}

function cancelResign() {
  resignMode = false;
  selectDay(currentDay);
}

function resizeCanvas() {
  if (!sigCanvas) return;
  // Preserve existing drawing if any
  const w = sigCanvas.parentElement.offsetWidth || 300;
  const h = 130;
  sigCanvas.width = w;
  sigCanvas.height = h;
  if (sigCtx) {
    sigCtx.strokeStyle = '#1a1a1a';
    sigCtx.lineWidth = 2;
    sigCtx.lineCap = 'round';
  }
}

function initSignature() {
  sigCanvas = document.getElementById('sig-canvas');
  sigCtx = sigCanvas.getContext('2d');
  // Don't size from offsetWidth here — canvas may be hidden
  sigCanvas.width = sigCanvas.parentElement.offsetWidth || 300;
  sigCanvas.height = 130;
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

function hideSigHint() { const h = document.querySelector('.sig-hint'); if (h) h.style.display = 'none'; }
function clearSig() {
  if (!sigCtx) return;
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  const h = document.querySelector('.sig-hint'); if (h) h.style.display = 'block';
}
function isSigEmpty() {
  if (!sigCtx) return true;
  return !sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height).data.some(v => v !== 0);
}
function canvasToBlob(canvas) { return new Promise(resolve => canvas.toBlob(resolve, 'image/png')); }

async function submitAttendance() {
  const errEl = document.getElementById('err-msg');
  errEl.style.display = 'none';

  if (!currentDay) { errEl.textContent = 'Please select a day.'; errEl.style.display = 'block'; return; }
  if (isSigEmpty()) { errEl.textContent = 'Please draw your signature.'; errEl.style.display = 'block'; return; }

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Uploading...'; btn.disabled = true;

  try {
    const blob = await canvasToBlob(sigCanvas);
    const path = `${eventId}/${participantId}/${currentDay.replace(' ','_')}_${Date.now()}.png`;

    const { error: upErr } = await db.storage.from('signatures').upload(path, blob, { contentType: 'image/png' });
    if (upErr) { errEl.textContent = 'Upload failed: ' + upErr.message; errEl.style.display = 'block'; btn.textContent = resignMode ? 'Update Signature' : 'Sign Attendance'; btn.disabled = false; return; }

    const { data: { publicUrl } } = db.storage.from('signatures').getPublicUrl(path);

    const existing = existingAttendance[currentDay];
    if (existing) {
      // Update existing row — no duplicate
      const { error: updErr } = await db.from('attendance')
        .update({ signature_url: publicUrl, signed_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (updErr) {
        errEl.textContent = 'Save failed: ' + updErr.message;
        errEl.style.display = 'block';
        btn.textContent = resignMode ? 'Update Signature' : 'Sign Attendance';
        btn.disabled = false;
        return;
      }
      // Re-fetch to confirm DB has the new value
      const { data: confirmed } = await db.from('attendance').select('*').eq('id', existing.id).single();
      existingAttendance[currentDay] = confirmed || { ...existing, signature_url: publicUrl };
    } else {
      // New day — insert new row
      const { data: newRow, error: insErr } = await db.from('attendance').insert([{
        participant_id: participantId,
        event_id: eventId,
        day: currentDay,
        signature_url: publicUrl
      }]).select().single();
      if (insErr) {
        errEl.textContent = 'Save failed: ' + insErr.message;
        errEl.style.display = 'block';
        btn.textContent = 'Sign Attendance';
        btn.disabled = false;
        return;
      }
      if (newRow) existingAttendance[currentDay] = newRow;
    }

    // Re-fetch attendance from Supabase to guarantee latest data
    const { data: freshAtt } = await db.from('attendance')
      .select('*')
      .eq('participant_id', participantId)
      .eq('event_id', eventId);
    existingAttendance = {};
    (freshAtt || []).forEach(a => { existingAttendance[a.day] = a; });

    // Show success — scoped only to sign form
    document.getElementById('confirm-name').textContent = participant.name;
    document.getElementById('confirm-code').textContent = participant.code || '';
    document.getElementById('confirm-day').textContent = currentDay;
    const s = document.getElementById('sign-success');
    s.style.display = 'block';
    s.scrollIntoView({ behavior: 'smooth' });

    // Update signed indicator with fresh data
    const signedDays = Object.keys(existingAttendance);
    document.getElementById('already-signed').textContent = 'Signed: ' + signedDays.join(', ');
    document.getElementById('already-signed').style.display = 'block';

    btn.textContent = resignMode ? 'Update Signature' : 'Sign Attendance';
    btn.disabled = false;
    resignMode = false;
    selectDay(currentDay);
    setTimeout(() => s.style.display = 'none', 5000);

  } catch(e) {
    errEl.textContent = 'Error: ' + e.message; errEl.style.display = 'block';
    btn.textContent = resignMode ? 'Update Signature' : 'Sign Attendance'; btn.disabled = false;
  }
}

init();
