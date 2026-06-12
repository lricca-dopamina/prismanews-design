// ════════════════════════════════════════════════════════════════
//  Humans.tech — Career Page "Lavora con noi"  ·  Dopamina
//  Plugin Figma → pagina in SEZIONI / FRAME / COMPONENTI
//  REGOLA: layoutGrow / layoutSizingHorizontal SOLO dopo appendChild.
// ════════════════════════════════════════════════════════════════

function hex(h){h=h.replace('#','');return {r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255};}
const C = {
  v:hex('4437F3'), vl:hex('8279FF'), dk:hex('050620'), nv:hex('1E1E2D'),
  white:hex('FFFFFF'), g:hex('EFEFEF'), m:hex('6E6E94'), hz:hex('C1C1DA'),
  dv:hex('DCD9FF'), o:hex('FF6B00'), ink424:hex('424267')
};
const W = 1440, PAD = 100, INNER = W - PAD*2; // 1240

function solid(c,op){ return {type:'SOLID', color:c, opacity: op===undefined?1:op}; }
function rgba(c){ return {r:c.r, g:c.g, b:c.b, a:1}; }
function gradV(c1,c2){ return {type:'GRADIENT_LINEAR', gradientTransform:[[0,1,0],[-1,0,1]], gradientStops:[{position:0,color:rgba(c1)},{position:1,color:rgba(c2)}]}; }
function gradVUp(c1,c2){ return {type:'GRADIENT_LINEAR', gradientTransform:[[0,-1,1],[1,0,0]], gradientStops:[{position:0,color:rgba(c1)},{position:1,color:rgba(c2)}]}; }

/* ─── FONT (risoluzione robusta: usa solo font realmente disponibili) ─── */
let F = {};
async function loadFonts(){
  // mappa famiglia -> set di stili disponibili nel Figma dell'utente
  const list = await figma.listAvailableFontsAsync();
  const byFamily = {};
  list.forEach(f=>{ (byFamily[f.fontName.family] = byFamily[f.fontName.family] || []).push(f.fontName.style); });

  // prima famiglia disponibile fra i candidati
  function family(cands){ return cands.find(c=>byFamily[c]); }
  // primo stile disponibile in quella famiglia fra i preferiti (case-insensitive); altrimenti il primo stile esistente
  function style(fam, prefs){
    const avail = byFamily[fam] || [];
    for(const p of prefs){ const hit = avail.find(s=>s.toLowerCase()===p.toLowerCase()); if(hit) return hit; }
    for(const p of prefs){ const hit = avail.find(s=>s.toLowerCase().includes(p.toLowerCase())); if(hit) return hit; }
    return avail[0] || 'Regular';
  }
  async function resolve(fam, prefs){ const fn={family:fam, style:style(fam,prefs)}; await figma.loadFontAsync(fn); return fn; }

  // DISPLAY (brand): Neue Haas → fallback eleganti
  const disp = family(['Neue Haas Grotesk Display Pro','Neue Haas Grotesk Display','NeueHaasDisplay Pro','Neue Haas Grotesk Display Std','Neue Haas Grotesk','Inter','Helvetica Neue','Arial']) || 'Inter';
  // MONO (navbar/pulsanti/etichette): DM Mono → fallback monospaziati
  const mon  = family(['DM Mono','Roboto Mono','Space Mono','JetBrains Mono','IBM Plex Mono','Courier New','Inter']) || 'Inter';

  const reg  = await resolve(disp, ['55 Roman','Roman','Regular','Book','Normal']);
  const med  = await resolve(disp, ['65 Medium','Medium','55 Roman','Roman','Regular']);
  const bold = await resolve(disp, ['75 Bold','Bold','65 Medium','Medium','Regular']);
  const mono = await resolve(mon,  ['Regular','Medium','Book','Normal']);
  const monoMed = await resolve(mon, ['Medium','Regular','Book','Normal']);

  F={reg,med,bold,mono,monoMed};
  // log diagnostico: così sai esattamente quali font ha usato
  console.log('[Font scelti]', JSON.stringify(F));
  figma.notify('Font: '+disp+' (display) · '+mon+' (mono)');
}

async function imgPaint(url){ try{ const im=await figma.createImageAsync(url); return {type:'IMAGE',scaleMode:'FILL',imageHash:im.hash}; }catch(e){ return null; } }

/* ─── IMMAGINI: preload + helper ─── */
const IMGBASE='http://localhost:8766/humans-careerpage/img/';
const U = {
  // FOTO REALI dal Figma (servite in locale, identiche alla pagina)
  carlo:IMGBASE+'p-carlo.png',
  mc1:IMGBASE+'p-mc1.png',
  mc:IMGBASE+'p-mc.png',
  pasquale:IMGBASE+'p-pasquale.png',
  emanuele:IMGBASE+'p-emanuele.png',
  crpasquale:IMGBASE+'cr-pasquale.png',
  crstefano:IMGBASE+'cr-stefano.png',
  crmanuel:IMGBASE+'cr-manuel.png',
  teamall:IMGBASE+'team-all.png',
  sedemain:IMGBASE+'sede-main.png',
  room1:IMGBASE+'room1.png',
  room2:IMGBASE+'room2.png',
  room3:IMGBASE+'room3.png',
  room4:IMGBASE+'room4.png',
  // CDN Humans (badge, loghi partner, foto processo) — come nella pagina
  francesco:'https://humans.tech/wp-content/uploads/2025/05/francesco-al-pc.png',
  postit:'https://humans.tech/wp-content/uploads/2025/05/post-it.png',
  bw:'https://humans.tech/wp-content/uploads/2025/03/best-workplaces.png',
  bwgenz:'https://humans.tech/wp-content/uploads/2025/03/best-workplaces-for-genz.png',
  ft:'https://humans.tech/wp-content/uploads/2025/03/ft.png',
  thebest:'https://humans.tech/wp-content/uploads/2026/03/the-best-1.png',
  unobravo:'https://humans.tech/wp-content/uploads/2025/05/unobravo.png',
  sanimpresa:'https://humans.tech/wp-content/uploads/2025/05/sanimpresa.png',
  fondoest:'https://humans.tech/wp-content/uploads/2025/05/assistenza-sanitaria-integrativa.png',
  starting:'https://humans.tech/wp-content/uploads/2025/05/Starting-Finance.png',
  // Card progetti: restano Unsplash come nella pagina
  uns1:'https://images.unsplash.com/photo-1551434678-e076c223a692?w=840&h=1080&fit=crop',
  uns2:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=840&h=1080&fit=crop',
  uns3:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=840&h=1080&fit=crop'
};
const IMG = {};
async function preloadImages(){
  const keys = Object.keys(U);
  await Promise.all(keys.map(async k=>{ IMG[k] = await imgPaint(U[k]); }));
}
function pick(key, fallback){ return IMG[key] || fallback || gradV(C.vl,C.dk); }
// rettangolo con fill immagine (FILL, crop)
function imgRect(key,w,h,radius){ const r=figma.createRectangle(); r.resize(w,h); if(radius) r.cornerRadius=radius; r.fills=[pick(key)]; return r; }
// logo (FIT, niente crop)
function logoRect(key,w,h){ const r=figma.createRectangle(); r.resize(w,h); const p=IMG[key]; r.fills=p?[{type:'IMAGE',scaleMode:'FIT',imageHash:p.imageHash}]:[solid(C.g,0)]; r.name='logo'; return r; }
// figlio in posizione assoluta dentro un autolayout
function abs(parent,node,x,y){ parent.appendChild(node); node.layoutPositioning='ABSOLUTE'; node.x=x; node.y=y; return node; }
// ombra
function shadow(node,y,blur,a){ node.effects=[{type:'DROP_SHADOW',color:{r:0.02,g:0.02,b:0.12,a:a||0.28},offset:{x:0,y:y||24},radius:blur||56,spread:0,visible:true,blendMode:'NORMAL'}]; return node; }
// overlay gradiente (rettangolo) bottom-scuro per leggibilità
function shadeRect(w,h,c1,c2){ const r=figma.createRectangle(); r.resize(w,h); r.fills=[gradVUp(c1,c2)]; return r; } // gradVUp: c1 in basso

