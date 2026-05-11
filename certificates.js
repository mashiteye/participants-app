// METSS LBG Certificate Engine v3
// pdf-lib for real Canva PDF templates (p01-p06)
// jsPDF fallback for PNG templates (n07-n12)

const BASE = (() => {
  const p = window.location.pathname.replace(/[^/]*$/, '');
  return window.location.origin + p;
})();

const PDF_TEMPLATES = [
  { id:'p01', name:'Blue & Gold Wave',      file:'cert-pdf/p01.pdf', landscape:true,  W:841.89, H:595.28, bg:[255,255,255], cx:421, presentedY:358, presentedSz:15, nameY:308, nameSz:44, desc1Y:248, desc2Y:228, descSz:13, codeY:208, codeSz:10, s1x:190, s2x:650, sigNameY:133, sigTitleY:115, sigLineY:147, sigImgW:110, sigImgH:52, nameColor:[0,0,80], labelColor:[45,45,45], descColor:[50,50,50], sigColor:[15,15,15], lineColor:[0,0,80], covers:[[195,340,455,28],[85,237,672,118],[172,184,498,78],[80,76,240,92],[522,76,240,92]] },
  { id:'p02', name:'Cream & Gold Modern',   file:'cert-pdf/p02.pdf', landscape:true,  W:841.89, H:595.28, bg:[248,244,236], cx:421, presentedY:358, presentedSz:15, nameY:306, nameSz:46, desc1Y:246, desc2Y:226, descSz:13, codeY:206, codeSz:10, s1x:165, s2x:592, sigNameY:129, sigTitleY:111, sigLineY:143, sigImgW:106, sigImgH:50, nameColor:[35,22,0],  labelColor:[55,38,5],   descColor:[55,42,5],   sigColor:[18,12,0],   lineColor:[100,75,10], covers:[[190,340,460,28],[95,237,652,116],[172,181,498,78],[52,72,245,95],[510,72,245,95]] },
  { id:'p03', name:'Black & Gold Ornate',   file:'cert-pdf/p03.pdf', landscape:true,  W:841.89, H:595.28, bg:[8,8,8],       cx:262, presentedY:362, presentedSz:13, nameY:302, nameSz:40, desc1Y:240, desc2Y:220, descSz:12, codeY:200, codeSz:10, s1x:262, s2x:262, sigNameY:125, sigTitleY:107, sigLineY:138, sigImgW:110, sigImgH:50, nameColor:[255,215,0], labelColor:[255,215,0], descColor:[205,185,155],sigColor:[255,215,0], lineColor:[255,215,0], singleSig:true, covers:[[50,345,442,28],[38,232,450,120],[52,180,448,78],[52,68,448,95]] },
  { id:'p04', name:'White & Gold Elegant',  file:'cert-pdf/p04.pdf', landscape:true,  W:841.89, H:595.28, bg:[253,250,245], cx:421, presentedY:355, presentedSz:15, nameY:300, nameSz:46, desc1Y:238, desc2Y:216, descSz:13, codeY:196, codeSz:10, s1x:168, s2x:642, sigNameY:125, sigTitleY:107, sigLineY:138, sigImgW:106, sigImgH:50, nameColor:[88,55,10],  labelColor:[68,48,8],   descColor:[62,44,8],   sigColor:[80,54,10],  lineColor:[140,100,20], covers:[[186,337,470,28],[85,232,672,122],[172,176,498,78],[52,68,245,95],[528,68,245,95]] },
  { id:'p05', name:'Silver & Purple',       file:'cert-pdf/p05.pdf', landscape:false, W:595.28, H:841.89, bg:[218,218,226], cx:298, presentedY:468, presentedSz:13, nameY:410, nameSz:42, desc1Y:346, desc2Y:326, descSz:12, codeY:305, codeSz:10, s1x:143, s2x:436, sigNameY:122, sigTitleY:104, sigLineY:135, sigImgW:106, sigImgH:50, nameColor:[38,0,78],   labelColor:[48,38,68],  descColor:[48,48,68],  sigColor:[35,25,58],  lineColor:[38,0,78],   covers:[[95,450,408,28],[45,368,506,120],[85,300,426,70],[42,80,215,95],[332,80,215,95]] },
  { id:'p06', name:'Gold Vintage Floral',   file:'cert-pdf/p06.pdf', landscape:true,  W:841.89, H:595.28, bg:[254,252,247], cx:421, presentedY:358, presentedSz:15, nameY:298, nameSz:48, desc1Y:238, desc2Y:218, descSz:13, codeY:196, codeSz:10, s1x:155, s2x:592, sigNameY:123, sigTitleY:104, sigLineY:136, sigImgW:106, sigImgH:50, nameColor:[139,90,0], labelColor:[88,58,4],   descColor:[68,50,4],   sigColor:[139,90,0],  lineColor:[139,90,0],  covers:[[186,340,470,28],[88,230,666,126],[175,178,492,78],[40,68,248,98],[518,68,248,98]] },
];

