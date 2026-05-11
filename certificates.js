// ─────────────────────────────────────────────────
//  METSS LBG Participant App — Certificate Engine
//  Uses real Canva-exported PNG templates as backgrounds
//  jsPDF overlays participant data on top
// ─────────────────────────────────────────────────

const BASE = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');

// Template registry — coordinates as fractions of page (W, H)
// dark: true = white text on dark background
// nameY, descY, sigY = from TOP as fraction of H
const CERT_TEMPLATES = [
  {
    id:'t01', name:'Blue & Gold Wave', file:'t01.png',
    orientation:'landscape', dark:false,
    nameColor:[0,0,60], labelColor:[40,40,40], descColor:[40,40,40],
    nameY:0.47, nameSize:0.072,
    presentedY:0.37, descY:0.605,
    sig1X:0.225, sig2X:0.725, sigY:0.805,
  },
  {
    id:'t02', name:'Cream & Gold Modern', file:'t02.png',
    orientation:'landscape', dark:false,
    nameColor:[30,20,0], labelColor:[50,40,10], descColor:[40,30,5],
    nameY:0.475, nameSize:0.068,
    presentedY:0.375, descY:0.615,
    sig1X:0.215, sig2X:0.715, sigY:0.810,
  },
  {
    id:'t03', name:'Black & Gold Ornate', file:'t03.png',
    orientation:'landscape', dark:true,
    nameColor:[255,215,0], labelColor:[255,215,0], descColor:[220,200,180],
    nameY:0.475, nameSize:0.062,
    presentedY:0.370, descY:0.605,
    sig1X:0.225, sig2X:0.225, sigY:0.810,  // single signatory left
    singleSig:true,
    contentMaxX:0.60,  // content only on left 60% (right is gold panel)
  },
  {
    id:'t04', name:'White Gold Elegant', file:'t04.png',
    orientation:'landscape', dark:false,
    nameColor:[80,50,10], labelColor:[60,40,5], descColor:[60,50,20],
    nameY:0.475, nameSize:0.068,
    presentedY:0.375, descY:0.610,
    sig1X:0.205, sig2X:0.705, sigY:0.815,
  },
  {
    id:'t05', name:'Silver & Purple', file:'t05.png',
    orientation:'portrait', dark:false,
    nameColor:[40,0,80], labelColor:[40,40,60], descColor:[50,50,70],
    nameY:0.540, nameSize:0.062,
    presentedY:0.455, descY:0.650,
    sig1X:0.205, sig2X:0.655, sigY:0.845,
  },
  {
    id:'t06', name:'Gold Vintage Floral', file:'t06.png',
    orientation:'landscape', dark:false,
    nameColor:[139,90,0], labelColor:[80,55,5], descColor:[60,45,5],
    nameY:0.470, nameSize:0.070,
    presentedY:0.372, descY:0.608,
    sig1X:0.190, sig2X:0.690, sigY:0.808,
  },
  {
    id:'t07', name:'Black & Gold Luxury', file:'t07.png',
    orientation:'landscape', dark:true,
    nameColor:[255,215,0], labelColor:[230,210,170], descColor:[210,195,160],
    nameY:0.465, nameSize:0.070,
    presentedY:0.360, descY:0.600,
    sig1X:0.230, sig2X:0.680, sigY:0.818,
  },
  {
    id:'t08', name:'Blue Elegant Wave', file:'t08.png',
    orientation:'landscape', dark:false,
    nameColor:[0,0,100], labelColor:[0,0,80], descColor:[20,20,60],
    nameY:0.470, nameSize:0.068,
    presentedY:0.370, descY:0.605,
    sig1X:0.190, sig2X:0.690, sigY:0.815,
  },
  {
    id:'t09', name:'Cream Blue Geometric', file:'t09.png',
    orientation:'landscape', dark:false,
    nameColor:[139,100,0], labelColor:[20,30,70], descColor:[20,30,70],
    nameY:0.465, nameSize:0.065,
    presentedY:0.355, descY:0.600,
    sig1X:0.155, sig2X:0.650, sigY:0.815,
  },
  {
    id:'t10', name:'Gold Pattern Modern', file:'t10.png',
    orientation:'landscape', dark:false,
    nameColor:[0,0,0], labelColor:[20,20,20], descColor:[30,30,30],
    nameY:0.470, nameSize:0.068,
    presentedY:0.368, descY:0.605,
    sig1X:0.175, sig2X:0.640, sigY:0.812,
  },
  {
    id:'t11', name:'Blue & Gold Classic', file:'t11.png',
    orientation:'landscape', dark:false,
    nameColor:[0,0,60], labelColor:[30,30,30], descColor:[30,30,30],
    nameY:0.470, nameSize:0.072,
    presentedY:0.368, descY:0.605,
    sig1X:0.225, sig2X:0.725, sigY:0.805,
  },
  {
    id:'t12', name:'Gold & Blue Modern', file:'t12.png',
    orientation:'landscape', dark:false,
    nameColor:[0,0,0], labelColor:[20,20,20], descColor:[20,20,20],
    nameY:0.445, nameSize:0.072,
    presentedY:0.340, descY:0.570,
    sig1X:0.500, sig2X:0.500, sigY:0.810,
    singleSig:true,
    eventNameY:0.570, eventDateY:0.610,
  },
];

