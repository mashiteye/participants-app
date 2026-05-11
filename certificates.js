// METSS LBG Certificate Engine v4
// pdf-lib only — real Canva PDF templates

const BASE = (() => {
  const p = window.location.pathname.replace(/[^/]*$/, '');
  return window.location.origin + p;
})();

const PDF_TEMPLATES = [
  { id:'p01', name:'Blue & Gold Wave',      file:'cert-pdf/p01.pdf', landscape:true,  W:841.89, H:595.28, bg:[255,255,255], cx:421, presentedY:358, presentedSz:15, nameY:308, nameSz:44, desc1Y:248, desc2Y:228, descSz:13, codeY:208, codeSz:10, s1x:190, s2x:650, sigNameY:133, sigTitleY:115, sigLineY:147, sigImgW:110, sigImgH:52, nameColor:[0,0,80],    labelColor:[45,45,45],  descColor:[50,50,50],   sigColor:[15,15,15],   lineColor:[0,0,80],    covers:[[195,340,455,28],[85,237,672,118],[172,184,498,78],[80,76,240,92],[522,76,240,92]] },
  { id:'p02', name:'Cream & Gold Modern',   file:'cert-pdf/p02.pdf', landscape:true,  W:841.89, H:595.28, bg:[248,244,236], cx:421, presentedY:358, presentedSz:15, nameY:306, nameSz:46, desc1Y:246, desc2Y:226, descSz:13, codeY:206, codeSz:10, s1x:165, s2x:592, sigNameY:129, sigTitleY:111, sigLineY:143, sigImgW:106, sigImgH:50, nameColor:[35,22,0],   labelColor:[55,38,5],   descColor:[55,42,5],   sigColor:[18,12,0],   lineColor:[100,75,10], covers:[[190,340,460,28],[95,237,652,116],[172,181,498,78],[52,72,245,95],[510,72,245,95]] },
  { id:'p03', name:'Black & Gold Ornate',   file:'cert-pdf/p03.pdf', landscape:true,  W:841.89, H:595.28, bg:[8,8,8],       cx:262, presentedY:362, presentedSz:13, nameY:302, nameSz:40, desc1Y:240, desc2Y:220, descSz:12, codeY:200, codeSz:10, s1x:262, s2x:262, sigNameY:125, sigTitleY:107, sigLineY:138, sigImgW:110, sigImgH:50, nameColor:[255,215,0], labelColor:[255,215,0], descColor:[205,185,155],sigColor:[255,215,0], lineColor:[255,215,0], singleSig:true, covers:[[50,345,442,28],[38,232,450,120],[52,180,448,78],[52,68,448,95]] },
  { id:'p04', name:'White & Gold Elegant',  file:'cert-pdf/p04.pdf', landscape:true,  W:841.89, H:595.28, bg:[253,250,245], cx:421, presentedY:355, presentedSz:15, nameY:300, nameSz:46, desc1Y:238, desc2Y:216, descSz:13, codeY:196, codeSz:10, s1x:168, s2x:642, sigNameY:125, sigTitleY:107, sigLineY:138, sigImgW:106, sigImgH:50, nameColor:[88,55,10],  labelColor:[68,48,8],   descColor:[62,44,8],   sigColor:[80,54,10],  lineColor:[140,100,20], covers:[[186,337,470,28],[85,232,672,122],[172,176,498,78],[52,68,245,95],[528,68,245,95]] },
  { id:'p05', name:'Silver & Purple',       file:'cert-pdf/p05.pdf', landscape:false, W:595.28, H:841.89, bg:[218,218,226], cx:298, presentedY:468, presentedSz:13, nameY:410, nameSz:42, desc1Y:346, desc2Y:326, descSz:12, codeY:305, codeSz:10, s1x:143, s2x:436, sigNameY:122, sigTitleY:104, sigLineY:135, sigImgW:106, sigImgH:50, nameColor:[38,0,78],   labelColor:[48,38,68],  descColor:[48,48,68],  sigColor:[35,25,58],  lineColor:[38,0,78],   covers:[[95,450,408,28],[45,368,506,120],[85,300,426,70],[42,80,215,95],[332,80,215,95]] },
  { id:'p06', name:'Gold Vintage Floral',   file:'cert-pdf/p06.pdf', landscape:true,  W:841.89, H:595.28, bg:[254,252,247], cx:421, presentedY:358, presentedSz:15, nameY:298, nameSz:48, desc1Y:238, desc2Y:218, descSz:13, codeY:196, codeSz:10, s1x:155, s2x:592, sigNameY:123, sigTitleY:104, sigLineY:136, sigImgW:106, sigImgH:50, nameColor:[139,90,0], labelColor:[88,58,4],   descColor:[68,50,4],   sigColor:[139,90,0],  lineColor:[139,90,0],  covers:[[186,340,470,28],[88,230,666,126],[175,178,492,78],[40,68,248,98],[518,68,248,98]] },
  { id:'p07', name:'Red & Gold Professional', file:'cert-pdf/p07.pdf', landscape:true,  W:841.89, H:595.28, bg:[255,255,255], cx:500, presentedY:390, presentedSz:14, nameY:328, nameSz:46, desc1Y:262, desc2Y:242, descSz:13, codeY:220, codeSz:10, s1x:340, s2x:560, sigNameY:128, sigTitleY:110, sigLineY:143, sigImgW:106, sigImgH:48, nameColor:[160,0,0], labelColor:[160,0,0], descColor:[40,40,40], sigColor:[40,40,40], lineColor:[160,0,0], covers:[[280,378,490,24]] },
  { id:'p08', name:'Purple & Gold Regal',      file:'cert-pdf/p08.pdf', landscape:true,  W:841.89, H:595.28, bg:[15,10,60],    cx:421, presentedY:388, presentedSz:13, nameY:326, nameSz:44, desc1Y:262, desc2Y:242, descSz:12, codeY:220, codeSz:10, s1x:245, s2x:596, sigNameY:120, sigTitleY:102, sigLineY:133, sigImgW:100, sigImgH:46, nameColor:[255,215,0], labelColor:[200,180,100], descColor:[210,195,165], sigColor:[255,215,0], lineColor:[255,215,0], covers:[[148,372,546,24]] },
  { id:'p09', name:'Green & Gold Geometric',    file:'cert-pdf/p09.pdf', landscape:true,  W:841.89, H:595.28, bg:[255,255,255], cx:430, presentedY:388, presentedSz:14, nameY:325, nameSz:46, desc1Y:260, desc2Y:240, descSz:13, codeY:218, codeSz:10, s1x:300, s2x:530, sigNameY:122, sigTitleY:104, sigLineY:136, sigImgW:106, sigImgH:48, nameColor:[0,70,40],   labelColor:[0,70,40],   descColor:[30,30,30],  sigColor:[20,20,20],  lineColor:[0,70,40],   covers:[[220,374,476,24]] },
  { id:'p10', name:'Orange Elegant Wave',        file:'cert-pdf/p10.pdf', landscape:true,  W:841.89, H:595.28, bg:[252,248,238], cx:370, presentedY:388, presentedSz:14, nameY:322, nameSz:46, desc1Y:258, desc2Y:238, descSz:13, codeY:216, codeSz:10, s1x:175, s2x:450, sigNameY:122, sigTitleY:104, sigLineY:135, sigImgW:100, sigImgH:46, nameColor:[30,20,5],   labelColor:[40,30,8],   descColor:[40,35,10],  sigColor:[20,15,5],   lineColor:[80,60,20],  covers:[] },
  { id:'p11', name:'Colourful & Fun',           file:'cert-pdf/p11.pdf', landscape:true,  W:841.89, H:595.28, bg:[255,255,255], cx:500, presentedY:390, presentedSz:13, nameY:320, nameSz:44, desc1Y:258, desc2Y:238, descSz:12, codeY:216, codeSz:10, s1x:295, s2x:510, sigNameY:125, sigTitleY:107, sigLineY:138, sigImgW:100, sigImgH:46, nameColor:[180,80,30],  labelColor:[200,90,20],  descColor:[50,40,35],  sigColor:[50,40,35],  lineColor:[180,80,30],  covers:[[290,376,380,22]] },
];