const PNG_TEMPLATES = [
  { id:'n07', name:'Black & Gold Luxury',  file:'cert-templates/t07.png', landscape:true,  dark:true,  nameSz:0.072, nameColor:[255,215,0], labelColor:[230,210,170], descColor:[210,195,160], presentedY:0.360, nameY:0.465, desc1Y:0.600, desc2Y:0.636, sigY:0.818, s1x:0.230, s2x:0.680 },
  { id:'n08', name:'Blue Elegant Wave',    file:'cert-templates/t08.png', landscape:true,  dark:false, nameSz:0.068, nameColor:[0,0,100],   labelColor:[0,0,80],     descColor:[20,20,60],    presentedY:0.370, nameY:0.470, desc1Y:0.605, desc2Y:0.640, sigY:0.815, s1x:0.190, s2x:0.690 },
  { id:'n09', name:'Cream Blue Geometric', file:'cert-templates/t09.png', landscape:true,  dark:false, nameSz:0.065, nameColor:[139,100,0], labelColor:[20,30,70],   descColor:[20,30,70],    presentedY:0.355, nameY:0.465, desc1Y:0.600, desc2Y:0.636, sigY:0.815, s1x:0.155, s2x:0.650 },
  { id:'n10', name:'Gold Pattern Modern',  file:'cert-templates/t10.png', landscape:true,  dark:false, nameSz:0.068, nameColor:[0,0,0],     labelColor:[20,20,20],   descColor:[30,30,30],    presentedY:0.368, nameY:0.470, desc1Y:0.605, desc2Y:0.640, sigY:0.812, s1x:0.175, s2x:0.640 },
  { id:'n11', name:'Blue & Gold Classic',  file:'cert-templates/t11.png', landscape:true,  dark:false, nameSz:0.072, nameColor:[0,0,60],    labelColor:[30,30,30],   descColor:[30,30,30],    presentedY:0.368, nameY:0.470, desc1Y:0.605, desc2Y:0.640, sigY:0.805, s1x:0.225, s2x:0.725 },
  { id:'n12', name:'Gold & Blue Modern',   file:'cert-templates/t12.png', landscape:true,  dark:false, nameSz:0.072, nameColor:[0,0,0],     labelColor:[20,20,20],   descColor:[20,20,20],    presentedY:0.340, nameY:0.445, desc1Y:0.570, desc2Y:0.605, sigY:0.810, s1x:0.500, s2x:0.500, singleSig:true },
];

// helpers
function r01(a){ return { r:a[0]/255, g:a[1]/255, b:a[2]/255 }; }

async function fetchBytes(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('Fetch failed: '+url+' '+res.status);
  return new Uint8Array(await res.arrayBuffer());
}

async function toBase64(url){
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((ok,err)=>{ const r=new FileReader(); r.onload=()=>ok(r.result); r.onerror=err; r.readAsDataURL(blob); });
}

