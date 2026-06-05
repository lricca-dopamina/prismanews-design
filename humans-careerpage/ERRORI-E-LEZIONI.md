# Errori e lezioni appresi — Prototipo Humans.tech × Dopamina

## 1. Immagini non caricate (path relativi vs assoluti)
**Problema:** Le immagini locali `img/...` non si caricavano perché il server `serve` rimuove `index.html`/slash finale dall'URL, quindi i path relativi puntavano alla root sbagliata.  
**Fix:** Usare path assoluti `/humans-careerpage/img/...` oppure (soluzione finale) lo script JS in `<head>` che riscrive i src relativi `img/...` alla cartella del file.  
**Lezione:** Quando si serve una pagina in una sottocartella, verificare sempre la base URL prima di usare path relativi.

---

## 2. Foto mappate per nome file (sbagliato) invece che per nodo Figma
**Problema:** Le foto delle persone (carlo, mattia-cristian-1, ecc.) venivano prese per nome dal CDN humans.tech — ma lì quei nomi corrispondono a foto **diverse** rispetto a quelle caricate nel Figma del cliente.  
**Fix:** Estrarre ogni asset direttamente dal nodo Figma specifico (`get_design_context` per nodo ID), non per nome file. Nodi diversi con lo stesso nome hanno fill diversi.  
**Lezione:** Non fare assunzioni sui nomi file. Ispezionare SEMPRE il nodo Figma esatto.

---

