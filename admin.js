function renderEventCard(e, count) {
  let status = 'Before Event', statusColor = '#333', statusBg = '#f0f0f0';
  if (e.event_date) {
    const start = new Date(e.event_date);
    const end = new Date(e.event_date);
    end.setDate(end.getDate() + (e.days || 1) - 1);
    const today = new Date(); today.setHours(0,0,0,0);
    if (today >= start && today <= end) { status = 'Live'; statusColor = 'white'; statusBg = '#EB001B'; }
    else if (today > end) { status = 'Ended'; statusColor = 'white'; statusBg = '#000'; }
  }
  const dateStr = e.event_date
    ? new Date(e.event_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    : 'No date set';
  const prog = (e.program && e.program !== 'Other') ? e.program : '';
  const daysLabel = (e.days || 1) > 1 ? e.days + ' days' : '1 day';
  const meta = [prog, dateStr, daysLabel].filter(Boolean).join(' · ');
  const name = esc(e.name);
  const code = e.event_code ? esc(e.event_code) : '';
  const id = e.id;

  const card = document.createElement('div');
  card.className = 'event-card';
  card.style.cssText = 'cursor:pointer;transition:box-shadow 0.15s,transform 0.1s';
  card.onmouseover = () => { card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; card.style.transform = 'translateY(-1px)'; };
  card.onmouseout = () => { card.style.boxShadow = ''; card.style.transform = ''; };
  card.onclick = () => viewParticipants(id, e.name);
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div style="flex:1;min-width:0">
        <p class="event-card-name" style="margin-bottom:4px">${name}</p>
        <p style="font-size:12px;color:var(--text-muted)">${meta}</p>
        ${code ? '<span style="font-family:monospace;font-size:11px;font-weight:700;background:var(--yellow);padding:1px 7px;border-radius:3px;color:var(--black);display:inline-block;margin-top:4px">' + code + '</span>' : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:1rem">
        <span style="display:inline-block;background:${statusBg};color:${statusColor};font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.05em">${status}</span>
        <p class="count-num" style="margin-top:6px;color:var(--red)">${count}</p>
        <p style="font-size:11px;color:var(--text-muted)">participants</p>
      </div>
    </div>
    <p style="font-size:11px;color:var(--text-muted);margin-top:10px">Tap to open event →</p>
  `;
  return card.outerHTML;
}