function evtDesc(event){
  const d = event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '';
  const p = event.program || event.organizer || '';
  const l1 = `For participating in "${event.name}"`;
  const l2 = [p?'organised by '+p:'', d?'on '+d:''].filter(Boolean).join(', ');
  return { l1, l2 };
}

// pdf-lib generator
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

    // name
    const name = p.name || 'Participant';
    let nsz = tmpl.nameSz;
    const maxW = W * (tmpl.singleSig ? 0.55 : 0.72);
    while(fBI.widthOfTextAtSize(name,nsz) > maxW && nsz > 20) nsz -= 2;
    const nw = fBI.widthOfTextAtSize(name,nsz);
    page.drawText(name,{ x:cx-nw/2, y:tmpl.nameY, size:nsz, font:fBI, color:rgb(nc.r,nc.g,nc.b) });
    const ulL = Math.min(nw+20, W*0.68);
    page.drawLine({ start:{x:cx-ulL/2,y:tmpl.nameY-5}, end:{x:cx+ulL/2,y:tmpl.nameY-5}, thickness:1, color:rgb(nc.r,nc.g,nc.b) });

    // description
    const { l1, l2 } = evtDesc(event);
    page.drawText(l1,{ x:cx-fR.widthOfTextAtSize(l1,tmpl.descSz)/2, y:tmpl.desc1Y, size:tmpl.descSz, font:fR, color:rgb(dc.r,dc.g,dc.b) });
    if(l2) page.drawText(l2,{ x:cx-fR.widthOfTextAtSize(l2,tmpl.descSz)/2, y:tmpl.desc2Y, size:tmpl.descSz, font:fR, color:rgb(dc.r,dc.g,dc.b) });

    // code
    const ct='Participant Code: '+(p.code||'—');
    page.drawText(ct,{ x:cx-fH.widthOfTextAtSize(ct,tmpl.codeSz)/2, y:tmpl.codeY, size:tmpl.codeSz, font:fH, color:rgb(lc.r*0.7,lc.g*0.7,lc.b*0.7) });

    // sigs
    const hl=68;
    const drawSig=(sx,sname,stitle,withImg)=>{
      if(withImg && sigEmb){ page.drawImage(sigEmb,{ x:sx-tmpl.sigImgW/2, y:tmpl.sigLineY+5, width:tmpl.sigImgW, height:tmpl.sigImgH }); }
      page.drawLine({ start:{x:sx-hl,y:tmpl.sigLineY}, end:{x:sx+hl,y:tmpl.sigLineY}, thickness:0.8, color:rgb(linc.r,linc.g,linc.b) });
      page.drawText(sname,{ x:sx-fB.widthOfTextAtSize(sname,12)/2, y:tmpl.sigNameY, size:12, font:fB, color:rgb(sc.r,sc.g,sc.b) });
      page.drawText(stitle,{ x:sx-fR.widthOfTextAtSize(stitle,10)/2, y:tmpl.sigTitleY, size:10, font:fR, color:rgb(sc.r*0.85,sc.g*0.85,sc.b*0.85) });
    };

    if(tmpl.singleSig){ drawSig(tmpl.s1x, sig.name||'', sig.title||'', true); }
    else { drawSig(tmpl.s1x, sig.name||'', sig.title||'', true); drawSig(tmpl.s2x, event.organizer||'', 'Programme Organiser', false); }
  }

  const bytes = await out.save();
  const blob  = new Blob([bytes],{type:'application/pdf'});
  const url   = URL.createObjectURL(blob);
  if(preview) return url;
  const a=document.createElement('a'); a.href=url; a.download=`Certs-${event.event_code||'event'}.pdf`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}