// ── helpers ──────────────────────────────────────

function rgb(arr){ return `rgb(${arr[0]},${arr[1]},${arr[2]})`; }

async function imgToBase64(url){
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise(r => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function fetchSigImage(url){
  try { return await imgToBase64(url); } catch(e){ return null; }
}

function wrapText(doc, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for(const w of words){
    const test = line ? line + ' ' + w : w;
    if(doc.getTextWidth(test) > maxWidth && line){ lines.push(line); line = w; }
    else line = test;
  }
  if(line) lines.push(line);
  lines.forEach((l, i) => doc.text(l, x, y + i * lineHeight, {align:'center'}));
}

// ── main generator ────────────────────────────────

async function generateCertificatesWithTemplate(participants, event, templateId, signatoryData, previewOnly){
  const tmpl = CERT_TEMPLATES.find(t => t.id === templateId) || CERT_TEMPLATES[0];
  const portrait = tmpl.orientation === 'portrait';
  const W = portrait ? 595.28 : 841.89;
  const H = portrait ? 841.89 : 595.28;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: tmpl.orientation,
    unit: 'pt',
    format: 'a4'
  });

  // Load template background
  let bgBase64 = null;
  try {
    bgBase64 = await imgToBase64(`${BASE}cert-templates/${tmpl.file}`);
  } catch(e){ console.error('Template load failed', e); }

  // Load signatory signature
  let sigImgData = null;
  if(signatoryData.signatureUrl){
    sigImgData = await fetchSigImage(signatoryData.signatureUrl);
  }

  const list = previewOnly ? participants.slice(0, 1) : participants;

  for(let i = 0; i < list.length; i++){
    const p = list[i];
    if(i > 0) doc.addPage([W, H], tmpl.orientation);

    // Background
    if(bgBase64){
      doc.addImage(bgBase64, 'PNG', 0, 0, W, H);
    }

    const cx = tmpl.contentMaxX ? (tmpl.contentMaxX * W) / 2 : W / 2;

    // "This certificate is presented to"
    doc.setFont('times', 'italic');
    doc.setFontSize(H * 0.030);
    doc.setTextColor(...tmpl.labelColor);
    doc.text('This certificate is presented to:', cx, H * tmpl.presentedY, {align:'center'});

    // Participant name — large bold italic
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(H * tmpl.nameSize);
    doc.setTextColor(...tmpl.nameColor);
    doc.text(p.name || 'Participant Name', cx, H * tmpl.nameY, {align:'center'});

    // Underline below name
    const nameWidth = Math.min(doc.getTextWidth(p.name || 'Participant Name'), W * 0.65);
    const underY = H * tmpl.nameY + H * 0.012;
    doc.setDrawColor(...tmpl.nameColor);
    doc.setLineWidth(0.8);
    doc.line(cx - nameWidth/2, underY, cx + nameWidth/2, underY);

    // Event description
    doc.setFont('times', 'normal');
    doc.setFontSize(H * 0.026);
    doc.setTextColor(...tmpl.descColor);
    const program = event.program || event.organizer || '';
    const dateStr = event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '';
    const descLine1 = `For participating in "${event.name}"`;
    const descLine2 = [program ? `organised by ${program}` : '', dateStr ? `on ${dateStr}` : ''].filter(Boolean).join(', ');
    doc.text(descLine1, cx, H * tmpl.descY, {align:'center'});
    if(descLine2) doc.text(descLine2, cx, H * tmpl.descY + H * 0.038, {align:'center'});

    // Participant code badge
    const codeY = H * tmpl.descY + H * 0.082;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(H * 0.018);
    doc.setTextColor(...tmpl.labelColor);
    doc.text(`Code: ${p.code || '—'}`, cx, codeY, {align:'center'});

    // ── Signatory section ──
    const sigY = H * tmpl.sigY;
    const lineLen = W * 0.12;

    if(tmpl.singleSig){
      // Single signatory centred
      const sx = tmpl.sig1X * W;
      // Signature image
      if(sigImgData){
        doc.addImage(sigImgData, 'PNG', sx - W*0.055, sigY - H*0.065, W*0.11, H*0.055);
      }
      doc.setDrawColor(...tmpl.labelColor);
      doc.setLineWidth(0.8);
      doc.line(sx - lineLen, sigY, sx + lineLen, sigY);
      doc.setFont('times', 'bold');
      doc.setFontSize(H * 0.026);
      doc.setTextColor(...tmpl.descColor);
      doc.text(signatoryData.name || '', sx, sigY + H*0.030, {align:'center'});
      doc.setFont('times', 'normal');
      doc.setFontSize(H * 0.022);
      doc.text(signatoryData.title || '', sx, sigY + H*0.055, {align:'center'});
    } else {
      // Two signatories
      const sx1 = tmpl.sig1X * W;
      const sx2 = tmpl.sig2X * W;
      // Left sig — event signatory (with uploaded signature image)
      if(sigImgData){
        doc.addImage(sigImgData, 'PNG', sx1 - W*0.055, sigY - H*0.065, W*0.11, H*0.055);
      }
      doc.setDrawColor(...tmpl.labelColor);
      doc.setLineWidth(0.8);
      doc.line(sx1 - lineLen, sigY, sx1 + lineLen, sigY);
      doc.setFont('times', 'bold');
      doc.setFontSize(H * 0.026);
      doc.setTextColor(...tmpl.descColor);
      doc.text(signatoryData.name || '', sx1, sigY + H*0.030, {align:'center'});
      doc.setFont('times', 'normal');
      doc.setFontSize(H * 0.022);
      doc.text(signatoryData.title || '', sx1, sigY + H*0.055, {align:'center'});

      // Right sig — organizer name (no image, just name+title)
      doc.setDrawColor(...tmpl.labelColor);
      doc.line(sx2 - lineLen, sigY, sx2 + lineLen, sigY);
      doc.setFont('times', 'bold');
      doc.setFontSize(H * 0.026);
      doc.setTextColor(...tmpl.descColor);
      doc.text(event.organizer || '', sx2, sigY + H*0.030, {align:'center'});
      doc.setFont('times', 'normal');
      doc.setFontSize(H * 0.022);
      doc.text('Programme Organiser', sx2, sigY + H*0.055, {align:'center'});
    }
  }

  const filename = previewOnly
    ? `PREVIEW-${event.event_code || 'cert'}.pdf`
    : `Certificates-${event.event_code || 'event'}-${Date.now()}.pdf`;

  if(previewOnly){
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  } else {
    doc.save(filename);
  }
}

