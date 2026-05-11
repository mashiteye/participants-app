// ════════════════════════════════════════════════════════════════════
// CERTIFICATE TEMPLATES — METSS LBG Participant Registration App
// 10 professionally designed certificate templates.
// Each function renders one certificate page given (doc, ctx)
// ════════════════════════════════════════════════════════════════════

window.CERT_TEMPLATES = {

  // ───────────────────────────────────────────────────────────────
  // 1. CLASSIC MCF — red/orange/yellow gradient with black footer
  // ───────────────────────────────────────────────────────────────
  classic_mcf: {
    name: 'Classic MCF',
    desc: 'Red/orange gradient header, MCF brand colours, formal',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const RED=[235,0,27], ORANGE=[255,95,0], YELLOW=[247,158,27], BLACK=[0,0,0], WHITE=[255,255,255];
      doc.setFillColor(...WHITE); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...RED); doc.rect(0,0,W,55,'F');
      doc.setFillColor(...ORANGE); doc.rect(0,40,W,15,'F');
      doc.setFillColor(...YELLOW); doc.rect(0,55,W,6,'F');
      doc.setFillColor(...BLACK); doc.rect(0,H-55,W,55,'F');
      doc.setFillColor(...YELLOW); doc.rect(0,H-55,W,8,'F');
      doc.setFillColor(...RED); doc.rect(0,61,10,H-116,'F');
      doc.setFillColor(...ORANGE); doc.rect(W-10,61,10,H-116,'F');
      doc.setTextColor(...WHITE); doc.setFontSize(13); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE OF PARTICIPATION',W/2,28,{align:'center'});
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      doc.text(dateStr,W-30,H-22,{align:'right'});
      const CX=40, CY=85;
      doc.setTextColor(120,120,120); doc.setFontSize(13); doc.setFont('helvetica','italic');
      doc.text('This is to certify that',CX,CY);
      const fs = p.name.length>25?32:p.name.length>20?36:42;
      doc.setFontSize(fs); doc.setFont('helvetica','bold'); doc.setTextColor(...RED);
      doc.text(p.name||'',CX,CY+50);
      const nw=Math.min(doc.getTextWidth(p.name||''),W-80);
      doc.setFillColor(...YELLOW); doc.rect(CX,CY+56,nw,4,'F');
      const det=[p.position_title,p.org].filter(Boolean).join('   ·   ');
      doc.setTextColor(80,80,80); doc.setFontSize(12); doc.setFont('helvetica','normal');
      if(det) doc.text(det,CX,CY+78);
      doc.setTextColor(100,100,100); doc.setFontSize(13); doc.setFont('helvetica','italic');
      doc.text('has successfully participated in',CX,CY+108);
      doc.setTextColor(...ORANGE); doc.setFontSize(22); doc.setFont('helvetica','bold');
      const evLines=doc.splitTextToSize(evName,W-320);
      doc.text(evLines,CX,CY+135);
      doc.setTextColor(100,100,100); doc.setFontSize(11); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text('Organised by  '+ev.organizer,CX,CY+135+evLines.length*26+8);
      const SX=W-260, SY=H-110;
      if(sigB64) doc.addImage(sigB64,'PNG',SX,SY-45,150,40);
      doc.setDrawColor(...BLACK); doc.setLineWidth(1); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',SX,SY+14);
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
      if(ev.signatory_title) doc.text(ev.signatory_title,SX,SY+26);
      doc.setFillColor(...YELLOW); doc.roundedRect(CX,H-114,90,20,4,4,'F');
      doc.setTextColor(...BLACK); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(p.code||'',CX+45,H-100,{align:'center'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 2. MODERN MINIMALIST — clean white, thin teal border
  // ───────────────────────────────────────────────────────────────
  modern_minimalist: {
    name: 'Modern Minimalist',
    desc: 'Clean white background, thin teal border, sans-serif',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const TEAL=[47,123,107], GREY=[80,80,80], LGREY=[180,180,180], DGREY=[40,40,40];
      doc.setFillColor(255,255,255); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...TEAL); doc.setLineWidth(1.5);
      doc.rect(30,30,W-60,H-60);
      doc.setTextColor(...TEAL); doc.setFontSize(10); doc.setFont('helvetica','normal');
      doc.text('CERTIFICATE',W/2,80,{align:'center',charSpace:8});
      doc.setFontSize(28); doc.setFont('helvetica','bold'); doc.setTextColor(...DGREY);
      doc.text('Of Participation',W/2,115,{align:'center'});
      doc.setDrawColor(...TEAL); doc.setLineWidth(0.5); doc.line(W/2-30,128,W/2+30,128);
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','normal');
      doc.text('Presented to',W/2,170,{align:'center'});
      const fs = p.name.length>25?34:p.name.length>20?40:46;
      doc.setFontSize(fs); doc.setFont('helvetica','bold'); doc.setTextColor(...DGREY);
      doc.text(p.name||'',W/2,210,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','italic');
      doc.text('for active participation in',W/2,245,{align:'center'});
      doc.setFontSize(18); doc.setFont('helvetica','bold'); doc.setTextColor(...TEAL);
      const evLines = doc.splitTextToSize(evName,W-200);
      doc.text(evLines,W/2,275,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text(ev.organizer + '  ·  ' + dateStr, W/2, 275 + evLines.length*20 + 15, {align:'center'});
      else doc.text(dateStr, W/2, 275 + evLines.length*20 + 15, {align:'center'});
      const SX=W/2-100, SY=H-90;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+25,SY-38,150,35);
      doc.setDrawColor(...DGREY); doc.setLineWidth(0.8); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...DGREY); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',W/2,SY+14,{align:'center'});
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...GREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,W/2,SY+26,{align:'center'});
      doc.setTextColor(...LGREY); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text('Certificate ID: ' + (p.code||''),W-50,H-40,{align:'right'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 3. ELEGANT GOLD — double gold border, serif fonts
  // ───────────────────────────────────────────────────────────────
  elegant_gold: {
    name: 'Elegant Gold',
    desc: 'Ivory background, double gold border, traditional serif',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const GOLD=[180,140,40], DGOLD=[130,100,20], CREAM=[253,250,243], DGREY=[40,40,40], GREY=[100,100,100];
      doc.setFillColor(...CREAM); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...GOLD); doc.setLineWidth(2.5); doc.rect(25,25,W-50,H-50);
      doc.setLineWidth(0.5); doc.rect(35,35,W-70,H-70);
      [[35,35],[W-35,35],[35,H-35],[W-35,H-35]].forEach(([x,y])=>{
        doc.setFillColor(...GOLD); doc.circle(x,y,3,'F');
      });
      doc.setTextColor(...DGOLD); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('— Certificate of —',W/2,75,{align:'center'});
      doc.setFontSize(32); doc.setFont('times','bold'); doc.setTextColor(...DGREY);
      doc.text('Participation',W/2,115,{align:'center'});
      doc.setDrawColor(...GOLD); doc.setLineWidth(1); doc.line(W/2-50,127,W/2+50,127);
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('This certificate is proudly presented to',W/2,160,{align:'center'});
      const fs = p.name.length>25?36:p.name.length>20?42:48;
      doc.setFontSize(fs); doc.setFont('times','italic'); doc.setTextColor(...DGOLD);
      doc.text(p.name||'',W/2,205,{align:'center'});
      const nw=doc.getTextWidth(p.name||'');
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
      doc.line(W/2-nw/2-10,212,W/2+nw/2+10,212);
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','normal');
      doc.text('in recognition of active participation in',W/2,240,{align:'center'});
      doc.setFontSize(18); doc.setFont('times','bold'); doc.setTextColor(...DGREY);
      const evLines = doc.splitTextToSize(evName,W-200);
      doc.text(evLines,W/2,270,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      if(ev.organizer) doc.text('hosted by '+ev.organizer,W/2,270+evLines.length*22+10,{align:'center'});
      const SX=W/2-100, SY=H-95;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+25,SY-40,150,38);
      doc.setDrawColor(...DGREY); doc.setLineWidth(0.8); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...DGREY); doc.setFontSize(11); doc.setFont('times','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',W/2,SY+14,{align:'center'});
      doc.setFontSize(9); doc.setFont('times','italic'); doc.setTextColor(...GREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,W/2,SY+26,{align:'center'});
      doc.setTextColor(...DGOLD); doc.setFontSize(9); doc.setFont('times','italic');
      doc.text(dateStr,55,H-50);
      doc.text(p.code||'',W-55,H-50,{align:'right'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 4. CORPORATE BLOCKS — solid colour blocks, bold
  // ───────────────────────────────────────────────────────────────
  corporate_blocks: {
    name: 'Corporate Blocks',
    desc: 'Bold red side panel, orange accent, modern corporate',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const RED=[235,0,27], ORANGE=[255,95,0], BLACK=[20,20,20], GREY=[100,100,100], WHITE=[255,255,255];
      doc.setFillColor(...WHITE); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...RED); doc.rect(0,0,140,H,'F');
      doc.setFillColor(...ORANGE); doc.rect(140,0,15,H,'F');
      doc.setTextColor(...WHITE); doc.setFontSize(12); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE',75,80,{align:'center'});
      doc.text('OF',75,100,{align:'center'});
      doc.text('PARTICIPATION',75,120,{align:'center'});
      doc.setDrawColor(...WHITE); doc.setLineWidth(1); doc.line(40,135,110,135);
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      doc.text(dateStr,75,160,{align:'center'});
      doc.setFontSize(8); doc.text('Reference',75,H-100,{align:'center'});
      doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(p.code||'',75,H-82,{align:'center'});
      const CX=180;
      doc.setTextColor(...GREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      doc.text('AWARDED TO',CX,90);
      doc.setDrawColor(...ORANGE); doc.setLineWidth(1.5); doc.line(CX,98,CX+50,98);
      const fs = p.name.length>25?28:p.name.length>20?34:40;
      doc.setFontSize(fs); doc.setFont('helvetica','bold'); doc.setTextColor(...BLACK);
      doc.text(p.name||'',CX,135);
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det) { doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.text(det,CX,158); }
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','normal');
      doc.text('For successful participation in',CX,195);
      doc.setTextColor(...RED); doc.setFontSize(20); doc.setFont('helvetica','bold');
      const evLines=doc.splitTextToSize(evName,W-CX-40);
      doc.text(evLines,CX,225);
      doc.setTextColor(...GREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text(ev.organizer,CX,225+evLines.length*22+5);
      const SX=CX, SY=H-80;
      if(sigB64) doc.addImage(sigB64,'PNG',SX,SY-42,140,38);
      doc.setDrawColor(...BLACK); doc.setLineWidth(0.8); doc.line(SX,SY,SX+180,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',SX,SY+14);
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...GREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,SX,SY+26);
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 5. GEOMETRIC MODERN — triangle accents in corners
  // ───────────────────────────────────────────────────────────────
  geometric: {
    name: 'Geometric Modern',
    desc: 'Triangle corner accents, contemporary geometric',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const TEAL=[47,123,107], ORANGE=[255,95,0], YELLOW=[247,158,27], BLACK=[30,30,30], GREY=[100,100,100], LGREY=[200,200,200];
      doc.setFillColor(255,255,255); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...TEAL); doc.triangle(0,0,100,0,0,100,'F');
      doc.setFillColor(...ORANGE); doc.triangle(0,0,60,0,0,60,'F');
      doc.setFillColor(...YELLOW); doc.triangle(W,0,W,80,W-80,0,'F');
      doc.setFillColor(...ORANGE); doc.triangle(W,H,W-100,H,W,H-100,'F');
      doc.setFillColor(...TEAL); doc.triangle(0,H,80,H,0,H-80,'F');
      doc.setTextColor(...TEAL); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE OF PARTICIPATION',W/2,75,{align:'center',charSpace:5});
      doc.setDrawColor(...ORANGE); doc.setLineWidth(2); doc.line(W/2-80,85,W/2+80,85);
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','italic');
      doc.text('proudly presented to',W/2,120,{align:'center'});
      const fs = p.name.length>25?34:p.name.length>20?40:46;
      doc.setFontSize(fs); doc.setFont('helvetica','bold'); doc.setTextColor(...BLACK);
      doc.text(p.name||'',W/2,165,{align:'center'});
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det) { doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.text(det,W/2,190,{align:'center'}); }
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','italic');
      doc.text('for successful participation in',W/2,220,{align:'center'});
      doc.setTextColor(...ORANGE); doc.setFontSize(20); doc.setFont('helvetica','bold');
      const evLines=doc.splitTextToSize(evName,W-160);
      doc.text(evLines,W/2,250,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text(ev.organizer,W/2,250+evLines.length*22+8,{align:'center'});
      const SX=W/2-100, SY=H-90;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+25,SY-40,150,38);
      doc.setDrawColor(...BLACK); doc.setLineWidth(0.6); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',W/2,SY+14,{align:'center'});
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...GREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,W/2,SY+26,{align:'center'});
      doc.setTextColor(...LGREY); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text(dateStr,40,H-40);
      doc.text(p.code||'',W-40,H-40,{align:'right'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 6. ACHIEVEMENT MEDAL — centered medal, traditional
  // ───────────────────────────────────────────────────────────────
  achievement_medal: {
    name: 'Achievement Medal',
    desc: 'Centered medal motif, traditional recognition',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const GOLD=[200,160,50], DGOLD=[150,110,20], RED=[235,0,27], BLACK=[30,30,30], GREY=[100,100,100], CREAM=[253,250,243];
      doc.setFillColor(...CREAM); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...GOLD); doc.setLineWidth(1.5); doc.rect(35,35,W-70,H-70);
      const MX=W/2, MY=85;
      doc.setFillColor(...GOLD); doc.circle(MX,MY,25,'F');
      doc.setFillColor(...DGOLD); doc.circle(MX,MY,21,'F');
      doc.setFillColor(...GOLD); doc.circle(MX,MY,17,'F');
      doc.setTextColor(...CREAM); doc.setFontSize(11); doc.setFont('times','bold');
      doc.text('★',MX,MY+4,{align:'center'});
      doc.setFillColor(...RED); doc.triangle(MX-12,MY+22,MX+12,MY+22,MX-12,MY+45,'F');
      doc.setFillColor(...GOLD); doc.triangle(MX+12,MY+22,MX-12,MY+45,MX+12,MY+45,'F');
      doc.setTextColor(...DGOLD); doc.setFontSize(10); doc.setFont('times','bold');
      doc.text('CERTIFICATE OF ACHIEVEMENT',W/2,150,{align:'center',charSpace:6});
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(W/2-100,158,W/2+100,158);
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('This certificate is awarded to',W/2,185,{align:'center'});
      const fs = p.name.length>25?32:p.name.length>20?38:44;
      doc.setFontSize(fs); doc.setFont('times','bold'); doc.setTextColor(...BLACK);
      doc.text(p.name||'',W/2,225,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('for outstanding participation in',W/2,255,{align:'center'});
      doc.setTextColor(...DGOLD); doc.setFontSize(18); doc.setFont('times','bold');
      const evLines=doc.splitTextToSize(evName,W-200);
      doc.text(evLines,W/2,280,{align:'center'});
      const SX=W/2-100, SY=H-90;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+25,SY-38,150,35);
      doc.setDrawColor(...BLACK); doc.setLineWidth(0.6); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(11); doc.setFont('times','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',W/2,SY+14,{align:'center'});
      doc.setFontSize(9); doc.setFont('times','italic'); doc.setTextColor(...GREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,W/2,SY+26,{align:'center'});
      doc.setTextColor(...DGOLD); doc.setFontSize(8); doc.setFont('times','italic');
      doc.text(dateStr,55,H-45); doc.text(p.code||'',W-55,H-45,{align:'right'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 7. DIPLOMA CLASSIC — university diploma style
  // ───────────────────────────────────────────────────────────────
  diploma_classic: {
    name: 'Diploma Classic',
    desc: 'Traditional university diploma layout',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const NAVY=[20,40,80], GOLD=[180,140,40], BLACK=[20,20,20], GREY=[100,100,100], LGREY=[230,230,230], OFFWHITE=[252,251,247];
      doc.setFillColor(...OFFWHITE); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...NAVY); doc.setLineWidth(3); doc.rect(20,20,W-40,H-40);
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.8); doc.rect(28,28,W-56,H-56);
      doc.setTextColor(...NAVY); doc.setFontSize(11); doc.setFont('times','bold');
      doc.text(ev.organizer ? ev.organizer.toUpperCase() : 'METSS LBG',W/2,60,{align:'center',charSpace:4});
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(W/2-150,67,W/2+150,67);
      doc.setTextColor(...NAVY); doc.setFontSize(28); doc.setFont('times','bold');
      doc.text('Certificate of Participation',W/2,105,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('Be it known that',W/2,140,{align:'center'});
      const fs = p.name.length>25?34:p.name.length>20?40:46;
      doc.setFontSize(fs); doc.setFont('times','italic'); doc.setTextColor(...NAVY);
      doc.text(p.name||'',W/2,185,{align:'center'});
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
      const nw=doc.getTextWidth(p.name||'');
      doc.line(W/2-nw/2-15,193,W/2+nw/2+15,193);
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','normal');
      doc.text('has duly participated in the program',W/2,225,{align:'center'});
      doc.setTextColor(...BLACK); doc.setFontSize(20); doc.setFont('times','bold');
      const evLines=doc.splitTextToSize(evName,W-200);
      doc.text(evLines,W/2,255,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('and is hereby presented this certificate on the date below',W/2,255+evLines.length*22+8,{align:'center'});
      const SX1=80, SX2=W-280, SY=H-85;
      if(sigB64) doc.addImage(sigB64,'PNG',SX2,SY-38,150,35);
      doc.setDrawColor(...BLACK); doc.setLineWidth(0.8);
      doc.line(SX1,SY,SX1+200,SY); doc.line(SX2,SY,SX2+200,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(10); doc.setFont('times','bold');
      doc.text(dateStr,SX1+100,SY+14,{align:'center'});
      doc.text(ev.signatory_name||'Authorised Signatory',SX2+100,SY+14,{align:'center'});
      doc.setFontSize(8); doc.setFont('times','italic'); doc.setTextColor(...GREY);
      doc.text('Date',SX1+100,SY+26,{align:'center'});
      doc.text(ev.signatory_title||'Signatory',SX2+100,SY+26,{align:'center'});
      doc.setTextColor(...GOLD); doc.setFontSize(8); doc.setFont('times','italic');
      doc.text('Ref: ' + (p.code||''),W/2,H-35,{align:'center'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 8. ORNAMENTAL — decorative corner flourishes
  // ───────────────────────────────────────────────────────────────
  ornamental: {
    name: 'Ornamental',
    desc: 'Decorative corner flourishes, prestige feel',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const PLUM=[80,30,80], GOLD=[200,160,50], BLACK=[30,30,30], GREY=[100,100,100], CREAM=[253,250,243];
      doc.setFillColor(...CREAM); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...PLUM); doc.setLineWidth(2); doc.rect(30,30,W-60,H-60);
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.6); doc.rect(40,40,W-80,H-80);
      // Corner flourishes
      [[40,40],[W-40,40],[40,H-40],[W-40,H-40]].forEach(([x,y],i)=>{
        doc.setDrawColor(...GOLD); doc.setLineWidth(1);
        const ox=i%2===0?15:-15, oy=i<2?15:-15;
        doc.line(x+ox*0.3,y,x+ox,y); doc.line(x,y+oy*0.3,x,y+oy);
        doc.setFillColor(...GOLD); doc.circle(x+ox*0.6,y+oy*0.6,2,'F');
      });
      doc.setTextColor(...PLUM); doc.setFontSize(10); doc.setFont('times','italic');
      doc.text('~ With Distinction ~',W/2,70,{align:'center'});
      doc.setFontSize(32); doc.setFont('times','bold'); doc.setTextColor(...PLUM);
      doc.text('Certificate of Participation',W/2,110,{align:'center'});
      doc.setFillColor(...GOLD); doc.circle(W/2-90,123,1.5,'F'); doc.circle(W/2,123,1.5,'F'); doc.circle(W/2+90,123,1.5,'F');
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('Bestowed upon',W/2,155,{align:'center'});
      const fs = p.name.length>25?34:p.name.length>20?40:48;
      doc.setFontSize(fs); doc.setFont('times','italic'); doc.setTextColor(...PLUM);
      doc.text(p.name||'',W/2,200,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('times','italic');
      doc.text('in honoured recognition of participation in',W/2,235,{align:'center'});
      doc.setTextColor(...BLACK); doc.setFontSize(18); doc.setFont('times','bold');
      const evLines=doc.splitTextToSize(evName,W-200);
      doc.text(evLines,W/2,265,{align:'center'});
      doc.setTextColor(...GREY); doc.setFontSize(10); doc.setFont('times','italic');
      if(ev.organizer) doc.text('organised by '+ev.organizer,W/2,265+evLines.length*22+10,{align:'center'});
      const SX=W/2-100, SY=H-90;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+25,SY-38,150,35);
      doc.setDrawColor(...BLACK); doc.setLineWidth(0.6); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(11); doc.setFont('times','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',W/2,SY+14,{align:'center'});
      doc.setFontSize(9); doc.setFont('times','italic'); doc.setTextColor(...GREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,W/2,SY+26,{align:'center'});
      doc.setTextColor(...PLUM); doc.setFontSize(8); doc.setFont('times','italic');
      doc.text(dateStr,60,H-50); doc.text(p.code||'',W-60,H-50,{align:'right'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 9. TECH MODERN — dark theme with neon accents
  // ───────────────────────────────────────────────────────────────
  tech_modern: {
    name: 'Tech Modern',
    desc: 'Dark theme, neon orange accents, contemporary tech',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const DARK=[25,30,40], NEON=[255,95,0], WHITE=[255,255,255], LGREY=[200,200,200], MGREY=[140,140,140], TEAL=[80,200,180];
      doc.setFillColor(...DARK); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...NEON); doc.rect(0,0,W,4,'F');
      doc.setFillColor(...TEAL); doc.rect(0,H-4,W,4,'F');
      doc.setFillColor(...NEON); doc.rect(0,0,4,H,'F');
      doc.setFillColor(...TEAL); doc.rect(W-4,0,4,H,'F');
      // Corner brackets
      doc.setDrawColor(...NEON); doc.setLineWidth(1.5);
      [[30,30,1,1],[W-30,30,-1,1],[30,H-30,1,-1],[W-30,H-30,-1,-1]].forEach(([x,y,sx,sy])=>{
        doc.line(x,y,x+20*sx,y); doc.line(x,y,x,y+20*sy);
      });
      doc.setTextColor(...NEON); doc.setFontSize(10); doc.setFont('helvetica','bold');
      doc.text('// CERTIFICATE OF PARTICIPATION',W/2,65,{align:'center',charSpace:4});
      doc.setTextColor(...LGREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      doc.text('issued to',W/2,100,{align:'center'});
      const fs = p.name.length>25?34:p.name.length>20?40:46;
      doc.setFontSize(fs); doc.setFont('helvetica','bold'); doc.setTextColor(...WHITE);
      doc.text(p.name||'',W/2,145,{align:'center'});
      doc.setDrawColor(...NEON); doc.setLineWidth(2);
      doc.line(W/2-40,158,W/2+40,158);
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det) { doc.setTextColor(...MGREY); doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.text(det,W/2,178,{align:'center'}); }
      doc.setTextColor(...LGREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      doc.text('for successful participation in',W/2,210,{align:'center'});
      doc.setTextColor(...TEAL); doc.setFontSize(20); doc.setFont('helvetica','bold');
      const evLines=doc.splitTextToSize(evName,W-160);
      doc.text(evLines,W/2,240,{align:'center'});
      doc.setTextColor(...MGREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text('@ '+ev.organizer,W/2,240+evLines.length*22+8,{align:'center'});
      const SX=W/2-100, SY=H-85;
      if(sigB64) {
        // Invert signature on dark background not feasible; place on white box
        doc.setFillColor(...WHITE); doc.rect(SX+25,SY-42,150,40,'F');
        doc.addImage(sigB64,'PNG',SX+25,SY-40,150,36);
      }
      doc.setDrawColor(...LGREY); doc.setLineWidth(0.6); doc.line(SX,SY,SX+200,SY);
      doc.setTextColor(...WHITE); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',W/2,SY+14,{align:'center'});
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...MGREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,W/2,SY+26,{align:'center'});
      doc.setTextColor(...NEON); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text('[' + dateStr + ']',45,H-45);
      doc.text('ID:' + (p.code||''),W-45,H-45,{align:'right'});
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 10. MCF FULL BRAND — heavy MCF brand colour blocks
  // ───────────────────────────────────────────────────────────────
  mcf_full_brand: {
    name: 'MCF Full Brand',
    desc: 'Heavy MCF brand colours, prominent layout',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const RED=[235,0,27], ORANGE=[255,95,0], YELLOW=[247,158,27], TEAL=[47,123,107], BLACK=[20,20,20], GREY=[100,100,100], WHITE=[255,255,255];
      doc.setFillColor(...WHITE); doc.rect(0,0,W,H,'F');
      // Diagonal bottom-left accent
      doc.setFillColor(...RED); doc.triangle(0,H,0,H-120,200,H,'F');
      doc.setFillColor(...ORANGE); doc.triangle(0,H,0,H-90,140,H,'F');
      doc.setFillColor(...YELLOW); doc.triangle(0,H,0,H-50,75,H,'F');
      // Top right
      doc.setFillColor(...TEAL); doc.triangle(W,0,W,90,W-150,0,'F');
      doc.setFillColor(...YELLOW); doc.triangle(W,0,W,55,W-80,0,'F');
      // Brand dot top left
      doc.setFillColor(...RED); doc.circle(60,60,15,'F');
      doc.setFillColor(...YELLOW); doc.circle(75,60,15,'F');
      doc.setTextColor(...BLACK); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text('MCF · MASTERCARD FOUNDATION',100,57,{charSpace:2});
      doc.setTextColor(...GREY); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text('Access to Finance Programme',100,67);
      doc.setTextColor(...RED); doc.setFontSize(12); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE OF PARTICIPATION',60,110,{charSpace:3});
      doc.setDrawColor(...ORANGE); doc.setLineWidth(2); doc.line(60,118,260,118);
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','italic');
      doc.text('This certificate confirms that',60,150);
      const fs = p.name.length>25?34:p.name.length>20?40:46;
      doc.setFontSize(fs); doc.setFont('helvetica','bold'); doc.setTextColor(...BLACK);
      doc.text(p.name||'',60,195);
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det) { doc.setTextColor(...TEAL); doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.text(det,60,215); }
      doc.setTextColor(...GREY); doc.setFontSize(11); doc.setFont('helvetica','italic');
      doc.text('participated in',60,245);
      doc.setTextColor(...ORANGE); doc.setFontSize(20); doc.setFont('helvetica','bold');
      const evLines=doc.splitTextToSize(evName,W-280);
      doc.text(evLines,60,275);
      doc.setTextColor(...GREY); doc.setFontSize(10); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text('Hosted by  '+ev.organizer,60,275+evLines.length*22+8);
      const SX=W-260, SY=H-105;
      if(sigB64) doc.addImage(sigB64,'PNG',SX,SY-42,140,38);
      doc.setDrawColor(...BLACK); doc.setLineWidth(0.8); doc.line(SX,SY,SX+180,SY);
      doc.setTextColor(...BLACK); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',SX,SY+14);
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...GREY);
      if(ev.signatory_title) doc.text(ev.signatory_title,SX,SY+26);
      doc.setFillColor(...YELLOW); doc.roundedRect(60,H-95,100,22,4,4,'F');
      doc.setTextColor(...BLACK); doc.setFontSize(10); doc.setFont('helvetica','bold');
      doc.text('Ref: ' + (p.code||''),110,H-80,{align:'center'});
      doc.setTextColor(...RED); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(dateStr,60,H-65);
    }
  }
};