// jsPDF generator for PNG templates
async function genPng(tmpl, parts, event, sig, preview){
  const { jsPDF } = window.jspdf;
  const W=tmpl.landscape?841.89:595.28, H=tmpl.landscape?595.28:841.89;
  const doc=new jsPDF({orientation:tmpl.landscape?'landscape':'portrait',unit:'pt',format:'a4'});
  let bg=null; try{ bg=await toBase64(BASE+tmpl.file); }catch(e){}
  let sigImg=null; if(sig.signatureUrl){ try{ sigImg=await toBase64(sig.signatureUrl); }catch(e){} }
  const list=preview?parts.slice(0,1):parts;
  for(let i=0;i<list.length;i++){
    const p=list[i];
    if(i>0) doc.addPage([W,H],tmpl.landscape?'landscape':'portrait');
    if(bg) doc.addImage(bg,'PNG',0,0,W,H);
    const cx=tmpl.singleSig?tmpl.s1x*W:W/2;
    const nc=tmpl.nameColor,lc=tmpl.labelColor,dc=tmpl.descColor;
    doc.setFont('times','italic'); doc.setFontSize(H*0.027); doc.setTextColor(...lc);
    doc.text('This certificate is presented to:',cx,H*tmpl.presentedY,{align:'center'});
    doc.setFont('times','bolditalic');
    let ns=H*tmpl.nameSz; doc.setFontSize(ns); doc.setTextColor(...nc);
    while(doc.getTextWidth(p.name||'')>W*0.70&&ns>20){ns-=2;doc.setFontSize(ns);}
    doc.text(p.name||'Participant',cx,H*tmpl.nameY,{align:'center'});
    const uw=Math.min(doc.getTextWidth(p.name||''),W*0.65);
    doc.setDrawColor(...nc); doc.setLineWidth(0.8);
    doc.line(cx-uw/2,H*tmpl.nameY+H*0.012,cx+uw/2,H*tmpl.nameY+H*0.012);
    const {l1,l2}=evtDesc(event);
    doc.setFont('times','normal'); doc.setFontSize(H*0.024); doc.setTextColor(...dc);
    doc.text(l1,cx,H*tmpl.desc1Y,{align:'center'});
    if(l2) doc.text(l2,cx,H*tmpl.desc2Y,{align:'center'});
    const ll=W*0.12;
    const dS=(sx,sn,st,wi)=>{
      const sy=H*tmpl.sigY;
      if(wi&&sigImg) doc.addImage(sigImg,'PNG',sx-W*0.055,sy-H*0.065,W*0.11,H*0.055);
      doc.setDrawColor(...lc); doc.setLineWidth(0.8); doc.line(sx-ll,sy,sx+ll,sy);
      doc.setFont('times','bold'); doc.setFontSize(H*0.024); doc.setTextColor(...(tmpl.sigColor||lc));
      doc.text(sn,sx,sy+H*0.030,{align:'center'});
      doc.setFont('times','normal'); doc.setFontSize(H*0.020);
      doc.text(st,sx,sy+H*0.053,{align:'center'});
    };
    if(tmpl.singleSig) dS(cx,sig.name||'',sig.title||'',true);
    else { dS(W*tmpl.s1x,sig.name||'',sig.title||'',true); dS(W*tmpl.s2x,event.organizer||'','Programme Organiser',false); }
  }
  if(preview){ const blob=doc.output('blob'); return URL.createObjectURL(blob); }
  doc.save(`Certs-${event.event_code||'event'}.pdf`);
}

// dispatcher
async function generateCertificate(tid,parts,event,sig,preview){
  const pt=PDF_TEMPLATES.find(t=>t.id===tid);
  const nt=PNG_TEMPLATES.find(t=>t.id===tid);
  if(pt) return genPdf(pt,parts,event,sig,preview);
  if(nt) return genPng(nt,parts,event,sig,preview);
  throw new Error('Template not found: '+tid);
}