// ── Template picker UI ────────────────────────────

function buildTemplatePicker(participants, event, signatoryData){
  const existing = document.getElementById('cert-picker-overlay');
  if(existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'cert-picker-overlay';
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.82);
    z-index:9999; overflow-y:auto; padding:24px 16px;
    display:flex; flex-direction:column; align-items:center;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background:#fff; border-radius:14px; width:100%; max-width:860px;
    padding:24px; box-sizing:border-box;
  `;

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
      <h2 style="margin:0;font-size:18px;color:#EB001B;">🎓 Choose Certificate Template</h2>
      <button onclick="document.getElementById('cert-picker-overlay').remove()"
        style="background:none;border:1px solid #ccc;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;">✕ Close</button>
    </div>
    <div id="cert-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;"></div>
    <div id="cert-preview-area" style="margin-top:20px;display:none;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <strong id="cert-preview-label" style="font-size:14px;color:#333;"></strong>
        <button onclick="document.getElementById('cert-preview-area').style.display='none'"
          style="background:none;border:1px solid #ccc;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:12px;">✕ Close Preview</button>
      </div>
      <iframe id="cert-preview-frame" style="width:100%;height:480px;border:1px solid #ddd;border-radius:8px;"></iframe>
    </div>
  `;

  const grid = box.querySelector('#cert-grid');

  CERT_TEMPLATES.forEach(tmpl => {
    const card = document.createElement('div');
    card.style.cssText = `
      border:2px solid #eee; border-radius:10px; overflow:hidden;
      cursor:pointer; transition:border-color .2s, box-shadow .2s;
    `;
    card.onmouseover = () => { card.style.borderColor='#EB001B'; card.style.boxShadow='0 4px 16px rgba(235,0,27,.15)'; };
    card.onmouseout  = () => { card.style.borderColor='#eee'; card.style.boxShadow='none'; };

    card.innerHTML = `
      <div style="position:relative;width:100%;padding-top:70%;background:#f5f5f5;overflow:hidden;">
        <img src="${BASE}cert-templates/${tmpl.file}"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
          onerror="this.style.display='none'">
        <span style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,.5);color:#fff;
          font-size:10px;padding:2px 6px;border-radius:4px;">${tmpl.orientation}</span>
      </div>
      <div style="padding:10px 12px;">
        <div style="font-weight:700;font-size:13px;color:#1a1a1a;margin-bottom:8px;">${tmpl.name}</div>
        <div style="display:flex;gap:8px;">
          <button data-tid="${tmpl.id}" data-action="preview"
            style="flex:1;padding:7px 4px;font-size:12px;font-weight:600;border:1.5px solid #FF5F00;
            color:#FF5F00;background:#fff;border-radius:7px;cursor:pointer;">Preview</button>
          <button data-tid="${tmpl.id}" data-action="generate"
            style="flex:1;padding:7px 4px;font-size:12px;font-weight:600;border:none;
            background:#EB001B;color:#fff;border-radius:7px;cursor:pointer;">Generate All</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Event delegation for buttons
  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-tid]');
    if(!btn) return;
    const tid = btn.dataset.tid;
    const action = btn.dataset.action;
    const tmpl = CERT_TEMPLATES.find(t => t.id === tid);

    if(action === 'preview'){
      btn.textContent = '⏳ Loading…';
      try {
        const url = await generateCertificatesWithTemplate(participants, event, tid, signatoryData, true);
        const area = document.getElementById('cert-preview-area');
        document.getElementById('cert-preview-label').textContent = `Preview: ${tmpl.name}`;
        document.getElementById('cert-preview-frame').src = url;
        area.style.display = 'block';
        area.scrollIntoView({behavior:'smooth'});
      } catch(err){ alert('Preview failed: ' + err.message); }
      btn.textContent = 'Preview';
    }

    if(action === 'generate'){
      if(!confirm(`Generate certificates for all ${participants.length} signed participant(s) using "${tmpl.name}"?`)) return;
      btn.textContent = '⏳ Generating…';
      btn.disabled = true;
      try {
        await generateCertificatesWithTemplate(participants, event, tid, signatoryData, false);
        overlay.remove();
      } catch(err){ alert('Generation failed: ' + err.message); }
      btn.textContent = 'Generate All';
      btn.disabled = false;
    }
  });

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

// ── Entry point called from event.html ───────────

async function openCertificatePicker(eventId){
  const { data: event } = await db.from('events').select('*').eq('id', eventId).single();
  const { data: attendance } = await db.from('attendance').select('participant_id').eq('event_id', eventId);
  const signedIds = [...new Set((attendance||[]).map(a => a.participant_id))];

  if(!signedIds.length){ alert('No signed participants found for this event.'); return; }

  const { data: participants } = await db.from('participants')
    .select('*').in('id', signedIds).order('code');

  const signatoryData = {
    name:  event.signatory_name  || '',
    title: event.signatory_title || '',
    signatureUrl: event.signatory_signature_url || null,
  };

  buildTemplatePicker(participants, event, signatoryData);
}
