/* Fix Fonts — riassegna i font corretti ai testi di un frame importato (html.to.design)
   Display (titoli/testo) = Neue Haas Grotesk Display (con fallback)
   Mono (navbar/pulsanti/etichette/maiuscoletti) = DM Mono (con fallback)
   Sceglie SOLO stili realmente disponibili nel Figma dell'utente → niente sostituzioni a caso. */

async function run(){
  // 1) font disponibili
  const list = await figma.listAvailableFontsAsync();
  const byFamily = {};
  list.forEach(f=>{ (byFamily[f.fontName.family]=byFamily[f.fontName.family]||[]).push(f.fontName.style); });
  const family = c => c.find(x=>byFamily[x]);
  function styleOf(fam, prefs){
    const av = byFamily[fam]||[];
    for(const p of prefs){ const h=av.find(s=>s.toLowerCase()===p.toLowerCase()); if(h) return h; }
    for(const p of prefs){ const h=av.find(s=>s.toLowerCase().includes(p.toLowerCase())); if(h) return h; }
    return av[0]||'Regular';
  }

  const DISP = family(['Neue Haas Grotesk Display Pro','Neue Haas Grotesk Display','NeueHaasDisplay Pro','Neue Haas Grotesk Display Std','Neue Haas Grotesk','Inter','Helvetica Neue','Arial']) || 'Inter';
  const MONO = family(['DM Mono','Roboto Mono','Space Mono','JetBrains Mono','IBM Plex Mono','Courier New','Inter']) || 'Inter';

  // mappa peso -> stile per ciascuna famiglia
  const S = {
    dispReg : {family:DISP, style: styleOf(DISP,['55 Roman','Roman','Regular','Book','Normal'])},
    dispMed : {family:DISP, style: styleOf(DISP,['65 Medium','Medium','55 Roman','Roman','Regular'])},
    dispBold: {family:DISP, style: styleOf(DISP,['75 Bold','Bold','65 Medium','Medium','Regular'])},
    monoReg : {family:MONO, style: styleOf(MONO,['Regular','Book','Normal','Light'])},
    monoMed : {family:MONO, style: styleOf(MONO,['Medium','Medium Italic','Regular','Book'])}
  };
  // carica tutti gli stili che useremo
  const uniq = {};
  Object.values(S).forEach(fn=>{ uniq[fn.family+'|'+fn.style]=fn; });
  for(const k in uniq){ try{ await figma.loadFontAsync(uniq[k]); }catch(e){} }

  // 2) raccogli i nodi testo dalla selezione (o intera pagina)
  const roots = figma.currentPage.selection.length ? figma.currentPage.selection : figma.currentPage.children;
  const texts = [];
  function walk(n){ if(n.type==='TEXT') texts.push(n); else if('children' in n) n.children.forEach(walk); }
  roots.forEach(walk);
  if(!texts.length){ figma.closePlugin('Nessun testo trovato. Seleziona il frame importato e rilancia.'); return; }

  function weightFromStyle(style){
    const s=(style||'').toLowerCase();
    if(/(^|\D)(7|8|9)\d{2}|bold|black|heavy|extrabold|semibold|600/.test(s)) return 'bold';
    if(/medium|65|600|semi|demi|500/.test(s)) return 'med';
    return 'reg';
  }
  function isUpperText(str){
    const letters = (str||'').replace(/[^A-Za-zÀ-ÿ]/g,'');
    return letters.length>=2 && letters===letters.toUpperCase();
  }

  let changed=0, mono=0, disp=0, errs=0;
  for(const t of texts){
    try{
      // segmenti con font/peso uniformi
      const segs = t.getStyledTextSegments(['fontName','fontSize']);
      for(const seg of segs){
        const cur = seg.fontName; if(!cur || cur===figma.mixed) continue;
        const fam = (cur.family||'').toLowerCase();
        const segText = t.characters.slice(seg.start, seg.end);
        // decisione MONO vs DISPLAY
        let useMono;
        if(fam.includes('mono')) useMono=true;
        else if(fam.includes('neue')||fam.includes('haas')||fam.includes('display')) useMono=false;
        else { // famiglia generica/sostituita → euristica: etichette mono = maiuscolo o testo piccolo
          useMono = isUpperText(segText) || (seg.fontSize && seg.fontSize<=14);
        }
        const w = weightFromStyle(cur.style);
        let target;
        if(useMono) target = (w==='reg') ? S.monoReg : S.monoMed;
        else target = w==='bold' ? S.dispBold : (w==='med' ? S.dispMed : S.dispReg);
        // applica solo se diverso
        if(cur.family!==target.family || cur.style!==target.style){
          await figma.loadFontAsync(target);
          t.setRangeFontName(seg.start, seg.end, target);
          changed++; if(useMono) mono++; else disp++;
        }
      }
    }catch(e){ errs++; }
  }

  figma.notify('Fix Fonts ✓  '+changed+' segmenti aggiornati · display: '+DISP+' · mono: '+MONO+(errs?(' · '+errs+' errori'):''), {timeout:6000});
  console.log('[Fix Fonts]', JSON.stringify({DISP,MONO,changed,disp,mono,errs,styles:S}));
  figma.closePlugin('Font sistemati: '+changed+' segmenti ('+disp+' display, '+mono+' mono). Display='+DISP+', Mono='+MONO);
}

run().catch(e=>{ console.log(e&&e.stack||e); figma.closePlugin('Errore: '+(e&&e.message||e)); });