// picker UI
function buildTemplatePicker(parts,event,sig){
  document.getElementById('cert-picker-overlay')?.remove();
  const all=[...PDF_TEMPLATES,...PNG_TEMPLATES];
  const ov=document.createElement('div');
  ov.id='cert-picker-overlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.84);z-index:9999;overflow-y:auto;padding:24px 16px;display:flex;flex-direction:column;align-items:center;';
  const box=document.createElement('div');
  box.style.cssText='background:#fff;border-radius:14px;width:100%;max-width:880px;padding:24px;box-sizing:border-box;';
  box.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <h2 style="margin:0;font-size:17px;color:#EB001B;">🎓 Choose Certificate Template</h2>
      <button onclick="document.getElementById('cert-picker-overlay').remove()" style="background:none;border:1.5px solid #ccc;border-radius:8px;padding:5px 13px;cursor:pointer;font-size:13px;">✕</button>
    </div>
    <p style="margin:0 0 16px;font-size:11px;color:#888;"><strong style="color:#009444;">● PDF</strong> = real Canva template &nbsp;|&nbsp; <strong style="color:#FF5F00;">● PNG</strong> = image background</p>
    <div id="cg" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:12px;"></div>
    <div id="cpa" style="margin-top:18px;display:none;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong id="cpl" style="font-size:13px;color:#333;"></strong>
        <button onclick="document.getElementById('cpa').style.display='none'" style="background:none;border:1.5px solid #ccc;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:12px;">✕</button>
      </div>
      <iframe id="cpf" style="width:100%;height:500px;border:1.5px solid #ddd;border-radius:10px;"></iframe>
    </div>`;
  const grid=box.querySelector('#cg');
  all.forEach(t=>{
    const isPdf=t.file.startsWith('cert-pdf');
    // thumbnail: for PDF templates use the PNG we already have in cert-templates/
    const num=t.id.replace(/[a-z]/g,'');
    const thumb=isPdf ? `${BASE}cert-templates/t${num.padStart(2,'0')}.png` : `${BASE}${t.file}`;
    const card=document.createElement('div');
    card.style.cssText='border:2px solid #eee;border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .15s,box-shadow .15s;';
    card.onmouseover=()=>{card.style.borderColor='#EB001B';card.style.boxShadow='0 4px 14px rgba(235,0,27,.15)';};
    card.onmouseout=()=>{card.style.borderColor='#eee';card.style.boxShadow='none';};
    card.innerHTML=`
      <div style="position:relative;width:100%;padding-top:70%;background:#f5f5f5;overflow:hidden;">
        <img src="${thumb}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
        <span style="position:absolute;top:5px;right:5px;background:${isPdf?'rgba(0,148,68,.88)':'rgba(255,95,0,.88)'};color:#fff;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;">${isPdf?'PDF':'PNG'}</span>
      </div>
      <div style="padding:9px 11px;">
        <div style="font-weight:700;font-size:12px;color:#1a1a1a;margin-bottom:7px;">${t.name}</div>
        <div style="display:flex;gap:6px;">
          <button data-tid="${t.id}" data-ac="preview" style="flex:1;padding:6px 3px;font-size:11px;font-weight:700;border:1.5px solid #FF5F00;color:#FF5F00;background:#fff;border-radius:7px;cursor:pointer;">Preview</button>
          <button data-tid="${t.id}" data-ac="gen" style="flex:1;padding:6px 3px;font-size:11px;font-weight:700;border:none;background:#EB001B;color:#fff;border-radius:7px;cursor:pointer;">Generate All</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  grid.addEventListener('click',async e=>{
    const btn=e.target.closest('button[data-tid]'); if(!btn) return;
    const tid=btn.dataset.tid, ac=btn.dataset.ac;
    const tmpl=all.find(t=>t.id===tid); if(!tmpl) return;
    if(ac==='preview'){
      const orig=btn.textContent; btn.textContent='⏳'; btn.disabled=true;
      try{
        const url=await generateCertificate(tid,parts,event,sig,true);
        document.getElementById('cpl').textContent='Preview: '+tmpl.name;
        document.getElementById('cpf').src=url;
        const a=document.getElementById('cpa'); a.style.display='block'; a.scrollIntoView({behavior:'smooth'});
      }catch(err){alert('Preview error: '+err.message);console.error(err);}
      btn.textContent=orig; btn.disabled=false;
    }
    if(ac==='gen'){
      if(!confirm(`Generate for ${parts.length} participant(s) using "${tmpl.name}"?`)) return;
      btn.textContent='⏳'; btn.disabled=true;
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
