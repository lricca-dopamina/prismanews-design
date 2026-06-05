// Aggiorna la scheda handoff di lp-bottom-nav con specifiche complete

const DATA = {
  title: 'lp-bottom-nav',
  fields: {
    '1 · Nome componente': 'lp-bottom-nav',
    '2 · Pagina / frame': 'Global / Mobile 375 / Default',
    '3 · Token usati (esistenti)': '--ink, --border, --accent, --muted',
    '4 · Token NUOVI (nome · Light · Dark)': 'nessuno',
    '6 · Responsive (cosa stacca / drawer / scroll / breakpoint)': 'Solo mobile — non appare su desktop. Larghezza 100%, altezza fissa 64px. Position fixed bottom:0.',
    '7 · Riusa componenti esistenti': 'nessuno — differente dalla BottomBar desktop esistente',
    '8 · Dati richiesti': '☑ Dati già esistenti\nStato attivo del tab corrente (home|perte|cron|profilo).\nGestito lato frontend come stato UI — nessun dato backend necessario.',
    '9 · Note libere': '4 varianti: tab attivo cambia per ciascuna (Home, Per te, Cronologia, Profilo).\nIcone SVG custom: giornale (Home), stelle (Per te), orologio freccia (Cronologia), persona (Profilo).\nTab attivo: icona in --accent (#B82027) + dot rosso 5px sopra.\nTab inattivo: icona in --muted (#7B7263).\nBorder top 1px --border. Nessuna label testuale sotto le icone.',
  },
};

async function fillNote(clone, data) {
  const allText = clone.findAll(n => n.type === 'TEXT');
  for (const t of allText) {
    const chars = t.characters;
    if (chars.includes('lp-…') || chars.includes('lp-divergence-flow')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['1 · Nome componente'];
    } else if (chars.includes('Schermata / Size / Stato')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['2 · Pagina / frame'];
    } else if (chars.includes('--ink, --cream, --accent')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['3 · Token usati (esistenti)'];
    } else if (chars.includes('--divergence-axis') || chars.includes('altrimenti: nessuno')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['4 · Token NUOVI (nome · Light · Dark)'];
    } else if (chars.includes('2 col →') || chars.includes('scroll orizzontale')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['6 · Responsive (cosa stacca / drawer / scroll / breakpoint)'];
    } else if (chars.includes('ToolButton, Chip') || chars.includes('altrimenti: nessuno')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['7 · Riusa componenti esistenti'];
    } else if (chars.includes('Se NUOVI: quale dato')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['8 · Dati richiesti'];
    } else if (chars.includes('dettagli, riferimenti, dubbi')) {
      await figma.loadFontAsync(t.fontName);
      t.characters = data.fields['9 · Note libere'];
    }
  }
  clone.name = `Handoff Note · ${data.title}`;
}

(async () => {
  // Cerca e cancella la scheda esistente se presente
  const existing = figma.currentPage.findOne(n => n.name === 'Handoff Note · lp-bottom-nav');
  if (existing) existing.remove();

  // Trova il template
  const template = figma.currentPage.findOne(n => n.name === 'Handoff Note · template');
  if (!template) {
    figma.notify('❌ Template non trovato.', { timeout: 3000 });
    figma.closePlugin();
    return;
  }

  // Trova ultima scheda esistente per posizionarsi accanto
  const lastNote = figma.currentPage.findOne(n => n.name === 'Handoff Note · lp-ticker');
  const clone = template.clone();
  clone.x = lastNote ? lastNote.x + lastNote.width + 60 : template.x + template.width * 4;
  clone.y = template.y;
  figma.currentPage.appendChild(clone);
  await fillNote(clone, DATA);

  figma.viewport.scrollAndZoomIntoView([clone]);
  figma.notify('✅ Scheda handoff lp-bottom-nav aggiornata!', { timeout: 3000 });
  figma.closePlugin();
})();