// helpers
function r01(a){ return { r:a[0]/255, g:a[1]/255, b:a[2]/255 }; }

async function fetchBytes(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('Fetch failed: '+url+' '+res.status);
  return new Uint8Array(await res.arrayBuffer());
}

function evtDesc(event){
  const d = event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '';
  const p = event.program || event.organizer || '';
  const l1 = `For participating in "${event.name}"`;
  const l2 = [p?'organised by '+p:'', d?'on '+d:''].filter(Boolean).join(', ');
  return { l1, l2 };
}

async function genPdf(tmpl, parts, event, sig, preview){
  const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
  const tplBytes = await fetchBytes(BASE+tmpl.file);
  let sigBytes = null;
  if(sig.signatureUrl){ try{ sigBytes = await fetchBytes(sig.signatureUrl); }catch(e){} }

  const list = preview ? parts.slice(0,1) : parts;
  const out  = await PDFDocument.create();
  const fR   = await out.embedFont(StandardFonts.TimesRoman);
  const fB   = await out.embedFont(StandardFonts.TimesRomanBold);
  const fBI  = await out.embedFont(StandardFonts.TimesRomanBoldItalic);
  const fI   = await out.embedFont(StandardFonts.TimesRomanItalic);
  const fH   = await out.embedFont(StandardFonts.Helvetica);
  let sigEmb = null;
  if(sigBytes){ try{ sigEmb=await out.embedPng(sigBytes); }catch(e){ try{ sigEmb=await out.embedJpg(sigBytes); }catch(e2){} } }

  for(const p of list){
    const td  = await PDFDocument.load(tplBytes);
    const [pg]= await out.copyPages(td,[0]);
    out.addPage(pg);
    const page = out.getPages()[out.getPageCount()-1];
    const { W, H } = tmpl;
    const bgc = r01(tmpl.bg);
    const nc=r01(tmpl.nameColor), lc=r01(tmpl.labelColor), dc=r01(tmpl.descColor), sc=r01(tmpl.sigColor), linc=r01(tmpl.lineColor);
    const cx = tmpl.cx;

    // cover placeholders
    for(const [x,y,w,h] of tmpl.covers)
      page.drawRectangle({ x, y, width:w, height:h, color:rgb(bgc.r,bgc.g,bgc.b) });

    // "presented to"
    const ptxt = 'This certificate is presented to:';
    page.drawText(ptxt,{ x: cx - fI.widthOfTextAtSize(ptxt,tmpl.presentedSz)/2, y:tmpl.presentedY, size:tmpl.presentedSz, font:fI, color:rgb(lc.r,lc.g,lc.b) });

    // name — scale down for long names
    const name = p.name || 'Participant';
    let nsz = tmpl.nameSz;
    const maxNW = W * (tmpl.singleSig ? 0.55 : 0.68);
    while(fBI.widthOfTextAtSize(name,nsz) > maxNW && nsz > 20) nsz -= 2;
    const nw = fBI.widthOfTextAtSize(name,nsz);
    page.drawText(name,{ x:cx-nw/2, y:tmpl.nameY, size:nsz, font:fBI, color:rgb(nc.r,nc.g,nc.b) });
    const ulL = Math.min(nw+20, W*0.65);
    page.drawLine({ start:{x:cx-ulL/2,y:tmpl.nameY-5}, end:{x:cx+ulL/2,y:tmpl.nameY-5}, thickness:1, color:rgb(nc.r,nc.g,nc.b) });

    // description
    const { l1, l2 } = evtDesc(event);
    page.drawText(l1,{ x:cx-fR.widthOfTextAtSize(l1,tmpl.descSz)/2, y:tmpl.desc1Y, size:tmpl.descSz, font:fR, color:rgb(dc.r,dc.g,dc.b) });
    if(l2) page.drawText(l2,{ x:cx-fR.widthOfTextAtSize(l2,tmpl.descSz)/2, y:tmpl.desc2Y, size:tmpl.descSz, font:fR, color:rgb(dc.r,dc.g,dc.b) });

    // code
    const ct='Participant Code: '+(p.code||'—');
    page.drawText(ct,{ x:cx-fH.widthOfTextAtSize(ct,tmpl.codeSz)/2, y:tmpl.codeY, size:tmpl.codeSz, font:fH, color:rgb(lc.r*0.65,lc.g*0.65,lc.b*0.65) });

    // signatories
    const hl=68;
    const drawSig=(sx,sname,stitle,withImg)=>{
      if(withImg && sigEmb){ page.drawImage(sigEmb,{ x:sx-tmpl.sigImgW/2, y:tmpl.sigLineY+5, width:tmpl.sigImgW, height:tmpl.sigImgH }); }
      page.drawLine({ start:{x:sx-hl,y:tmpl.sigLineY}, end:{x:sx+hl,y:tmpl.sigLineY}, thickness:0.8, color:rgb(linc.r,linc.g,linc.b) });
      page.drawText(sname,{ x:sx-fB.widthOfTextAtSize(sname,12)/2, y:tmpl.sigNameY, size:12, font:fB, color:rgb(sc.r,sc.g,sc.b) });
      page.drawText(stitle,{ x:sx-fR.widthOfTextAtSize(stitle,10)/2, y:tmpl.sigTitleY, size:10, font:fR, color:rgb(sc.r*0.8,sc.g*0.8,sc.b*0.8) });
    };

    if(tmpl.singleSig){ drawSig(tmpl.s1x, sig.name||'', sig.title||'', true); }
    else {
      drawSig(tmpl.s1x, sig.name||'', sig.title||'', true);
      drawSig(tmpl.s2x, event.organizer||'', 'Programme Organiser', false);
    }
  }

  const bytes = await out.save();
  const blob  = new Blob([bytes],{type:'application/pdf'});
  const url   = URL.createObjectURL(blob);
  if(preview) return url;
  const a=document.createElement('a'); a.href=url;
  a.download=`Certificates-${event.event_code||'event'}-${Date.now()}.pdf`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
}