## 3. `clip-path: inset(0 0 0 0)` su tutti gli elementi animati → glow tagliato
**Problema:** La regola CSS `[data-a].go { clip-path: inset(0 0 0 0) }` (per l'animazione reveal) applicava un clip rettangolare a **tutti** gli elementi animati, tagliando di netto bagliori, anelli pulsanti e box-shadow di pulsanti e pallini.  
**Fix:** Limitare il `clip-path` solo agli elementi con `data-a="clip"` (l'unico tipo che lo richiede davvero).  
**Lezione:** Quando si notano glow/shadow tagliati, controllare `clip-path` oltre a `overflow:hidden`. Il `clip-path` non appare nelle verifiche di `overflow`.

---

## 4. `overflow:hidden` sulle sezioni → bagliori pulsanti tagliati
**Problema:** `#hero` e `#crescere` avevano `overflow:hidden` che tagliava il `box-shadow` (glow) dei pulsanti al bordo della sezione.  
**Fix:** Cambiato in `overflow:visible`. Il `body` ha già `overflow-x:hidden` quindi non compare scroll orizzontale.  
**Lezione:** Per sezioni con pulsanti luminosi, usare `overflow:visible` + affidarsi al body per gestire lo scroll orizzontale.

---

## 5. Video YouTube embed (Errore 153) — embed disabilitato
**Problema:** Il video YouTube `maYVp6nUWMs` ha l'incorporamento disabilitato dal proprietario → Errore 153 nell'iframe.  
**Fix:** Usare file `.mp4` locale. Il video 4K (109MB) è stato compresso con ffmpeg a 27MB (1080p, no audio, `faststart`).  
**Comando ffmpeg:**
```bash
ffmpeg -y -i input.mp4 -vf "scale=1920:-2" -c:v libx264 -crf 23 -preset fast \
  -movflags +faststart -an output.mp4
```
**Lezione:** Verificare sempre che i video YouTube abbiano l'embed abilitato prima di usarli in iframe. Per autoplay muto serve sempre un file locale `.mp4`.

---

## 6. Video inserito come sezione separata dopo la hero → carosello loghi spostato
**Problema:** Ho aggiunto la sezione video come blocco HTML separato tra `</section>` hero e il carosello loghi, spingendo giù l'award strip.  
**Fix:** Rimosso il blocco; il video HR va **dentro** la hero come sfondo (o placeholder), non come sezione aggiuntiva.  
**Lezione:** Prima di aggiungere sezioni, verificare sempre l'impatto sul flusso degli elementi successivi.

---

## 7. Carosello sede — CSS animation + RAF JS → flash e lag
**Problema:** Combinare CSS `@keyframes` con un RAF JS causa:
- Flash iniziale (CSS parte subito, poi JS la disabilita)
- Lag perché `track.scrollWidth` veniva letto 60 volte al secondo nel RAF (forza layout recalc ogni frame)

**Fix finale:** CSS animation pura (`@keyframes sgScroll`) per l'auto-scroll + JS minimale solo per drag/wheel che legge la posizione CSS corrente, ferma l'animazione durante il drag, la riprende con `animationDelay` calcolato dalla posizione.  
**Lezione:** Non mescolare CSS animation con RAF JS sullo stesso elemento. Scegliere uno dei due. Se usi RAF, cachare sempre valori di layout (`scrollWidth`, `offsetHeight`) fuori dal loop.

---

## 8. `nav` globale applicata anche al menu footer
**Problema:** Il footer usava `<nav class="ft-menu">` e la regola CSS `nav { position: fixed; top: 46px }` si applicava anche a quella nav, incollando il menu del footer in alto a sinistra sopra la hero.  
**Fix:** Cambiato `<nav class="ft-menu">` in `<div class="ft-menu">`.  
**Lezione:** Non usare tag semantici (`nav`, `header`, `footer`) nel markup se esistono regole CSS globali su quei tag. Usare classi specifiche.

---

## 9. Foto sede + pulsante play YouTube
**Problema:** Dopo la rimozione dell'iframe (Errore 153), la foto sede non aveva feedback visivo che fosse un video.  
**Fix:** Foto con overlay pulsante play SVG che apre YouTube in nuova tab. Poi sostituita con `<video>` locale autoplay muto con IntersectionObserver per avvio allo scroll.

---

## 10. Distanza eccessiva tra testo sede e carosello foto
**Problema:** `#sede { padding-bottom: 80px }` creava spazio vuoto prima della chiusura della sezione, che appariva come banda scura (body background) tra il testo e la gallery (che era fuori dalla section).  
**Fix:** `padding-bottom: 0` su `#sede` + gallery rimessa **dentro** la section.  
**Lezione:** Quando un elemento full-width viene estratto dal suo contenitore, il background del body può trasparire nei gap. Meglio tenerlo dentro il contenitore con lo stesso background.

---

## 11. Font navbar sbagliati (neue-haas invece di DM Mono)
**Problema:** Ho ispezionato per errore i link nascosti del mega-menu (in Neue Haas Grotesk) invece delle voci **visibili** della navbar, che usano DM Mono 14px/400.  
**Fix:** Ispezione con `document.elementsFromPoint()` sulla posizione reale degli elementi visibili nel viewport.  
**Lezione:** Usare sempre `elementsFromPoint` o filtri `getBoundingClientRect().top < 90` per identificare elementi effettivamente visibili, non tutti gli elementi con un certo tag/classe.

---

## 12. Plugin Figma — font sballati
**Problema:** Il plugin usava nomi di stile fissi (`'Neue Haas Grotesk Display Pro' / '55 Roman'`). Se il font ha nomi di stile diversi in Figma, l'API sostituisce con un fallback sbagliato senza errore.  
**Fix:** `figma.listAvailableFontsAsync()` per ottenere i font realmente disponibili, poi selezione dello stile con matching progressivo (exact → includes → fallback).  
**Lezione:** Non usare mai nomi di stile font fissi nel Figma Plugin API. Usare sempre `listAvailableFontsAsync` e matching flessibile.

---

## 14. Margini che "non cambiano" — elemento sbagliato
**Problema:** Volevo aumentare lo spazio tra la label "Prodotti che usi ogni giorno" e i loghi del marquee. Ho aggiunto `margin-top` sulla label e `margin-top` su `.prj-clients` — niente cambiava. Ho perso diversi giri a insistere sugli stessi elementi, dicendo all'utente di fare hard refresh mentre il problema era di diagnosi.  
**Causa reale:** Il margine tra label e loghi andava messo come `margin-bottom` sulla label (l'elemento che sta *sopra*), non come `margin-top` sul contenitore dei loghi (che già aveva padding/margin che non si sommavano come previsto). Inoltre la mask CSS (`-webkit-mask-image`) sul `.prj-clients` comprimeva visivamente lo spazio.  
**Fix:** `margin-bottom: 40px` direttamente sulla `.prj-clients-lbl`.  
**Lezione:** Prima di cambiare un valore CSS, misurare il gap reale con `getBoundingClientRect()` su entrambi gli elementi e identificare *quale* elemento genera il gap. Non indovinare. Non ripetere la stessa modifica 3 volte senza verifica.

---

## 15. Netlify deploy — solo index.html, senza cartella img/
**Problema:** Trascinando solo `index.html` su Netlify, la cartella `img/` non veniva caricata → tutte le foto 404.  
**Fix:** Trascinare sempre l'**intera cartella** `humans-careerpage/` (non il file singolo).  
**Lezione:** Netlify accetta sia cartelle che file singoli. Con file singolo, le risorse relative (img/, js/, css/) non vengono incluse.
