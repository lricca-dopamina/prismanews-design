# Plugin Figma — "Lavora con noi" (Dopamina × Humans.tech)

Genera la pagina career su Figma, **organizzata in sezioni, frame e componenti** nominati.

## Come si usa

1. Apri **Figma Desktop** (serve l'app desktop per i plugin di sviluppo).
2. Crea o apri un file di design (`/design/`).
3. Menu **Figma → Plugins → Development → Import plugin from manifest…**
4. Seleziona il file **`manifest.json`** in questa cartella.
5. Lancia: **Plugins → Development → Humans.tech — Lavora con noi (Dopamina)**.

Il plugin crea sul canvas:
- **`📄 Lavora con noi · Humans.tech`** — la pagina completa, in auto-layout verticale, con una sezione-frame per ogni blocco:
  `01 · Hero`, `Award strip`, `02 · Manifesto`, `03 · Progetti`, `04 · Entra in campo`,
  `05 · Crescere`, `06 · La sede`, `07 · Best Workplace`, `08 · Processo + Benefit`,
  `09 · Candidatura`, `Team photo`, `10 · Posizioni`, `Footer`.
- **`🧩 Components`** — i componenti riutilizzabili (master):
  `Button/Primary`, `Button/White`, `Button/Icon`, `Chip`, `Stat`,
  `Card/Project`, `Card/Person`, `Card/Process`, `Card/Benefit`, `Row/Job`, `AwardStat`.
  Tutte le istanze nella pagina puntano a questi master → modifichi il master, si aggiorna ovunque.

## Note

- **Font**: prova a usare *Neue Haas Grotesk Display Pro* (il font reale del brand). Se non è
  installato nel tuo Figma, ripiega automaticamente su **Inter** + mono. Per la resa 1:1 installa
  Neue Haas e DM Mono e rilancia il plugin.
- **Immagini**: foto, badge GPTW e sfondo sede vengono scaricati da `humans.tech` / Unsplash via
  `createImageAsync`. Se la rete li blocca, restano gradienti/placeholder (nessun errore).
- **Gradienti / colori**: usati i token reali del design system (`#4437F3`, `#050620`, `#1E1E2D`,
  `#DCD9FF`, `#FF6B00`, `#EFEFEF`…).
- È un **primo passaggio strutturale**: alcune rifiniture (foto sovrapposte dell'hero, parallax,
  ombre custom) vanno regolate a mano in Figma — il plugin posa scheletro, gerarchia e componenti.