async function generateCertificate(tid, parts, event, sig, preview){
  const tmpl = PDF_TEMPLATES.find(t=>t.id===tid);
  if(!tmpl) throw new Error('Template not found: '+tid);
  return genPdf(tmpl, parts, event, sig, preview);
}

function buildTemplatePicker(parts, event, sig){
  document.getElementById('cert-picker-overlay')?.remove();
  const ov=document.createElement('div');
  ov.id='cert-picker-overlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.84);z-index:9999;overflow-y:auto;padding:24px 16px;display:flex;flex-direction:column;align-items:center;';
  const box=document.createElement('div');
  box.style.cssText='background:#fff;border-radius:14px;width:100%;max-width:880px;padding:24px;box-sizing:border-box;';
  box.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <h2 style="margin:0;font-size:17px;color:#EB001B;">🎓 Choose Certificate Template</h2>
      <button onclick="document.getElementById('cert-picker-overlay').remove()" style="background:none;border:1.5px solid #ccc;border-radius:8px;padding:5px 13px;cursor:pointer;font-size:13px;">✕</button>
    </div>
    <div id="cg" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;"></div>
    <div id="cpa" style="margin-top:18px;display:none;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong id="cpl" style="font-size:13px;color:#333;"></strong>
        <button onclick="document.getElementById('cpa').style.display='none'" style="background:none;border:1.5px solid #ccc;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:12px;">✕ Close Preview</button>
      </div>
      <iframe id="cpf" style="width:100%;height:510px;border:1.5px solid #ddd;border-radius:10px;"></iframe>
    </div>`;
  const grid=box.querySelector('#cg');

  PDF_TEMPLATES.forEach(t=>{
    // thumbnail: use the PNG we uploaded originally (same index number)
    const num=t.id.replace('p','');
    const thumb=`${BASE}cert-templates/t${num.padStart(2,'0')}.png`;
    const card=document.createElement('div');
    card.style.cssText='border:2px solid #eee;border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .15s,box-shadow .15s;';
    card.onmouseover=()=>{card.style.borderColor='#EB001B';card.style.boxShadow='0 4px 14px rgba(235,0,27,.15)';};
    card.onmouseout=()=>{card.style.borderColor='#eee';card.style.boxShadow='none';};
    card.innerHTML=`
      <div style="position:relative;width:100%;padding-top:70%;background:#f5f5f5;overflow:hidden;">
        <img src="${thumb}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
        <span style="position:absolute;top:5px;right:5px;background:rgba(0,148,68,.9);color:#fff;font-size:9px;padding:2px 7px;border-radius:4px;font-weight:700;">PDF</span>
      </div>
      <div style="padding:10px 12px;">
        <div style="font-weight:700;font-size:12px;color:#1a1a1a;margin-bottom:8px;">${t.name}</div>
        <div style="display:flex;gap:6px;">
          <button data-tid="${t.id}" data-ac="preview" style="flex:1;padding:7px 3px;font-size:11px;font-weight:700;border:1.5px solid #FF5F00;color:#FF5F00;background:#fff;border-radius:7px;cursor:pointer;">Preview</button>
          <button data-tid="${t.id}" data-ac="gen" style="flex:1;padding:7px 3px;font-size:11px;font-weight:700;border:none;background:#EB001B;color:#fff;border-radius:7px;cursor:pointer;">Generate All</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.addEventListener('click', async e=>{
    const btn=e.target.closest('button[data-tid]'); if(!btn) return;
    const tid=btn.dataset.tid, ac=btn.dataset.ac;
    const tmpl=PDF_TEMPLATES.find(t=>t.id===tid); if(!tmpl) return;
    if(ac==='preview'){
      const orig=btn.textContent; btn.textContent='⏳ Loading…'; btn.disabled=true;
      try{
        const url=await generateCertificate(tid,parts,event,sig,true);
        document.getElementById('cpl').textContent='Preview: '+tmpl.name;
        document.getElementById('cpf').src=url;
        const a=document.getElementById('cpa'); a.style.display='block'; a.scrollIntoView({behavior:'smooth'});
      }catch(err){alert('Preview error: '+err.message);console.error(err);}
      btn.textContent=orig; btn.disabled=false;
    }
    if(ac==='gen'){
      if(!confirm(`Generate certificates for ${parts.length} participant(s) using "${tmpl.name}"?`)) return;
      btn.textContent='⏳ Generating…'; btn.disabled=true;
      try{ await generateCertificate(tid,parts,event,sig,false); ov.remove(); }
      catch(err){alert('Error: '+err.message);console.error(err);}
      btn.textContent='Generate All'; btn.disabled=false;
    }
  });

  ov.appendChild(box); document.body.appendChild(ov);
}

async function openCertificatePicker(eventId){
  const { data:event } = await db.from('events').select('*').eq('id',eventId).single();
  const { data:att }   = await db.from('attendance').select('participant_id').eq('event_id',eventId);
  const ids=[...new Set((att||[]).map(a=>a.participant_id))];
  if(!ids.length){ alert('No signed participants found.'); return; }
  const { data:parts } = await db.from('participants').select('*').in('id',ids).order('code');
  const sig={ name:event.signatory_name||'', title:event.signatory_title||'', signatureUrl:event.signatory_signature_url||null };
  buildTemplatePicker(parts,event,sig);
}