/* ─── AUTOLAYOUT FRAME ─── */
function AL(name,dir,o){
  o=o||{}; const f=figma.createFrame(); f.name=name; f.layoutMode=dir;
  f.itemSpacing=o.gap||0;
  f.paddingTop=o.pt||o.py||o.p||0; f.paddingBottom=o.pb||o.py||o.p||0;
  f.paddingLeft=o.pl||o.px||o.p||0; f.paddingRight=o.pr||o.px||o.p||0;
  f.primaryAxisSizingMode=o.primary||'AUTO';
  f.counterAxisSizingMode=o.counter||'AUTO';
  if(o.align) f.counterAxisAlignItems=o.align;
  if(o.justify) f.primaryAxisAlignItems=o.justify;
  f.fills=o.fill?[o.fill]:[];
  if(o.radius!==undefined) f.cornerRadius=o.radius;
  if(o.stroke){ f.strokes=[solid(o.stroke.c,o.stroke.o)]; f.strokeWeight=o.stroke.w||1; }
  if(o.w){ f.resize(o.w, Math.max(1,f.height)); }
  if(o.h){ f.resize(Math.max(1,f.width), o.h); }
  if(o.fixedW) f.counterAxisSizingMode='FIXED';
  if(o.clip!==undefined) f.clipsContent=o.clip;
  return f;
}
function T(chars,o){
  o=o||{}; const t=figma.createText();
  t.fontName=o.font||F.reg; t.characters=chars; t.fontSize=o.size||16;
  t.fills=[solid(o.color||C.nv, o.opacity)];
  if(o.lh) t.lineHeight={value:o.lh,unit:'PERCENT'};
  if(o.ls) t.letterSpacing={value:o.ls,unit:'PERCENT'};
  if(o.spacing) t.letterSpacing={value:o.spacing,unit:'PIXELS'};
  if(o.upper) t.textCase='UPPER';
  if(o.align) t.textAlignHorizontal=o.align;
  if(o.w){ t.textAutoResize='HEIGHT'; t.resize(o.w,Math.max(1,t.height)); }
  else t.textAutoResize='WIDTH_AND_HEIGHT';
  return t;
}
/* helper: append + layoutGrow (DOPO l'append) */
function addGrow(parent,child){ parent.appendChild(child); child.layoutGrow=1; return child; }
function addFill(parent,child){ parent.appendChild(child); child.layoutSizingHorizontal='FILL'; return child; }

