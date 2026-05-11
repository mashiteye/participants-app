// ════════════════════════════════════════════════════════════════════
// CERTIFICATE TEMPLATES v2 — Fully proportional A4 landscape
// W=841.89pt H=595.28pt — all coordinates use W/H ratios
// ════════════════════════════════════════════════════════════════════

window.CERT_TEMPLATES = {

  classic_mcf: {
    name: 'Classic MCF',
    desc: 'Red/orange header, MCF brand colours, formal layout',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const RED=[235,0,27],OR=[255,95,0],YEL=[247,158,27],BLK=[20,20,20],WHT=[255,255,255],GRY=[100,100,100];
      const CX=W/2, LM=W*0.08;
      doc.setFillColor(...WHT); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...RED); doc.rect(0,0,W,H*0.13,'F');
      doc.setFillColor(...OR);  doc.rect(0,H*0.10,W,H*0.04,'F');
      doc.setFillColor(...YEL); doc.rect(0,H*0.13,W,H*0.012,'F');
      doc.setFillColor(...RED); doc.rect(0,H*0.142,W*0.012,H*0.73,'F');
      doc.setFillColor(...BLK); doc.rect(0,H*0.872,W,H*0.128,'F');
      doc.setFillColor(...YEL); doc.rect(0,H*0.872,W,H*0.015,'F');
      doc.setTextColor(...WHT); doc.setFont('helvetica','bold'); doc.setFontSize(H*0.044);
      doc.text('CERTIFICATE OF PARTICIPATION', CX, H*0.072, {align:'center', charSpace:2});
      doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      doc.text(ev.organizer||'METSS LBG', CX, H*0.105, {align:'center'});
      doc.setTextColor(...GRY); doc.setFontSize(H*0.036); doc.setFont('helvetica','italic');
      doc.text('This is to certify that', LM, H*0.26);
      const nFs=(p.name||'').length>30?H*0.076:(p.name||'').length>22?H*0.088:H*0.104;
      doc.setFontSize(nFs); doc.setFont('helvetica','bold'); doc.setTextColor(...RED);
      doc.text(p.name||'', LM, H*0.41);
      const nW=Math.min(doc.getTextWidth(p.name||''),W*0.84);
      doc.setFillColor(...YEL); doc.rect(LM,H*0.425,nW,H*0.008,'F');
      const det=[p.position_title,p.org].filter(Boolean).join('   ·   ');
      if(det){doc.setTextColor(...GRY);doc.setFontSize(H*0.032);doc.setFont('helvetica','normal');doc.text(det,LM,H*0.50);}
      doc.setTextColor(80,80,80); doc.setFontSize(H*0.034); doc.setFont('helvetica','italic');
      doc.text('has successfully participated in', LM, H*0.575);
      doc.setTextColor(...OR); doc.setFontSize(H*0.048); doc.setFont('helvetica','bold');
      const evL=doc.splitTextToSize(evName,W*0.6);
      doc.text(evL,LM,H*0.648);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.028); doc.setFont('helvetica','normal');
      if(ev.program) doc.text('Programme: '+ev.program,LM,H*0.648+evL.length*H*0.055+H*0.01);
      const SX=W*0.62,SY=H*0.915;
      if(sigB64) doc.addImage(sigB64,'PNG',SX,SY-H*0.075,W*0.22,H*0.065);
      doc.setDrawColor(...WHT); doc.setLineWidth(0.8); doc.line(SX,SY,SX+W*0.28,SY);
      doc.setTextColor(...WHT); doc.setFontSize(H*0.03); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',SX+W*0.14,SY+H*0.025,{align:'center'});
      doc.setFontSize(H*0.024); doc.setFont('helvetica','normal');
      if(ev.signatory_title) doc.text(ev.signatory_title,SX+W*0.14,SY+H*0.048,{align:'center'});
      doc.setFontSize(H*0.024); doc.setTextColor(180,180,180);
      doc.text(dateStr,LM,SY+H*0.048);
      doc.text('Ref: '+(p.code||''),W*0.92,SY+H*0.048,{align:'right'});
    }
  },

  modern_minimalist: {
    name: 'Modern Minimalist',
    desc: 'White background, teal double border, clean layout',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const TEAL=[47,123,107],DGY=[35,35,35],MGY=[100,100,100],LGY=[180,180,180],OR=[255,95,0];
      const CX=W/2,M=W*0.06;
      doc.setFillColor(255,255,255); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...TEAL); doc.setLineWidth(2); doc.rect(M*0.5,M*0.5,W-M,H-M);
      doc.setLineWidth(0.5); doc.rect(M*0.75,M*0.75,W-M*1.5,H-M*1.5);
      [[M*0.75,M*0.75],[W-M*0.75,M*0.75],[M*0.75,H-M*0.75],[W-M*0.75,H-M*0.75]].forEach(([x,y])=>{doc.setFillColor(...TEAL);doc.circle(x,y,H*0.008,'F');});
      doc.setTextColor(...TEAL); doc.setFontSize(H*0.032); doc.setFont('helvetica','normal');
      doc.text('CERTIFICATE',CX,H*0.2,{align:'center',charSpace:8});
      doc.setFontSize(H*0.066); doc.setFont('helvetica','bold'); doc.setTextColor(...DGY);
      doc.text('Of Participation',CX,H*0.29,{align:'center'});
      doc.setFillColor(...OR); doc.rect(CX-W*0.06,H*0.31,W*0.12,H*0.006,'F');
      doc.setTextColor(...MGY); doc.setFontSize(H*0.032); doc.setFont('helvetica','italic');
      doc.text('Presented to',CX,H*0.405,{align:'center'});
      const nFs=(p.name||'').length>30?H*0.072:(p.name||'').length>22?H*0.086:H*0.1;
      doc.setFontSize(nFs); doc.setFont('helvetica','bold'); doc.setTextColor(...DGY);
      doc.text(p.name||'',CX,H*0.52,{align:'center'});
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...MGY);doc.setFontSize(H*0.03);doc.setFont('helvetica','normal');doc.text(det,CX,H*0.575,{align:'center'});}
      doc.setTextColor(...MGY); doc.setFontSize(H*0.03); doc.setFont('helvetica','italic');
      doc.text('for successful participation in',CX,H*0.63,{align:'center'});
      doc.setTextColor(...TEAL); doc.setFontSize(H*0.044); doc.setFont('helvetica','bold');
      const evL=doc.splitTextToSize(evName,W*0.7);
      doc.text(evL,CX,H*0.685,{align:'center'});
      doc.setTextColor(...LGY); doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      doc.text([ev.organizer,dateStr].filter(Boolean).join('  ·  '),CX,H*0.685+evL.length*H*0.05+H*0.03,{align:'center'});
      const SX=CX-W*0.16,SY=H*0.855;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+W*0.02,SY-H*0.075,W*0.22,H*0.065);
      doc.setDrawColor(...DGY); doc.setLineWidth(0.6); doc.line(SX,SY,SX+W*0.32,SY);
      doc.setTextColor(...DGY); doc.setFontSize(H*0.03); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',CX,SY+H*0.033,{align:'center'});
      doc.setFontSize(H*0.024); doc.setFont('helvetica','normal'); doc.setTextColor(...MGY);
      if(ev.signatory_title) doc.text(ev.signatory_title,CX,SY+H*0.055,{align:'center'});
      doc.setTextColor(...LGY); doc.setFontSize(H*0.022);
      doc.text('ID: '+(p.code||''),W-M*0.9,H-M*0.9,{align:'right'});
    }
  },

  elegant_gold: {
    name: 'Elegant Gold',
    desc: 'Ivory background, double gold border, traditional serif',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const GLD=[190,150,40],DGD=[140,105,20],CRM=[252,249,240],DGY=[35,35,35],GRY=[100,100,100];
      const CX=W/2,M=W*0.055;
      doc.setFillColor(...CRM); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...GLD); doc.setLineWidth(2.5); doc.rect(M*0.5,M*0.5,W-M,H-M);
      doc.setLineWidth(0.6); doc.rect(M*0.75,M*0.75,W-M*1.5,H-M*1.5);
      [[M*0.75,M*0.75,1,1],[W-M*0.75,M*0.75,-1,1],[M*0.75,H-M*0.75,1,-1],[W-M*0.75,H-M*0.75,-1,-1]].forEach(([x,y,sx,sy])=>{
        doc.setDrawColor(...GLD);doc.setLineWidth(1.2);doc.line(x,y,x+W*0.04*sx,y);doc.line(x,y,x,y+H*0.055*sy);doc.setFillColor(...GLD);doc.circle(x+W*0.02*sx,y+H*0.027*sy,H*0.007,'F');
      });
      doc.setTextColor(...DGD); doc.setFontSize(H*0.03); doc.setFont('times','italic');
      doc.text('— Certificate of —',CX,H*0.19,{align:'center'});
      doc.setFontSize(H*0.072); doc.setFont('times','bold'); doc.setTextColor(...DGY);
      doc.text('Participation',CX,H*0.285,{align:'center'});
      doc.setDrawColor(...GLD); doc.setLineWidth(0.8); doc.line(CX-W*0.14,H*0.305,CX+W*0.14,H*0.305);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.033); doc.setFont('times','italic');
      doc.text('This certificate is proudly presented to',CX,H*0.385,{align:'center'});
      const nFs=(p.name||'').length>30?H*0.072:(p.name||'').length>22?H*0.086:H*0.102;
      doc.setFontSize(nFs); doc.setFont('times','italic'); doc.setTextColor(...DGD);
      doc.text(p.name||'',CX,H*0.505,{align:'center'});
      const nW=Math.min(doc.getTextWidth(p.name||''),W*0.72);
      doc.setDrawColor(...GLD); doc.setLineWidth(0.5); doc.line(CX-nW/2-W*0.02,H*0.522,CX+nW/2+W*0.02,H*0.522);
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...GRY);doc.setFontSize(H*0.03);doc.setFont('times','normal');doc.text(det,CX,H*0.572,{align:'center'});}
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('times','italic');
      doc.text('in recognition of participation in',CX,H*0.625,{align:'center'});
      doc.setTextColor(...DGY); doc.setFontSize(H*0.042); doc.setFont('times','bold');
      const evL=doc.splitTextToSize(evName,W*0.68);
      doc.text(evL,CX,H*0.678,{align:'center'});
      doc.setTextColor(...GRY); doc.setFontSize(H*0.026); doc.setFont('times','italic');
      if(ev.organizer) doc.text('hosted by '+ev.organizer,CX,H*0.678+evL.length*H*0.048+H*0.028,{align:'center'});
      const SX=CX-W*0.17,SY=H*0.865;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+W*0.02,SY-H*0.075,W*0.24,H*0.068);
      doc.setDrawColor(...DGY); doc.setLineWidth(0.6); doc.line(SX,SY,SX+W*0.34,SY);
      doc.setTextColor(...DGY); doc.setFontSize(H*0.03); doc.setFont('times','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',CX,SY+H*0.033,{align:'center'});
      doc.setFontSize(H*0.024); doc.setFont('times','italic'); doc.setTextColor(...GRY);
      if(ev.signatory_title) doc.text(ev.signatory_title,CX,SY+H*0.054,{align:'center'});
      doc.setTextColor(...DGD); doc.setFontSize(H*0.024); doc.setFont('times','italic');
      doc.text(dateStr,M*0.9,H-M*0.85);
      doc.text(p.code||'',W-M*0.9,H-M*0.85,{align:'right'});
    }
  },

  corporate_blocks: {
    name: 'Corporate Blocks',
    desc: 'Bold red left panel, orange accent stripe, modern',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const RED=[235,0,27],OR=[255,95,0],YEL=[247,158,27],BLK=[20,20,20],GRY=[100,100,100],WHT=[255,255,255];
      const PW=W*0.25,LX=PW+W*0.065;
      doc.setFillColor(...WHT); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...RED); doc.rect(0,0,PW,H,'F');
      doc.setFillColor(...OR);  doc.rect(PW,0,W*0.018,H,'F');
      doc.setFillColor(...YEL); doc.rect(PW+W*0.018,0,W*0.008,H,'F');
      doc.setTextColor(...WHT); doc.setFontSize(H*0.038); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE',PW/2,H*0.22,{align:'center'});
      doc.text('OF',PW/2,H*0.30,{align:'center'});
      doc.text('PARTICIPATION',PW/2,H*0.38,{align:'center'});
      doc.setDrawColor(...WHT); doc.setLineWidth(0.8); doc.line(PW*0.15,H*0.44,PW*0.85,H*0.44);
      doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      doc.text(dateStr,PW/2,H*0.52,{align:'center'});
      doc.setFontSize(H*0.022);
      doc.text('Reference',PW/2,H*0.82,{align:'center'});
      doc.setFontSize(H*0.032); doc.setFont('helvetica','bold');
      doc.text(p.code||'',PW/2,H*0.87,{align:'center'});
      doc.setTextColor(...GRY); doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      doc.text('AWARDED TO',LX,H*0.24);
      doc.setFillColor(...OR); doc.rect(LX,H*0.258,W*0.08,H*0.006,'F');
      const nFs=(p.name||'').length>30?H*0.07:(p.name||'').length>22?H*0.082:H*0.096;
      doc.setFontSize(nFs); doc.setFont('helvetica','bold'); doc.setTextColor(...BLK);
      doc.text(p.name||'',LX,H*0.385);
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...GRY);doc.setFontSize(H*0.028);doc.setFont('helvetica','normal');doc.text(det,LX,H*0.44);}
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('helvetica','italic');
      doc.text('for successful participation in',LX,H*0.52);
      doc.setTextColor(...RED); doc.setFontSize(H*0.044); doc.setFont('helvetica','bold');
      const evL=doc.splitTextToSize(evName,W-LX-W*0.06);
      doc.text(evL,LX,H*0.59);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text(ev.organizer,LX,H*0.59+evL.length*H*0.05+H*0.02);
      const SX=LX,SY=H*0.87;
      if(sigB64) doc.addImage(sigB64,'PNG',SX,SY-H*0.08,W*0.22,H*0.07);
      doc.setDrawColor(...BLK); doc.setLineWidth(0.7); doc.line(SX,SY,SX+W*0.3,SY);
      doc.setTextColor(...BLK); doc.setFontSize(H*0.028); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',SX,SY+H*0.032);
      doc.setFontSize(H*0.022); doc.setFont('helvetica','normal'); doc.setTextColor(...GRY);
      if(ev.signatory_title) doc.text(ev.signatory_title,SX,SY+H*0.054);
    }
  },

  geometric: {
    name: 'Geometric Modern',
    desc: 'Triangle corner accents, contemporary geometric',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const TEAL=[47,123,107],OR=[255,95,0],YEL=[247,158,27],BLK=[30,30,30],GRY=[100,100,100],LGY=[200,200,200];
      const CX=W/2;
      doc.setFillColor(255,255,255); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...TEAL); doc.triangle(0,0,W*0.18,0,0,H*0.26,'F');
      doc.setFillColor(...OR);   doc.triangle(0,0,W*0.11,0,0,H*0.16,'F');
      doc.setFillColor(...YEL);  doc.triangle(W,0,W,H*0.18,W-W*0.16,0,'F');
      doc.setFillColor(...OR);   doc.triangle(W,H,W-W*0.18,H,W,H-H*0.28,'F');
      doc.setFillColor(...TEAL); doc.triangle(0,H,W*0.14,H,0,H-H*0.2,'F');
      doc.setTextColor(...TEAL); doc.setFontSize(H*0.036); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE OF PARTICIPATION',CX,H*0.18,{align:'center',charSpace:4});
      doc.setDrawColor(...OR); doc.setLineWidth(H*0.006); doc.line(CX-W*0.2,H*0.21,CX+W*0.2,H*0.21);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.032); doc.setFont('helvetica','italic');
      doc.text('proudly presented to',CX,H*0.31,{align:'center'});
      const nFs=(p.name||'').length>30?H*0.076:(p.name||'').length>22?H*0.09:H*0.106;
      doc.setFontSize(nFs); doc.setFont('helvetica','bold'); doc.setTextColor(...BLK);
      doc.text(p.name||'',CX,H*0.435,{align:'center'});
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...GRY);doc.setFontSize(H*0.028);doc.setFont('helvetica','normal');doc.text(det,CX,H*0.495,{align:'center'});}
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('helvetica','italic');
      doc.text('for successful participation in',CX,H*0.555,{align:'center'});
      doc.setTextColor(...OR); doc.setFontSize(H*0.046); doc.setFont('helvetica','bold');
      const evL=doc.splitTextToSize(evName,W*0.7);
      doc.text(evL,CX,H*0.62,{align:'center'});
      doc.setTextColor(...LGY); doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      doc.text([ev.organizer,dateStr].filter(Boolean).join('  ·  '),CX,H*0.62+evL.length*H*0.052+H*0.028,{align:'center'});
      const SX=CX-W*0.17,SY=H*0.862;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+W*0.02,SY-H*0.078,W*0.24,H*0.07);
      doc.setDrawColor(...BLK); doc.setLineWidth(0.6); doc.line(SX,SY,SX+W*0.34,SY);
      doc.setTextColor(...BLK); doc.setFontSize(H*0.03); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',CX,SY+H*0.033,{align:'center'});
      doc.setFontSize(H*0.024); doc.setFont('helvetica','normal'); doc.setTextColor(...GRY);
      if(ev.signatory_title) doc.text(ev.signatory_title,CX,SY+H*0.054,{align:'center'});
    }
  },

  achievement_medal: {
    name: 'Achievement Medal',
    desc: 'Central medal motif, gold accents, formal recognition',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const GLD=[200,160,50],DGD=[150,110,20],RED=[235,0,27],BLK=[30,30,30],GRY=[100,100,100],CRM=[252,249,240];
      const CX=W/2;
      doc.setFillColor(...CRM); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...GLD); doc.setLineWidth(1.8); doc.rect(W*0.03,H*0.04,W*0.94,H*0.92);
      doc.setLineWidth(0.4); doc.rect(W*0.038,H*0.055,W*0.924,H*0.89);
      const MX=CX,MY=H*0.22,MR=H*0.1;
      doc.setFillColor(...GLD); doc.circle(MX,MY,MR,'F');
      doc.setFillColor(...DGD); doc.circle(MX,MY,MR*0.82,'F');
      doc.setFillColor(...GLD); doc.circle(MX,MY,MR*0.65,'F');
      doc.setTextColor(252,249,240); doc.setFontSize(H*0.06); doc.setFont('times','bold');
      doc.text('★',MX,MY+H*0.022,{align:'center'});
      doc.setFillColor(...RED); doc.triangle(MX-H*0.06,MY+MR,MX+H*0.06,MY+MR,MX-H*0.06,MY+MR+H*0.1,'F');
      doc.setFillColor(...GLD); doc.triangle(MX+H*0.06,MY+MR,MX-H*0.06,MY+MR+H*0.1,MX+H*0.06,MY+MR+H*0.1,'F');
      doc.setTextColor(...DGD); doc.setFontSize(H*0.026); doc.setFont('times','bold');
      doc.text('CERTIFICATE OF ACHIEVEMENT',CX,H*0.41,{align:'center',charSpace:5});
      doc.setDrawColor(...GLD); doc.setLineWidth(0.5); doc.line(CX-W*0.2,H*0.428,CX+W*0.2,H*0.428);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('times','italic');
      doc.text('This certificate is awarded to',CX,H*0.49,{align:'center'});
      const nFs=(p.name||'').length>30?H*0.068:(p.name||'').length>22?H*0.082:H*0.097;
      doc.setFontSize(nFs); doc.setFont('times','bold'); doc.setTextColor(...BLK);
      doc.text(p.name||'',CX,H*0.59,{align:'center'});
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...GRY);doc.setFontSize(H*0.028);doc.setFont('times','normal');doc.text(det,CX,H*0.645,{align:'center'});}
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('times','italic');
      doc.text('for outstanding participation in',CX,H*0.7,{align:'center'});
      doc.setTextColor(...DGD); doc.setFontSize(H*0.04); doc.setFont('times','bold');
      const evL=doc.splitTextToSize(evName,W*0.65);
      doc.text(evL,CX,H*0.752,{align:'center'});
      const SX=CX-W*0.16,SY=H*0.882;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+W*0.02,SY-H*0.075,W*0.22,H*0.065);
      doc.setDrawColor(...BLK); doc.setLineWidth(0.6); doc.line(SX,SY,SX+W*0.32,SY);
      doc.setTextColor(...BLK); doc.setFontSize(H*0.028); doc.setFont('times','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',CX,SY+H*0.032,{align:'center'});
      doc.setFontSize(H*0.022); doc.setFont('times','italic'); doc.setTextColor(...GRY);
      if(ev.signatory_title) doc.text(ev.signatory_title,CX,SY+H*0.053,{align:'center'});
      doc.setTextColor(...DGD); doc.setFontSize(H*0.022);
      doc.text(dateStr,W*0.06,H*0.935);
      doc.text(p.code||'',W*0.94,H*0.935,{align:'right'});
    }
  },

  diploma_classic: {
    name: 'Diploma Classic',
    desc: 'Traditional university diploma, navy and gold',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const NVY=[20,40,80],GLD=[180,140,40],BLK=[20,20,20],GRY=[100,100,100],OFW=[252,251,247];
      const CX=W/2,LM=W*0.08;
      doc.setFillColor(...OFW); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...NVY); doc.setLineWidth(3); doc.rect(W*0.025,H*0.035,W*0.95,H*0.93);
      doc.setDrawColor(...GLD); doc.setLineWidth(0.8); doc.rect(W*0.04,H*0.06,W*0.92,H*0.88);
      doc.setTextColor(...NVY); doc.setFontSize(H*0.036); doc.setFont('times','bold');
      doc.text((ev.organizer||'METSS LBG').toUpperCase(),CX,H*0.175,{align:'center',charSpace:3});
      doc.setDrawColor(...GLD); doc.setLineWidth(0.5); doc.line(CX-W*0.24,H*0.196,CX+W*0.24,H*0.196);
      doc.setFontSize(H*0.07); doc.setFont('times','bold'); doc.setTextColor(...NVY);
      doc.text('Certificate of Participation',CX,H*0.295,{align:'center'});
      doc.line(CX-W*0.3,H*0.315,CX+W*0.3,H*0.315);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.032); doc.setFont('times','italic');
      doc.text('Be it known that',CX,H*0.385,{align:'center'});
      const nFs=(p.name||'').length>30?H*0.075:(p.name||'').length>22?H*0.088:H*0.104;
      doc.setFontSize(nFs); doc.setFont('times','italic'); doc.setTextColor(...NVY);
      doc.text(p.name||'',CX,H*0.5,{align:'center'});
      const nW=Math.min(doc.getTextWidth(p.name||''),W*0.78);
      doc.setDrawColor(...GLD); doc.setLineWidth(0.5); doc.line(CX-nW/2-W*0.015,H*0.518,CX+nW/2+W*0.015,H*0.518);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('times','normal');
      doc.text('has duly participated in the programme',CX,H*0.578,{align:'center'});
      doc.setTextColor(...BLK); doc.setFontSize(H*0.044); doc.setFont('times','bold');
      const evL=doc.splitTextToSize(evName,W*0.72);
      doc.text(evL,CX,H*0.638,{align:'center'});
      doc.setTextColor(...GRY); doc.setFontSize(H*0.028); doc.setFont('times','italic');
      doc.text('and is hereby presented this certificate',CX,H*0.638+evL.length*H*0.048+H*0.032,{align:'center'});
      const S1X=LM,S2X=W*0.58,SY=H*0.868;
      if(sigB64) doc.addImage(sigB64,'PNG',S2X,SY-H*0.08,W*0.22,H*0.07);
      doc.setDrawColor(...BLK); doc.setLineWidth(0.7);
      doc.line(S1X,SY,S1X+W*0.22,SY); doc.line(S2X,SY,S2X+W*0.32,SY);
      doc.setTextColor(...BLK); doc.setFontSize(H*0.026); doc.setFont('times','bold');
      doc.text(dateStr,S1X+W*0.11,SY+H*0.032,{align:'center'});
      doc.text(ev.signatory_name||'Authorised Signatory',S2X+W*0.16,SY+H*0.032,{align:'center'});
      doc.setFontSize(H*0.022); doc.setFont('times','italic'); doc.setTextColor(...GRY);
      doc.text('Date',S1X+W*0.11,SY+H*0.053,{align:'center'});
      doc.text(ev.signatory_title||'Signatory',S2X+W*0.16,SY+H*0.053,{align:'center'});
      doc.setTextColor(GLD[0],GLD[1],GLD[2]); doc.setFontSize(H*0.022); doc.setFont('times','italic');
      doc.text('Ref: '+(p.code||''),CX,H*0.945,{align:'center'});
    }
  },

  ornamental: {
    name: 'Ornamental',
    desc: 'Plum and gold, decorative corner flourishes',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const PLM=[80,30,80],GLD=[200,160,50],BLK=[30,30,30],GRY=[100,100,100],CRM=[252,249,240];
      const CX=W/2,M=W*0.05;
      doc.setFillColor(...CRM); doc.rect(0,0,W,H,'F');
      doc.setDrawColor(...PLM); doc.setLineWidth(2); doc.rect(M*0.5,M*0.5,W-M,H-M);
      doc.setDrawColor(...GLD); doc.setLineWidth(0.5); doc.rect(M*0.75,M*0.75,W-M*1.5,H-M*1.5);
      [[M*0.75,M*0.75,1,1],[W-M*0.75,M*0.75,-1,1],[M*0.75,H-M*0.75,1,-1],[W-M*0.75,H-M*0.75,-1,-1]].forEach(([x,y,sx,sy])=>{
        doc.setDrawColor(...GLD);doc.setLineWidth(1.2);
        doc.line(x,y,x+W*0.05*sx,y);doc.line(x,y,x,y+H*0.07*sy);
        doc.line(x+W*0.025*sx,y,x+W*0.025*sx,y+H*0.035*sy);
        doc.line(x,y+H*0.035*sy,x+W*0.025*sx,y+H*0.035*sy);
        doc.setFillColor(...PLM);doc.circle(x+W*0.025*sx,y+H*0.035*sy,H*0.008,'F');
      });
      doc.setTextColor(...PLM); doc.setFontSize(H*0.032); doc.setFont('times','italic');
      doc.text('~ With Distinction ~',CX,H*0.185,{align:'center'});
      doc.setFontSize(H*0.072); doc.setFont('times','bold'); doc.setTextColor(...PLM);
      doc.text('Certificate of Participation',CX,H*0.285,{align:'center'});
      doc.setFillColor(...GLD);
      doc.circle(CX-W*0.18,H*0.308,H*0.006,'F');
      doc.circle(CX,H*0.308,H*0.006,'F');
      doc.circle(CX+W*0.18,H*0.308,H*0.006,'F');
      doc.setTextColor(...GRY); doc.setFontSize(H*0.032); doc.setFont('times','italic');
      doc.text('Bestowed upon',CX,H*0.375,{align:'center'});
      const nFs=(p.name||'').length>30?H*0.074:(p.name||'').length>22?H*0.088:H*0.106;
      doc.setFontSize(nFs); doc.setFont('times','italic'); doc.setTextColor(...PLM);
      doc.text(p.name||'',CX,H*0.493,{align:'center'});
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...GRY);doc.setFontSize(H*0.028);doc.setFont('times','normal');doc.text(det,CX,H*0.548,{align:'center'});}
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('times','italic');
      doc.text('in honoured recognition of participation in',CX,H*0.61,{align:'center'});
      doc.setTextColor(...BLK); doc.setFontSize(H*0.044); doc.setFont('times','bold');
      const evL=doc.splitTextToSize(evName,W*0.7);
      doc.text(evL,CX,H*0.668,{align:'center'});
      doc.setTextColor(...GRY); doc.setFontSize(H*0.026); doc.setFont('times','italic');
      if(ev.organizer) doc.text('organised by '+ev.organizer,CX,H*0.668+evL.length*H*0.048+H*0.026,{align:'center'});
      const SX=CX-W*0.17,SY=H*0.868;
      if(sigB64) doc.addImage(sigB64,'PNG',SX+W*0.02,SY-H*0.076,W*0.24,H*0.068);
      doc.setDrawColor(...BLK); doc.setLineWidth(0.6); doc.line(SX,SY,SX+W*0.34,SY);
      doc.setTextColor(...BLK); doc.setFontSize(H*0.028); doc.setFont('times','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',CX,SY+H*0.033,{align:'center'});
      doc.setFontSize(H*0.022); doc.setFont('times','italic'); doc.setTextColor(...GRY);
      if(ev.signatory_title) doc.text(ev.signatory_title,CX,SY+H*0.054,{align:'center'});
      doc.setTextColor(...PLM); doc.setFontSize(H*0.022);
      doc.text(dateStr,M*0.9,H-M*0.8);
      doc.text(p.code||'',W-M*0.9,H-M*0.8,{align:'right'});
    }
  },

  tech_modern: {
    name: 'Tech Modern',
    desc: 'Dark theme, neon orange and teal accents',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const DRK=[22,28,38],NOR=[255,95,0],TEL=[80,200,180],WHT=[255,255,255],LGY=[200,200,200],MGY=[130,130,130];
      const CX=W/2,M=W*0.045;
      doc.setFillColor(...DRK); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...NOR); doc.rect(0,0,W,H*0.008,'F');
      doc.setFillColor(...TEL); doc.rect(0,H*0.992,W,H*0.008,'F');
      doc.setFillColor(...NOR); doc.rect(0,0,W*0.007,H,'F');
      doc.setFillColor(...TEL); doc.rect(W*0.993,0,W*0.007,H,'F');
      const bL=W*0.05,bH=H*0.07;
      [[M+bL,M+bH,-1,-1],[W-M-bL,M+bH,1,-1],[M+bL,H-M-bH,-1,1],[W-M-bL,H-M-bH,1,1]].forEach(([x,y,sx,sy])=>{
        doc.setDrawColor(...NOR);doc.setLineWidth(1.5);doc.line(x,y,x-bL*sx,y);doc.line(x,y,x,y-bH*sy);
      });
      doc.setTextColor(...NOR); doc.setFontSize(H*0.034); doc.setFont('helvetica','bold');
      doc.text('// CERTIFICATE OF PARTICIPATION',CX,H*0.19,{align:'center',charSpace:3});
      doc.setDrawColor(...NOR); doc.setLineWidth(H*0.005); doc.line(CX-W*0.12,H*0.215,CX+W*0.12,H*0.215);
      doc.setTextColor(...LGY); doc.setFontSize(H*0.028); doc.setFont('helvetica','normal');
      doc.text('issued to',CX,H*0.3,{align:'center'});
      const nFs=(p.name||'').length>30?H*0.076:(p.name||'').length>22?H*0.09:H*0.108;
      doc.setFontSize(nFs); doc.setFont('helvetica','bold'); doc.setTextColor(...WHT);
      doc.text(p.name||'',CX,H*0.42,{align:'center'});
      doc.setFillColor(...NOR); doc.rect(CX-W*0.08,H*0.44,W*0.16,H*0.006,'F');
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...MGY);doc.setFontSize(H*0.026);doc.setFont('helvetica','normal');doc.text(det,CX,H*0.494,{align:'center'});}
      doc.setTextColor(...LGY); doc.setFontSize(H*0.028); doc.setFont('helvetica','normal');
      doc.text('for successful participation in',CX,H*0.558,{align:'center'});
      doc.setTextColor(...TEL); doc.setFontSize(H*0.046); doc.setFont('helvetica','bold');
      const evL=doc.splitTextToSize(evName,W*0.72);
      doc.text(evL,CX,H*0.625,{align:'center'});
      doc.setTextColor(...MGY); doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text('@ '+ev.organizer,CX,H*0.625+evL.length*H*0.05+H*0.025,{align:'center'});
      const SX=CX-W*0.16,SY=H*0.858;
      if(sigB64){doc.setFillColor(...WHT);doc.rect(SX+W*0.02,SY-H*0.082,W*0.24,H*0.072,'F');doc.addImage(sigB64,'PNG',SX+W*0.025,SY-H*0.078,W*0.23,H*0.065);}
      doc.setDrawColor(...LGY); doc.setLineWidth(0.6); doc.line(SX,SY,SX+W*0.32,SY);
      doc.setTextColor(...WHT); doc.setFontSize(H*0.028); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',CX,SY+H*0.033,{align:'center'});
      doc.setFontSize(H*0.022); doc.setFont('helvetica','normal'); doc.setTextColor(...MGY);
      if(ev.signatory_title) doc.text(ev.signatory_title,CX,SY+H*0.054,{align:'center'});
      doc.setTextColor(...NOR); doc.setFontSize(H*0.022);
      doc.text('['+dateStr+']',M+W*0.05,H-M*0.8);
      doc.text('ID:'+(p.code||''),W-M-W*0.05,H-M*0.8,{align:'right'});
    }
  },

  mcf_full_brand: {
    name: 'MCF Full Brand',
    desc: 'Diagonal MCF colour blocks, bold brand-forward design',
    render: ({doc, p, ev, evName, dateStr, sigB64, W, H}) => {
      const RED=[235,0,27],OR=[255,95,0],YEL=[247,158,27],TEL=[47,123,107],BLK=[20,20,20],GRY=[100,100,100],WHT=[255,255,255];
      const CX=W/2,LM=W*0.08;
      doc.setFillColor(...WHT); doc.rect(0,0,W,H,'F');
      doc.setFillColor(...RED); doc.triangle(0,H,0,H*0.62,W*0.28,H,'F');
      doc.setFillColor(...OR);  doc.triangle(0,H,0,H*0.72,W*0.18,H,'F');
      doc.setFillColor(...YEL); doc.triangle(0,H,0,H*0.82,W*0.09,H,'F');
      doc.setFillColor(...TEL); doc.triangle(W,0,W,H*0.22,W-W*0.24,0,'F');
      doc.setFillColor(...YEL); doc.triangle(W,0,W,H*0.13,W-W*0.13,0,'F');
      doc.setFillColor(...RED);  doc.circle(LM,H*0.12,H*0.038,'F');
      doc.setFillColor(...YEL);  doc.circle(LM+H*0.05,H*0.12,H*0.038,'F');
      doc.setTextColor(...BLK); doc.setFontSize(H*0.024); doc.setFont('helvetica','bold');
      doc.text('MCF  ·  MASTERCARD FOUNDATION',LM+H*0.095,H*0.115);
      doc.setFontSize(H*0.02); doc.setFont('helvetica','normal'); doc.setTextColor(...GRY);
      doc.text('Access to Finance Programme',LM+H*0.095,H*0.142);
      doc.setTextColor(...RED); doc.setFontSize(H*0.038); doc.setFont('helvetica','bold');
      doc.text('CERTIFICATE OF PARTICIPATION',LM,H*0.245,{charSpace:2});
      doc.setFillColor(...OR); doc.rect(LM,H*0.268,W*0.45,H*0.007,'F');
      doc.setTextColor(...GRY); doc.setFontSize(H*0.032); doc.setFont('helvetica','italic');
      doc.text('This certificate confirms that',LM,H*0.34);
      const nFs=(p.name||'').length>30?H*0.074:(p.name||'').length>22?H*0.088:H*0.106;
      doc.setFontSize(nFs); doc.setFont('helvetica','bold'); doc.setTextColor(...BLK);
      doc.text(p.name||'',LM,H*0.463);
      const det=[p.position_title,p.org].filter(Boolean).join(' · ');
      if(det){doc.setTextColor(...TEL);doc.setFontSize(H*0.028);doc.setFont('helvetica','normal');doc.text(det,LM,H*0.518);}
      doc.setTextColor(...GRY); doc.setFontSize(H*0.03); doc.setFont('helvetica','italic');
      doc.text('participated in',LM,H*0.578);
      doc.setTextColor(...OR); doc.setFontSize(H*0.046); doc.setFont('helvetica','bold');
      const evL=doc.splitTextToSize(evName,W*0.55);
      doc.text(evL,LM,H*0.644);
      doc.setTextColor(...GRY); doc.setFontSize(H*0.026); doc.setFont('helvetica','normal');
      if(ev.organizer) doc.text('Hosted by  '+ev.organizer,LM,H*0.644+evL.length*H*0.05+H*0.024);
      const SX=W*0.62,SY=H*0.75;
      if(sigB64) doc.addImage(sigB64,'PNG',SX,SY-H*0.082,W*0.24,H*0.075);
      doc.setDrawColor(...BLK); doc.setLineWidth(0.8); doc.line(SX,SY,SX+W*0.32,SY);
      doc.setTextColor(...BLK); doc.setFontSize(H*0.028); doc.setFont('helvetica','bold');
      doc.text(ev.signatory_name||'Authorised Signatory',SX+W*0.16,SY+H*0.032,{align:'center'});
      doc.setFontSize(H*0.022); doc.setFont('helvetica','normal'); doc.setTextColor(...GRY);
      if(ev.signatory_title) doc.text(ev.signatory_title,SX+W*0.16,SY+H*0.053,{align:'center'});
      doc.setFillColor(...YEL); doc.roundedRect(LM,H*0.82,W*0.14,H*0.044,H*0.01,H*0.01,'F');
      doc.setTextColor(...BLK); doc.setFontSize(H*0.026); doc.setFont('helvetica','bold');
      doc.text('Ref: '+(p.code||''),LM+W*0.07,H*0.848,{align:'center'});
      doc.setTextColor(...RED); doc.setFontSize(H*0.026);
      doc.text(dateStr,LM,H*0.9);
    }
  }
};
