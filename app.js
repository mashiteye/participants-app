const SUPABASE_URL = 'https://hcdgrdkahowzestlpges.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGdyZGthaG93emVzdGxwZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTE2OTUsImV4cCI6MjA5MzA2NzY5NX0.oaG-mdgtJ4EuHUM1y3_n3fESiG3cu8RRpSb8Ww6O36c';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const eventId = params.get('event');

async function init() {
  if (!eventId) { document.getElementById('no-event').style.display = 'block'; return; }

  const { data, error } = await db.from('events').select('*').eq('id', eventId).single();
  if (error || !data) { document.getElementById('no-event').style.display = 'block'; return; }

  document.getElementById('event-ui').style.display = 'block';
  document.getElementById('event-name').textContent = data.name;
  document.getElementById('event-program').textContent = data.program || 'Participant Registration';
  document.getElementById('event-meta').textContent = [
    data.organizer,
    data.event_date ? new Date(data.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null
  ].filter(Boolean).join(' · ');
  document.title = data.name + ' — Registration';
}

function val(id) { return document.getElementById(id).value.trim(); }

async function registerParticipant() {
  const name = val('f-name'), org = val('f-org');
  const errEl = document.getElementById('err-msg');

  if (!name || !org) {
    errEl.textContent = 'Name and organization are required.';
    errEl.style.display = 'inline';
    return;
  }
  errEl.style.display = 'none';

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  const { error } = await db.from('participants').insert([{
    name, org,
    role: val('f-role'),
    prog: val('f-prog') || 'Other',
    phone: val('f-phone'),
    email: val('f-email'),
    region: val('f-region'),
    gender: val('f-gender'),
    notes: val('f-notes'),
    event_id: eventId
  }]);

  btn.textContent = 'Register';
  btn.disabled = false;

  if (error) {
    errEl.textContent = 'Save failed: ' + error.message;
    errEl.style.display = 'inline';
    return;
  }

  ['f-name','f-org','f-role','f-phone','f-email','f-notes'].forEach(id => document.getElementById(id).value = '');
  ['f-prog','f-region','f-gender'].forEach(id => document.getElementById(id).selectedIndex = 0);

  const s = document.getElementById('success');
  s.classList.add('show');
  setTimeout(() => s.classList.remove('show'), 4000);
}

init();