/* ─── Spark ─── */
const SPARKD='M16.05,8.16l-1.01-3.15-4.63,1.53V0h-3.27v4.93L1.01,2.92l-1.01,3.15,4.63,1.53L.84,12.88l2.64,1.95,2.86-3.99,3.79,5.29,2.64-1.94-2.86-3.99,6.13-2.02Z';
function spark(size,color){
  const n=figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.05 16.12"><path d="'+SPARKD+'" fill="#000"/></svg>');
  n.name='Spark'; n.resize(size,size);
  try{ n.findAll(x=>x.type==='VECTOR').forEach(v=>v.fills=[solid(color)]); }catch(e){}
  return n;
}
function arrowSvg(){ return figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path d="M2 12L12 2M12 2H4M12 2V10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'); }

/* ════════════════ COMPONENTI ════════════════ */
const COMP={};
function buildComponents(){
  // Button/Primary
  let c=figma.createComponent(); c.name='Button/Primary';
  c.layoutMode='HORIZONTAL'; c.itemSpacing=8; c.paddingTop=14;c.paddingBottom=14;c.paddingLeft=24;c.paddingRight=24;
  c.counterAxisAlignItems='CENTER'; c.cornerRadius=11; c.fills=[solid(C.v)];
  c.appendChild(T('Vedi le posizioni aperte →',{font:F.mono,size:15,color:C.white})); COMP.btnPrimary=c;

  // Button/White
  c=figma.createComponent(); c.name='Button/White';
  c.layoutMode='HORIZONTAL'; c.itemSpacing=8; c.paddingTop=14;c.paddingBottom=14;c.paddingLeft=24;c.paddingRight=24;
  c.counterAxisAlignItems='CENTER'; c.cornerRadius=11; c.fills=[solid(C.white)];
  c.appendChild(T('Entra in Humans.tech →',{font:F.mono,size:15,color:C.nv})); COMP.btnWhite=c;

  // Button/Icon
  c=figma.createComponent(); c.name='Button/Icon';
  c.layoutMode='HORIZONTAL'; c.itemSpacing=14; c.counterAxisAlignItems='CENTER';
  const box=AL('IconBox','HORIZONTAL',{p:14,fill:solid(C.white),radius:13,align:'CENTER',justify:'CENTER'});
  box.appendChild(spark(22,C.v)); c.appendChild(box);
  c.appendChild(T('Candidati ora',{font:F.mono,size:15,color:C.white})); COMP.btnIcon=c;

  // Chip
  c=figma.createComponent(); c.name='Chip';
  c.layoutMode='HORIZONTAL'; c.paddingTop=5;c.paddingBottom=5;c.paddingLeft=14;c.paddingRight=14;
  c.cornerRadius=100; c.fills=[solid(C.v,0.1)]; c.strokes=[solid(C.v,0.25)]; c.strokeWeight=1;
  c.appendChild(T('SEZIONE',{font:F.mono,size:10,color:C.v,spacing:1.4,upper:true})); COMP.chip=c;

  // Stat
  c=figma.createComponent(); c.name='Stat'; c.layoutMode='VERTICAL'; c.itemSpacing=5;
  c.appendChild(T('700+',{font:F.med,size:48,color:C.white,ls:-3}));
  c.appendChild(T('PRODOTTI LANCIATI',{font:F.mono,size:11,color:C.white,opacity:0.45,spacing:0.8,upper:true})); COMP.stat=c;

  // Card/Project — foto preview + overlay + chip/titolo
  c=figma.createComponent(); c.name='Card/Project'; c.resize(400,520); c.cornerRadius=24; c.clipsContent=true;
  c.fills=[gradV(C.vl,C.dk)]; c.strokes=[solid(C.white,0.18)]; c.strokeWeight=1;
  c.layoutMode='VERTICAL'; c.primaryAxisSizingMode='FIXED'; c.counterAxisSizingMode='FIXED';
  c.paddingTop=24;c.paddingLeft=24;c.paddingRight=24;c.paddingBottom=24; c.primaryAxisAlignItems='SPACE_BETWEEN';
  { const ph=imgRect('uns1',400,520); ph.name='photo'; abs(c,ph,0,0);
    const sh=shadeRect(400,520,{r:0.02,g:0.02,b:0.12},C.dk); sh.name='shade'; sh.opacity=0.55; abs(c,sh,0,0); }
  const chip=AL('chip','HORIZONTAL',{pt:5,pb:5,pl:12,pr:12,radius:100,fill:solid(C.white,0.14),stroke:{c:C.white,o:0.25,w:1}});
  chip.appendChild(T('PRODOTTO · NDA',{font:F.mono,size:10,color:C.white,spacing:1,upper:true})); c.appendChild(chip);
  const pTitle=T('Sistema legacy → microservizi',{font:F.med,size:28,color:C.white,lh:110,w:340}); pTitle.name='title'; c.appendChild(pTitle); shadow(c,20,48,0.22); COMP.cardProject=c;

  // Card/Person — foto + overlay blu + storia
  c=figma.createComponent(); c.name='Card/Person'; c.resize(398,519); c.cornerRadius=28; c.clipsContent=true; c.fills=[gradV(C.vl,C.dk)];
  c.layoutMode='VERTICAL'; c.primaryAxisSizingMode='FIXED'; c.counterAxisSizingMode='FIXED'; c.primaryAxisAlignItems='MAX';
  c.paddingLeft=22;c.paddingRight=22;c.paddingBottom=22;c.paddingTop=22;
  { const ph=imgRect('mc1',398,519); ph.name='photo'; abs(c,ph,0,0);
    const sh=shadeRect(398,519,C.dk,C.v); sh.name='shade'; sh.opacity=0.9; abs(c,sh,0,0); }
  const info=AL('info','VERTICAL',{gap:6,w:354,fixedW:true}); info.fills=[];
  info.appendChild(T('È entrato a 28 anni come full-stack developer dopo quattro anni in consulenza.',{font:F.reg,size:13,color:C.white,opacity:0.78,lh:150,w:354}));
  info.appendChild(T('In due anni e mezzo ha preso ownership tecnica di un prodotto enterprise con 600k sessioni e oggi guida un team di quattro.',{font:F.bold,size:13,color:C.white,lh:150,w:354}));
  info.appendChild(T('Pasquale · Copywriter → Success Manager',{font:F.med,size:15,color:C.white,w:354}));
  c.appendChild(info); shadow(c,20,48,0.3); COMP.cardPerson=c;

  // Card/Process
  c=figma.createComponent(); c.name='Card/Process'; c.resize(393,400); c.cornerRadius=16; c.fills=[gradVUp(C.dv,C.white)];
  c.layoutMode='VERTICAL'; c.itemSpacing=16; c.primaryAxisSizingMode='FIXED'; c.counterAxisSizingMode='FIXED';
  c.paddingTop=28;c.paddingLeft=28;c.paddingRight=28;c.paddingBottom=28;
  const tim=AL('timer','HORIZONTAL',{gap:6,pt:5,pb:5,pl:6,pr:14,radius:9,fill:solid(C.v,0.12),align:'CENTER'});
  tim.appendChild(T('30 min',{font:F.med,size:20,color:C.v})); c.appendChild(tim);
  c.appendChild(T('Parli direttamente con il tuo futuro team',{font:F.med,size:30,color:C.v,lh:115,w:337}));
  c.appendChild(T('I tuoi futuri colleghi ci tengono a scambiare con te una chiacchierata introduttiva e informale.',{font:F.reg,size:17,color:C.nv,lh:155,w:337})); shadow(c,18,40,0.14); COMP.cardProcess=c;

  // Card/Benefit
  c=figma.createComponent(); c.name='Card/Benefit'; c.resize(610,360); c.cornerRadius=24; c.fills=[gradVUp(C.dv,C.white)];
  c.layoutMode='VERTICAL'; c.itemSpacing=14; c.primaryAxisSizingMode='FIXED'; c.counterAxisSizingMode='FIXED';
  c.paddingTop=36;c.paddingLeft=36;c.paddingRight=36;c.paddingBottom=36;
  const ico=AL('icon','HORIZONTAL',{p:14,radius:12,fill:solid(C.white),align:'CENTER',justify:'CENTER'});
  ico.appendChild(spark(24,C.v)); c.appendChild(ico);
  c.appendChild(T('Supporto alla salute fisica e mentale',{font:F.med,size:34,color:C.v,lh:115,w:538}));
  c.appendChild(T('Coperture sanitarie integrative e la partnership con Unobravo ne sono esempi.',{font:F.reg,size:18,color:C.ink424,lh:150,w:538}));
  const logos=AL('logos','HORIZONTAL',{gap:24,align:'CENTER',pt:8}); logos.name='logos';
  for(let i=0;i<3;i++){ const lr=logoRect('unobravo',120,34); lr.name='logo'+i; logos.appendChild(lr); }
  c.appendChild(logos);
  shadow(c,18,44,0.14); COMP.cardBenefit=c;

  // Row/Job
  c=figma.createComponent(); c.name='Row/Job'; c.resize(INNER,80); c.layoutMode='HORIZONTAL'; c.counterAxisAlignItems='CENTER'; c.itemSpacing=12;
  c.primaryAxisSizingMode='FIXED'; c.counterAxisSizingMode='FIXED'; c.paddingTop=20;c.paddingBottom=20;
  const title=T('Senior | Sviluppatore Front-end — React.JS',{font:F.reg,size:18,color:C.nv,ls:2});
  c.appendChild(title); title.layoutGrow=1;
  c.appendChild(T('📍 Frosinone',{font:F.reg,size:16,color:C.v}));
  c.appendChild(T('Full-time',{font:F.reg,size:16,color:C.v}));
  c.appendChild(T('Ibrido',{font:F.reg,size:16,color:C.v}));
  const arr=AL('arrow','HORIZONTAL',{radius:11,fill:solid(C.v),align:'CENTER',justify:'CENTER'}); arr.resize(52,52);
  arr.counterAxisSizingMode='FIXED'; arr.primaryAxisSizingMode='FIXED'; arr.appendChild(arrowSvg()); c.appendChild(arr); COMP.rowJob=c;

  // AwardStat
  c=figma.createComponent(); c.name='AwardStat'; c.layoutMode='VERTICAL'; c.itemSpacing=8; c.counterAxisAlignItems='CENTER'; c.resize(280,150);
  c.primaryAxisSizingMode='FIXED'; c.counterAxisSizingMode='FIXED';
  const cup=figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24"><path d="M6 4h12v4.5a6 6 0 0 1-12 0V4Z" stroke="#fff" stroke-width="1.7" fill="none" stroke-linejoin="round"/><path d="M6 5.5H3.5v1.5A3 3 0 0 0 6.5 10" stroke="#fff" stroke-width="1.7" fill="none"/><path d="M18 5.5h2.5v1.5A3 3 0 0 1 17.5 10" stroke="#fff" stroke-width="1.7" fill="none"/><path d="M12 14.5V17M8.5 20.5h7" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>');
  c.appendChild(cup);
  c.appendChild(T('Leader della crescita',{font:F.bold,size:22,color:C.white,align:'CENTER',w:260}));
  c.appendChild(T('per Il Sole 24 Ore e Statista',{font:F.reg,size:16,color:C.white,opacity:0.75,align:'CENTER',w:260})); COMP.awardStat=c;
}
function inst(comp){ return comp.createInstance(); }

/* ════════════════ SEZIONI ════════════════ */
function section(name,fill,o){
  o=o||{};
  const s=AL(name,'VERTICAL',{w:W,fixedW:true,fill:fill,pt:o.pt||120,pb:o.pb||120,pl:PAD,pr:PAD,gap:o.gap||0,align:o.align||'MIN'});
  return s;
}

function buildHero(){
  const s=AL('01 · Hero','VERTICAL',{w:W,fixedW:true,fill:gradV(C.nv,C.v),pt:160,pb:0,pl:PAD,pr:PAD,gap:24,align:'CENTER'});
  const eye=AL('eyebrow','HORIZONTAL',{gap:8,align:'CENTER'});
  const dot=figma.createEllipse(); dot.resize(8,8); dot.fills=[solid(C.white)]; eye.appendChild(dot);
  eye.appendChild(T('30 POSIZIONI APERTE',{font:F.mono,size:11,color:C.white,opacity:0.6,spacing:1.4,upper:true}));
  s.appendChild(eye);
  s.appendChild(T('Diventa il prossimo\nSuper Human!',{font:F.med,size:96,color:C.white,lh:100,align:'CENTER',w:1100}));
  s.appendChild(T('Preparati a costruire prodotti che muovono KPI di business, generando impatto dalla prima riga di codice al go-live.',{font:F.reg,size:24,color:C.g,lh:135,align:'CENTER',w:820}));
  const ctas=AL('ctas','HORIZONTAL',{gap:12,align:'CENTER',pt:8});
  ctas.appendChild(inst(COMP.btnPrimary));
  const ghost=AL('Button/Ghost','HORIZONTAL',{pt:14,pb:14,pl:24,pr:24,radius:11,fill:solid(C.white,0.12),stroke:{c:C.white,o:0.3,w:1}});
  ghost.appendChild(T('Scopri come lavoriamo',{font:F.mono,size:15,color:C.white})); ctas.appendChild(ghost);
  s.appendChild(ctas);
  const sp=figma.createFrame(); sp.name='spacer'; sp.resize(10,40); sp.fills=[]; s.appendChild(sp);
  const stats=AL('stats','HORIZONTAL',{w:INNER,fixedW:true,gap:0,justify:'SPACE_BETWEEN',pt:30});
  stats.strokes=[solid(C.white,0.15)]; stats.strokeWeight=0; stats.strokeTopWeight=1;
  [['700+','PRODOTTI LANCIATI'],['10','ANNI DI AI'],['70%','CLIENTI INTERNAZIONALI'],['IT+US','FROSINONE · SAN FRANCISCO']].forEach(d=>{
    const it=inst(COMP.stat); it.children[0].characters=d[0]; it.children[1].characters=d[1]; stats.appendChild(it);
  });
  s.appendChild(stats);
  const sp2=figma.createFrame(); sp2.name='spacer'; sp2.resize(10,80); sp2.fills=[]; s.appendChild(sp2);
  // Spark fluttuanti (assoluti)
  [[120,160,74],[1230,360,120],[1130,300,44]].forEach(d=>{ const sk=spark(d[2],C.white); sk.opacity=0.10; abs(s,sk,d[0],d[1]); });
  // 4 card foto (assolute, ruotate)
  function heroPhoto(key,x,y,w,h,rot){
    const fr=AL('hero-photo','VERTICAL',{radius:22,clip:true}); fr.resize(w,h); fr.counterAxisSizingMode='FIXED'; fr.primaryAxisSizingMode='FIXED';
    const im=imgRect(key,w,h); abs(fr,im,0,0); shadow(fr,30,80,0.45);
    abs(s,fr,x,y); fr.rotation=rot;
  }
  heroPhoto('carlo', 40, 470, 190, 250, 5);
  heroPhoto('mc1', 1210, 430, 196, 258, -5);
  heroPhoto('pasquale', 150, 250, 150, 198, -8);
  heroPhoto('emanuele', 1120, 240, 150, 198, 8);
  return s;
}

function awardStrip(){
  const s=AL('Award strip','HORIZONTAL',{w:W,fixedW:true,fill:solid(C.white),pt:24,pb:24,pl:PAD,pr:PAD,gap:40,align:'CENTER'});
  const items=[['bw','Best Workplaces Italia · Great Place to Work®'],['ft','Europe’s 1000 Fastest Growing · Financial Times'],['bwgenz','Best Workplaces for Gen Z'],[null,'Growth Leader · Sole 24 Ore / Statista']];
  items.forEach((it,i)=>{
    if(i>0) s.appendChild(spark(12,C.v));
    const cell=AL('award','HORIZONTAL',{gap:12,align:'CENTER'});
    if(it[0]&&IMG[it[0]]) cell.appendChild(logoRect(it[0],46,46));
    cell.appendChild(T(it[1],{font:F.med,size:14,color:C.nv}));
    s.appendChild(cell);
  });
  return s;
}

function manifesto(){
  const s=section('02 · Manifesto',gradVUp(C.v,C.nv),{gap:56});
  const chip=inst(COMP.chip); chip.children[0].characters='CHI SIAMO'; chip.fills=[solid(C.white,0.08)]; chip.strokes=[solid(C.white,0.15)]; chip.children[0].fills=[solid(C.white,0.7)]; s.appendChild(chip);
  s.appendChild(T('Non siamo una consulenza.\nI prodotti li costruiamo davvero.',{font:F.med,size:80,color:C.white,lh:100,ls:-3,w:INNER}));
  s.appendChild(T('700 prodotti in 10 anni. Airbnb, Amazon, Angelini — e siamo solo alla lettera A. AI dal 2015. Il ritmo è alto. Il livello dei clienti è internazionale.',{font:F.reg,size:22,color:C.white,opacity:0.65,lh:155,w:600}));
  const row=AL('pillars','HORIZONTAL',{w:INNER,fixedW:true,gap:0,stroke:{c:C.white,o:0.12,w:1},radius:18,clip:true});
  [['Non siamo una consulenza. Affianchiamo chi costruisce prodotti veri.'],['Dall’analisi al delivery. Niente handoff.'],['Il ritmo è alto. Lo cerchi o non è il posto giusto.']].forEach((p,i)=>{
    const col=AL('pillar','VERTICAL',{p:32,gap:12,fill:solid(C.white,0.04)});
    col.appendChild(spark(20,C.v));
    col.appendChild(T(p[0],{font:F.med,size:20,color:C.white,lh:130,w:330}));
    addGrow(row,col); col.counterAxisSizingMode='FIXED';
    if(i<2){ col.strokes=[solid(C.white,0.12)]; col.strokeWeight=0; col.strokeRightWeight=1; }
  });
  s.appendChild(row);
  return s;
}

function progetti(){
  const s=section('03 · Progetti',gradV(C.v,C.dk),{gap:48});
  const top=AL('top','HORIZONTAL',{w:INNER,fixedW:true,gap:48,align:'MAX'});
  const tl=AL('tl','VERTICAL',{gap:0}); tl.appendChild(T('Progetti ambiziosi,\nper persone ambiziose',{font:F.med,size:60,color:C.white,lh:105,ls:-2,w:560})); addGrow(top,tl); tl.counterAxisSizingMode='FIXED';
  const tr=AL('tr','VERTICAL',{gap:0}); tr.appendChild(T('Lavorerai su sfide concrete e sistemi veloci, solidi, scalabili. Piattaforme che crescono. Architetture che sostengono migliaia di interazioni.',{font:F.reg,size:20,color:C.white,opacity:0.7,lh:150,w:560})); addGrow(top,tr); tr.counterAxisSizingMode='FIXED';
  s.appendChild(top);
  const row=AL('cards','HORIZONTAL',{gap:20});
  [['CASO · 01','Sistema legacy → microservizi','uns1'],['CASO · 02','AI nel customer service','uns2'],['CASO · 03','App enterprise multi-mercato','uns3']].forEach(cd=>{
    const it=inst(COMP.cardProject);
    const ch=it.findOne(n=>n.name==='chip'); if(ch&&ch.children[0]) ch.children[0].characters=cd[0];
    const ti=it.findOne(n=>n.name==='title'); if(ti) ti.characters=cd[1];
    const ph=it.findOne(n=>n.name==='photo'); if(ph&&IMG[cd[2]]) ph.fills=[IMG[cd[2]]];
    row.appendChild(it);
  });
  s.appendChild(row);
  const bar=AL('nda-bar','HORIZONTAL',{w:INNER,fixedW:true,p:28,radius:14,fill:solid(C.v),gap:24,align:'CENTER',justify:'SPACE_BETWEEN'});
  bar.appendChild(T('Molto di quello che costruiamo è coperto da NDA. La risposta te la diamo al primo colloquio.',{font:F.reg,size:16,color:C.white,lh:150,w:800}));
  const b=AL('Button/GhostW','HORIZONTAL',{pt:14,pb:14,pl:24,pr:24,radius:11,fill:solid(C.white,0.12),stroke:{c:C.white,o:0.3,w:1}}); b.appendChild(T('Candidati →',{font:F.mono,size:15,color:C.white})); bar.appendChild(b);
  s.appendChild(bar);
  return s;
}

function campo(){
  const s=section('04 · Entra in campo',gradVUp(C.v,C.nv),{gap:0});
  const g=AL('grid','HORIZONTAL',{w:INNER,fixedW:true,gap:56});
  const l=AL('l','VERTICAL',{gap:32});
  l.appendChild(T('Entra in campo per giocare la partita e vincerla',{font:F.med,size:64,color:C.white,lh:102,ls:-2,w:560}));
  l.appendChild(T('In Humans.tech vedi l’impatto di quello che fai e sei responsabile del risultato. Con una riga di codice rendi un prodotto più performante; con una decisione cambi le sorti di prodotti usati da milioni di utenti.',{font:F.reg,size:24,color:C.white,opacity:0.78,lh:145,w:560}));
  addGrow(g,l); l.counterAxisSizingMode='FIXED';
  const r=AL('boxes','VERTICAL',{gap:14});
  ['Lavorerai con team, tecnologie e clienti internazionali sulla cresta dell’onda.','Progetterai, costruirai (e se serve ripenserai meglio) soluzioni ad alta ingegneria.','Svilupperai codice di qualità e scalabile, per generare impatto per aziende e utenti.'].forEach(tx=>{
    const box=AL('box','VERTICAL',{p:24,radius:17,stroke:{c:C.g,o:1,w:1}});
    box.appendChild(T(tx,{font:F.reg,size:24,color:C.white,lh:140,w:500}));
    addFill(r,box); box.counterAxisSizingMode='FIXED';
  });
  addGrow(g,r); r.counterAxisSizingMode='FIXED';
  s.appendChild(g);
  return s;
}

function crescere(){
  const s=section('05 · Crescere',solid(C.nv),{gap:48});
  s.appendChild(T('Crescere in azienda\ne con l’azienda',{font:F.med,size:120,color:C.white,lh:90,ls:-3,w:INNER}));
  const row=AL('cards','HORIZONTAL',{gap:18});
  [['È entrato a 28 anni come full-stack dopo 4 anni in consulenza.','In 2 anni e mezzo ha preso ownership di un prodotto con 600k sessioni e guida un team di 4.','Pasquale · Copywriter → Success Manager'],
   ['Entra in Humans.tech a 20 anni.','Ha seguito cicli di prodotto completi su progetti per clienti europei e americani.','Cristian · Back-end → Team Lead'],
   ['Storia da raccogliere con HR.','Risultato concreto: scala tecnica, ownership, cambio funzione.','Stefano · Account Executive → Success Manager']].forEach((p,i)=>{
    const it=inst(COMP.cardPerson);
    const info=it.findOne(n=>n.name==='info'); if(info){ info.children[0].characters=p[0]; info.children[1].characters=p[1]; info.children[2].characters=p[2]; }
    const ph=it.findOne(n=>n.name==='photo'); const key=['mc1','mc','crstefano'][i]; if(ph&&IMG[key]) ph.fills=[IMG[key]];
    row.appendChild(it);
  });
  s.appendChild(row);
  const tr=AL('team','HORIZONTAL',{w:INNER,fixedW:true,gap:64,align:'CENTER',pt:40});
  // dot cluster con celle fisse 104px
  const grid=AL('dotcluster','VERTICAL',{gap:14}); grid.resize(340,340); grid.counterAxisSizingMode='FIXED'; grid.primaryAxisSizingMode='FIXED';
  for(let r0=0;r0<3;r0++){
    const rr=AL('r','HORIZONTAL',{gap:14}); rr.resize(340,104); rr.counterAxisSizingMode='FIXED'; rr.primaryAxisSizingMode='FIXED';
    for(let c0=0;c0<3;c0++){
      if((r0===0&&c0===1)||(r0===1&&c0===2)){
        const cell=AL('spark','HORIZONTAL',{align:'CENTER',justify:'CENTER'}); cell.resize(104,104); cell.counterAxisSizingMode='FIXED'; cell.primaryAxisSizingMode='FIXED'; cell.appendChild(spark(60,C.v)); rr.appendChild(cell);
      } else { const e=figma.createEllipse(); e.resize(104,104); e.fills=[solid(C.white,0.06)]; e.strokes=[solid(C.white,0.1)]; e.strokeWeight=1; rr.appendChild(e); }
    }
    grid.appendChild(rr);
  }
  tr.appendChild(grid);
  const tx=AL('tx','VERTICAL',{gap:24});
  tx.appendChild(T('Team piccoli, ritmo elevato',{font:F.med,size:64,color:C.white,lh:102,ls:-2,w:560}));
  tx.appendChild(T('Ogni progetto ha poche persone, un contesto definito e obiettivi chiari. La crescita rapida si vede nelle responsabilità che conquisti. La seniority non si misura con gli anni in azienda.',{font:F.reg,size:24,color:C.white,lh:135,w:560}));
  tx.appendChild(inst(COMP.btnWhite));
  addGrow(tr,tx); tx.counterAxisSizingMode='FIXED';
  s.appendChild(tr);
  return s;
}

async function sede(){
  const s=section('06 · La sede',solid(C.white),{gap:40,pt:96,pb:80});
  s.appendChild(T('Il primo hub tecnologico a Frosinone',{font:F.med,size:72,color:C.nv,lh:100,ls:-3,w:1000}));
  const media=AL('media','VERTICAL',{w:INNER,fixedW:true,radius:32,clip:true}); media.resize(INNER,540); media.counterAxisSizingMode='FIXED'; media.primaryAxisSizingMode='FIXED';
  media.fills=[pick('sedemain', gradV(C.nv,C.dk))]; s.appendChild(media);
  const g=AL('grid','HORIZONTAL',{w:INNER,fixedW:true,gap:64,pt:8});
  const c1=AL('c1','VERTICAL',{gap:16});
  c1.appendChild(T('La sede principale è a Frosinone: uno spazio immerso nel verde, pensato per incontrarsi, lavorare bene e costruire prodotti che funzionino lì fuori.',{font:F.reg,size:17,color:C.ink424,lh:160,w:540}));
  c1.appendChild(T('Tre piani modulari, sale immersive per demo di prodotto, sprint di sviluppo, momenti di co-design.',{font:F.reg,size:17,color:C.ink424,lh:160,w:540}));
  addGrow(g,c1); c1.counterAxisSizingMode='FIXED';
  const c2=AL('c2','VERTICAL',{gap:16});
  c2.appendChild(T('Si lavora intensamente. E ci si fa anche il caffè con calma prima di tornare al codice. Se valuti un trasferimento, ti diamo supporto concreto.',{font:F.reg,size:17,color:C.ink424,lh:160,w:540}));
  const rb=inst(COMP.btnPrimary); rb.children[0].characters='Leggi la guida alla relocation →'; c2.appendChild(rb);
  addGrow(g,c2); c2.counterAxisSizingMode='FIXED';
  s.appendChild(g);
  // galleria stanze reali
  const gal=AL('gallery','HORIZONTAL',{w:INNER,fixedW:true,gap:20,pt:8});
  [['room1','Sale modulari'],['room2','Ambienti demo AI'],['room3','Sale Share&Grow'],['room4','Co-creation']].forEach(rm=>{
    const card=AL('room','VERTICAL',{radius:24,clip:true,justify:'MAX',p:16}); card.resize(380,280); card.counterAxisSizingMode='FIXED'; card.primaryAxisSizingMode='FIXED';
    abs(card, imgRect(rm[0],380,280), 0,0);
    const sh=shadeRect(380,280,{r:0.02,g:0.02,b:0.12},C.dk); sh.opacity=0.35; abs(card,sh,0,0);
    const cap=AL('cap','HORIZONTAL',{pt:5,pb:5,pl:12,pr:12,radius:100,fill:solid(C.nv,0.55)}); cap.appendChild(T(rm[1],{font:F.mono,size:12,color:C.white})); card.appendChild(cap);
    addGrow(gal,card);
  });
  s.appendChild(gal);
  return s;
}

async function bestWorkplace(){
  const s=section('07 · Best Workplace',solid(C.v),{gap:64});
  const card=AL('card','VERTICAL',{w:INNER,fixedW:true,radius:20,clip:true,align:'CENTER',justify:'CENTER',pt:80,pb:80,pl:48,pr:48,gap:22}); card.resize(INNER,560); card.counterAxisSizingMode='FIXED'; card.primaryAxisSizingMode='FIXED';
  card.fills=[pick('thebest', gradV(C.dk,C.v))];
  // overlay scuro per leggibilità
  const ov=shadeRect(INNER,560,{r:0.02,g:0.02,b:0.12},C.v); ov.opacity=0.7; abs(card,ov,0,0);
  // badge GPTW angoli
  if(IMG.bwgenz){ abs(card, logoRect('bwgenz',150,108), 46, 32); }
  if(IMG.bw){ abs(card, logoRect('bw',150,108), INNER-150-46, 32); }
  card.appendChild(T('Best Workplace Italia.\nPer davvero!',{font:F.med,size:64,color:C.white,lh:102,align:'CENTER',w:900}));
  card.appendChild(T('Quest’anno siamo stati riconosciuti tra le migliori aziende in cui lavorare con il premio BestWorkplaces di Great Place To Work® Italia, che si aggiunge al premio GPTW per la Gen Z.',{font:F.reg,size:24,color:C.white,lh:140,align:'CENTER',w:880}));
  const b=AL('Button/Icon','HORIZONTAL',{gap:14,align:'CENTER'});
  const bbox=AL('IconBox','HORIZONTAL',{p:13,fill:solid(C.white),radius:13,align:'CENTER',justify:'CENTER'}); bbox.appendChild(spark(20,C.v)); b.appendChild(bbox);
  b.appendChild(T('Unisciti a noi',{font:F.mono,size:15,color:C.white})); card.appendChild(b);
  s.appendChild(card);
  const sub=T('Abbiamo raggiunto questo traguardo un tassello alla volta, con e grazie ai nostri Humans.',{font:F.reg,size:24,color:C.white,lh:130,align:'CENTER',w:894}); s.appendChild(sub); sub.layoutSizingHorizontal='FILL'; sub.textAlignHorizontal='CENTER';
  const row=AL('stats','HORIZONTAL',{gap:40,justify:'CENTER'});
  [['Leader della crescita','per Il Sole 24 Ore e Statista'],['Campioni della Crescita','per l’ITQF e La Repubblica'],['Tra le 1000 aziende in crescita in Europa','per il Financial Times']].forEach(d=>{ const it=inst(COMP.awardStat); it.children[1].characters=d[0]; it.children[2].characters=d[1]; row.appendChild(it); });
  addFill(s,row);
  return s;
}

function processo(){
  const s=section('08 · Processo + Benefit',gradVUp(C.v,C.white),{gap:72,pb:128});
  const h=T('Il percorso per entrare in Humans.tech è snello e veloce: 2,5 ore per conoscerci',{font:F.med,size:64,color:C.v,lh:108,ls:-2,align:'CENTER',w:1130}); s.appendChild(h); h.layoutSizingHorizontal='FILL'; h.textAlignHorizontal='CENTER';
  const row=AL('cards','HORIZONTAL',{gap:20});
  [['30 min','Parli direttamente con il tuo futuro team','I tuoi futuri colleghi ci tengono a scambiare con te una chiacchierata informale. Chi meglio di loro per dirti com’è lavorare qui?'],
   ['30 min','Conosci i nostri founder','Massima trasparenza su cultura, metodo e benefit. Puoi chiederci tutto, dal fatturato ai progetti in corso.'],
   ['90 min','Entri in gioco con una prova concreta','Pair programming o pair design: come pensi, come affronti un problema, come collabori.']].forEach(d=>{ const it=inst(COMP.cardProcess); it.children[0].children[0].characters=d[0]; it.children[1].characters=d[1]; it.children[2].characters=d[2]; row.appendChild(it); });
  s.appendChild(row);
  // ingrediente
  const ing=AL('ingrediente','HORIZONTAL',{w:INNER,fixedW:true,gap:64,align:'CENTER',pt:24});
  const il=AL('il','VERTICAL',{gap:24});
  il.appendChild(T('L’ingrediente segreto?',{font:F.med,size:52,color:C.white,lh:110,ls:-2,w:560}));
  il.appendChild(T('Capire se scatta la giusta sintonia, quella scintilla che ci spinge allo step successivo. Se vuoi metterti in gioco, sai già cosa fare!',{font:F.reg,size:18,color:C.white,lh:160,w:560}));
  const ib=inst(COMP.btnIcon); ib.children[1].characters='Scopri le posizioni aperte'; il.appendChild(ib);
  addGrow(ing,il); il.counterAxisSizingMode='FIXED';
  const ir=AL('photos','HORIZONTAL',{gap:0}); ir.resize(560,440); ir.counterAxisSizingMode='FIXED'; ir.primaryAxisSizingMode='FIXED'; ir.fills=[]; ir.clipsContent=false;
  { const p1=AL('p1','VERTICAL',{radius:22,clip:true}); p1.resize(320,300); p1.counterAxisSizingMode='FIXED'; p1.primaryAxisSizingMode='FIXED'; abs(p1,imgRect('francesco',320,300),0,0); shadow(p1,24,60,0.4); abs(ir,p1,0,0); p1.rotation=4;
    const p2=AL('p2','VERTICAL',{radius:22,clip:true}); p2.resize(320,300); p2.counterAxisSizingMode='FIXED'; p2.primaryAxisSizingMode='FIXED'; abs(p2,imgRect('postit',320,300),0,0); shadow(p2,24,60,0.4); abs(ir,p2,240,140); p2.rotation=-4; }
  addGrow(ing,ir);
  s.appendChild(ing);
  // benefit
  s.appendChild(T('Benefit aziendali',{font:F.med,size:64,color:C.white,lh:100,ls:-2,w:INNER}));
  const br=AL('benefit','HORIZONTAL',{w:INNER,fixedW:true,gap:20});
  [['Supporto alla salute fisica e mentale','Coperture sanitarie integrative e la partnership con Unobravo ne sono esempi.',['unobravo','fondoest','sanimpresa']],
   ['Benessere finanziario','Promuoviamo l’educazione finanziaria, a lavoro e fuori, per gestire al meglio le proprie risorse.',['starting']]].forEach(d=>{
    const it=inst(COMP.cardBenefit); it.children[1].characters=d[0]; it.children[2].characters=d[1];
    const lg=it.findOne(n=>n.name==='logos');
    if(lg){ for(let i=0;i<3;i++){ const slot=lg.findOne(n=>n.name==='logo'+i); if(!slot)continue; const key=d[2][i]; if(key&&IMG[key]) slot.fills=[{type:'IMAGE',scaleMode:'FIT',imageHash:IMG[key].imageHash}]; else slot.visible=false; } }
    addGrow(br,it);
  });
  s.appendChild(br);
  return s;
}

function candidatura(){
  const s=section('09 · Candidatura',solid(C.v),{pt:64,pb:64});
  const card=AL('card','HORIZONTAL',{w:INNER,fixedW:true,p:48,radius:24,fill:solid(C.o),gap:48,align:'CENTER',justify:'SPACE_BETWEEN'});
  const tx=AL('tx','VERTICAL',{gap:16});
  tx.appendChild(T('Sei pronto a fare la differenza?',{font:F.med,size:48,color:C.white,lh:105,ls:-2,w:720}));
  tx.appendChild(T('Alcune delle persone migliori sono arrivate così: con un messaggio diretto, una traiettoria chiara. Manda la tua candidatura spontanea: chi sei, cosa sai fare, dove vuoi arrivare.',{font:F.reg,size:17,color:C.white,lh:150,w:720}));
  addGrow(card,tx); tx.counterAxisSizingMode='FIXED';
  const b=inst(COMP.btnIcon); b.children[1].characters='Candidati ora'; card.appendChild(b);
  shadow(card,24,60,0.25);
  s.appendChild(card);
  return s;
}

async function teamPhoto(){
  const f=AL('Team photo','VERTICAL',{w:W,fixedW:true,clip:true}); f.resize(W,600); f.counterAxisSizingMode='FIXED'; f.primaryAxisSizingMode='FIXED';
  f.fills=[pick('teamall', gradV(C.v,C.dk))];
  return f;
}

function posizioni(){
  const s=section('10 · Posizioni',solid(C.white),{gap:40,align:'CENTER'});
  s.appendChild(T('Ora tocca a te!',{font:F.med,size:80,color:C.nv,lh:100,ls:-3}));
  const filt=AL('filtri','HORIZONTAL',{gap:12,justify:'CENTER'});
  ['Tutte le aree ↓','Tutti i livelli ↓','Tech ↓','Design ↓','Sales ↓'].forEach((t,i)=>{
    const b=AL('filter','HORIZONTAL',{pl:22,pr:22,radius:15,align:'CENTER',justify:'CENTER',stroke:{c:C.nv,o:1,w:1}}); b.resize(10,52); b.counterAxisSizingMode='FIXED';
    if(i===0){ b.fills=[solid(C.v)]; b.strokes=[solid(C.v)]; }
    b.appendChild(T(t,{font:F.reg,size:17,color:i===0?C.white:C.nv})); filt.appendChild(b);
  });
  s.appendChild(filt);
  const list=AL('Sviluppo','VERTICAL',{w:INNER,fixedW:true,gap:0,pt:24});
  list.appendChild(T('Sviluppo',{font:F.med,size:30,color:C.nv}));
  ['Senior | Sviluppatore Front-end — React.JS','Senior | Sviluppatore Back-end — Node.js','Senior | Mobile Developer — Flutter'].forEach(tt=>{ const r=inst(COMP.rowJob); r.children[0].characters=tt; r.strokes=[solid(C.g)]; r.strokeWeight=0; r.strokeBottomWeight=1; list.appendChild(r); });
  s.appendChild(list);
  s.appendChild(T('Non hai trovato posizioni aperte in linea con il tuo profilo?',{font:F.med,size:60,color:C.nv,lh:112,ls:-2,align:'CENTER',w:820}));
  const box=AL('cta-box','HORIZONTAL',{w:920,fixedW:true,p:36,radius:18,fill:solid(C.v),gap:40,align:'CENTER',justify:'SPACE_BETWEEN'});
  box.appendChild(T('Se vuoi spingerti oltre e raggiungere nuove vette, inviaci la tua candidatura. Non vediamo l’ora di conoscerti!',{font:F.reg,size:18,color:C.white,lh:150,w:420}));
  const b2=inst(COMP.btnIcon); b2.children[0].fills=[solid(C.white,0.18)]; try{b2.children[0].children[0].findAll(x=>x.type==='VECTOR').forEach(v=>v.fills=[solid(C.white)]);}catch(e){} b2.children[1].characters='Invia una candidatura spontanea'; box.appendChild(b2);
  s.appendChild(box);
  return s;
}

function footer(){
  const dark=hex('08081C');
  const s=AL('Footer','VERTICAL',{w:W,fixedW:true,fill:solid(dark),pt:80,pb:28,pl:PAD,pr:PAD,gap:56});
  // griglia 3 colonne
  const grid=AL('grid','HORIZONTAL',{w:INNER,fixedW:true,gap:56,align:'MIN'});
  // sinistra
  const left=AL('left','VERTICAL',{gap:0}); left.fills=[];
  const logo=AL('logo','HORIZONTAL',{gap:2,align:'MIN'});
  logo.appendChild(T('humans',{font:F.bold,size:30,color:C.white,ls:-2}));
  logo.appendChild(T('.tech',{font:F.reg,size:30,color:C.white,ls:-2}));
  logo.appendChild(spark(17,C.v)); left.appendChild(logo);
  left.appendChild(T('your added value.',{font:F.med,size:22,color:C.white}));
  const sp0=figma.createFrame(); sp0.resize(10,20); sp0.fills=[]; left.appendChild(sp0);
  const badges=AL('badges','HORIZONTAL',{gap:16,align:'CENTER'});
  if(IMG.bwgenz) badges.appendChild(logoRect('bwgenz',46,46));
  if(IMG.bw) badges.appendChild(logoRect('bw',46,46));
  badges.appendChild(T("2026 Europe's Fastest Growing Companies",{font:F.med,size:12,color:C.white,lh:120,w:130}));
  if(IMG.ft) badges.appendChild(logoRect('ft',46,46));
  left.appendChild(badges);
  const sp1=figma.createFrame(); sp1.resize(10,24); sp1.fills=[]; left.appendChild(sp1);
  left.appendChild(T('Siamo fra le 1000 aziende in crescita in Europa per Financial Times & Statista, Leader della crescita per Il Sole 24 Ore e Statista, Campioni della Crescita secondo ITQF e La Repubblica e tra le migliori aziende in cui lavorare per GPTW Italia.',{font:F.reg,size:14,color:C.white,opacity:0.68,lh:160,w:380}));
  const sp2=figma.createFrame(); sp2.resize(10,22); sp2.fills=[]; left.appendChild(sp2);
  left.appendChild(T('Seguici su   in    ◉',{font:F.reg,size:15,color:C.white,opacity:0.7}));
  grid.appendChild(left); left.counterAxisSizingMode='FIXED'; left.resize(420,Math.max(1,left.height));
  // divisore
  const dv=figma.createRectangle(); dv.resize(1,360); dv.fills=[solid(C.white,0.12)]; grid.appendChild(dv);
  // centro
  const center=AL('center','VERTICAL',{gap:0}); center.fills=[];
  center.appendChild(T('Contattaci  ↗',{font:F.med,size:60,color:C.white,ls:-2,lh:120}));
  center.appendChild(T('Lavora con noi  ↗',{font:F.med,size:60,color:C.white,ls:-2,lh:120}));
  const sp3=figma.createFrame(); sp3.resize(10,56); sp3.fills=[]; center.appendChild(sp3);
  center.appendChild(T('welcome@humans.tech',{font:F.reg,size:15,color:C.white,opacity:0.82}));
  const sp4=figma.createFrame(); sp4.resize(10,14); sp4.fills=[]; center.appendChild(sp4);
  center.appendChild(T('FROSINONE | ROMA | MILANO | SAN FRANCISCO',{font:F.mono,size:13,color:C.white,spacing:0.6}));
  addGrow(grid,center); center.counterAxisSizingMode='FIXED';
  // destra: menu
  const right=AL('right','VERTICAL',{gap:15}); right.fills=[];
  ['Perché esistiamo','Cosa facciamo','Come lavoriamo','Chi siamo','Lavori realizzati','Manifesto','Blog','Press'].forEach(m=>right.appendChild(T(m,{font:F.reg,size:16,color:C.white})));
  const sp5=figma.createFrame(); sp5.resize(10,20); sp5.fills=[]; right.appendChild(sp5);
  right.appendChild(T('◉  EN   IT',{font:F.mono,size:13,color:C.white,opacity:0.7}));
  grid.appendChild(right);
  s.appendChild(grid);
  // barra inferiore
  const bottom=AL('bottom','HORIZONTAL',{w:INNER,fixedW:true,gap:24,justify:'SPACE_BETWEEN',align:'CENTER',pt:22,stroke:{c:C.white,o:0.1,w:0}});
  bottom.strokeTopWeight=1; bottom.strokes=[solid(C.white,0.1)];
  bottom.appendChild(T('©2026 Humans s.r.l. | Via Casamari, 91 – 03100 Frosinone, Italy | VAT IT 02874880608',{font:F.reg,size:12,color:C.white,opacity:0.5}));
  const legal=AL('legal','HORIZONTAL',{gap:20}); ['Whistleblowing','Codice Etico','Privacy','Cookie','Preference','Notice at Collection'].forEach(l=>legal.appendChild(T(l,{font:F.mono,size:12,color:C.white,opacity:0.5}))); bottom.appendChild(legal);
  s.appendChild(bottom);
  return s;
}

/* ─── NAVBAR (bianca, DM Mono) ─── */
function navbar(){
  const wrap=AL('Navbar','VERTICAL',{w:W,fixedW:true,pt:60,pb:0,pl:PAD,pr:PAD}); wrap.fills=[];
  const ni=AL('ni','HORIZONTAL',{w:INNER,fixedW:true,pt:12,pb:12,pl:24,pr:24,radius:14,fill:solid(C.white),align:'CENTER',gap:30});
  shadow(ni,6,24,0.10);
  const logo=AL('logo','HORIZONTAL',{gap:2,align:'MIN'});
  logo.appendChild(T('humans',{font:F.bold,size:22,color:C.nv,ls:-2}));
  logo.appendChild(T('.tech',{font:F.reg,size:22,color:C.nv,ls:-2}));
  logo.appendChild(spark(15,C.v)); ni.appendChild(logo);
  const menu=AL('menu','HORIZONTAL',{gap:30,align:'CENTER'});
  ['Perché esistiamo','Cosa facciamo','Come lavoriamo','Lavori realizzati','Chi siamo','Blog'].forEach(m=>menu.appendChild(T(m,{font:F.mono,size:14,color:hex('1E1E2D')})));
  addGrow(ni,menu);
  const cta=AL('cta','HORIZONTAL',{gap:8,align:'CENTER'});
  const b1=AL('Entra','HORIZONTAL',{pt:14,pb:14,pl:20,pr:20,radius:11,fill:solid(C.g),gap:8,align:'CENTER'});
  b1.appendChild(T('→',{font:F.mono,size:14,color:C.v})); b1.appendChild(T('Entra nel team',{font:F.mono,size:14,color:C.v})); cta.appendChild(b1);
  const b2=AL('Contattaci','HORIZONTAL',{pt:14,pb:14,pl:20,pr:20,radius:11,fill:solid(C.v),gap:8,align:'CENTER'});
  b2.appendChild(T('→',{font:F.mono,size:14,color:C.white})); b2.appendChild(T('Contattaci',{font:F.mono,size:14,color:C.white})); cta.appendChild(b2);
  ni.appendChild(cta);
  wrap.appendChild(ni);
  return wrap;
}

/* ════════════════ MAIN ════════════════ */
async function step(label, fn){
  try{ return await fn(); }
  catch(e){
    const msg = '✗ ['+label+'] '+ (e && e.message ? e.message : String(e));
    console.log(msg); console.log(e && e.stack ? e.stack : '');
    throw new Error(msg);
  }
}
async function main(){
  await step('loadFonts', loadFonts);
  await step('preloadImages', preloadImages);
  await step('buildComponents', async()=>buildComponents());

  const compFrame=AL('🧩 Components','HORIZONTAL',{gap:40,p:60,fill:solid(hex('F5F5F8')),align:'MIN'});
  [COMP.btnPrimary,COMP.btnWhite,COMP.btnIcon,COMP.chip,COMP.stat,COMP.cardProject,COMP.cardPerson,COMP.cardProcess,COMP.cardBenefit,COMP.rowJob,COMP.awardStat].forEach(c=>compFrame.appendChild(c));

  const page=AL('📄 Lavora con noi · Humans.tech','VERTICAL',{w:W,fixedW:true,gap:0,fill:solid(C.dk)});
  page.appendChild(await step('Navbar', async()=>navbar()));
  page.appendChild(await step('Hero', async()=>buildHero()));
  page.appendChild(await step('Award', async()=>awardStrip()));
  page.appendChild(await step('Manifesto', async()=>manifesto()));
  page.appendChild(await step('Progetti', async()=>progetti()));
  page.appendChild(await step('Campo', async()=>campo()));
  page.appendChild(await step('Crescere', async()=>crescere()));
  page.appendChild(await step('Sede', sede));
  page.appendChild(await step('BestWorkplace', bestWorkplace));
  page.appendChild(await step('Processo', async()=>processo()));
  page.appendChild(await step('Candidatura', async()=>candidatura()));
  page.appendChild(await step('TeamPhoto', teamPhoto));
  page.appendChild(await step('Posizioni', async()=>posizioni()));
  page.appendChild(await step('Footer', async()=>footer()));

  page.x=0; page.y=0; compFrame.x=W+200; compFrame.y=0;
  figma.currentPage.appendChild(page);
  figma.currentPage.appendChild(compFrame);
  figma.viewport.scrollAndZoomIntoView([page]);
  figma.closePlugin('✅ Pagina generata: sezioni, frame e componenti.');
}
main().catch(e=>{
  const m = e && e.message ? e.message : String(e);
  figma.notify(m, {error:true, timeout:12000});
  console.log('ERRORE PLUGIN →', m);
});
