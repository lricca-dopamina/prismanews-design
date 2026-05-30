# PrismaNews · Design Bridge
> Documento di allineamento tra il prototipo mobile (prismanews-new.html) e il Design System attuale (Figma).
> Uso: aggiorna il DS attuale usando i valori di questa guida come riferimento.

---

## 1. TOKEN COLORE

Le palette sono quasi identiche. Il DS attuale usa nomi semantici diversi dal prototipo, ma i valori hex coincidono.

| Token DS attuale | Hex DS | Token Prototipo | Hex Prototipo | Delta | Azione |
|---|---|---|---|---|---|
| `--ink` | `#F4EDDC` | `--bg` | `#F5F0E2` | ~1% | ✅ Allineati — aggiorna DS a `#F5F0E2` |
| `--ink-2` | `#EDE4D0` | `--bg2` | `#EBE4D2` | ~1% | ✅ Allineati — aggiorna DS a `#EBE4D2` |
| `--ink-3` | `#E8DEC8` | — | — | — | ℹ️ Non usato nel prototipo |
| `--cream` | `#1B1714` | `--text` | `#232323` | 5% | ⚠️ Leggera differenza — usa `#1B1714` (DS) |
| `--cream-dim` | `#3D362E` | — | — | — | ℹ️ Non usato nel prototipo |
| `--muted` | `#7B7263` | `--text2` | `#797264` | ~1% | ✅ Allineati |
| `--muted-2` | `#9D9482` | `--text3` | `#AEA68C` | 3% | ✅ Abbastanza allineati |
| `--border` | `#D2C7A8` | `--border` | `#D0C7AA` | ~1% | ✅ Allineati |
| `--border-2` | `#A89A7C` | — | — | — | ℹ️ Non usato nel prototipo |
| `--accent` | `#B82027` | `--red` | `#B9091B` | ~1% | ✅ Allineati |
| `--silver` | `#8E8E92` | — | — | — | ℹ️ Badge abbonamento |
| `--gold` | `#8A6C1E` | — | — | — | ℹ️ Badge abbonamento |
| `--platinum` | `#7A7770` | — | — | — | ℹ️ Badge abbonamento |
| `--newsroom` | `#B83A3A` | — | — | — | ℹ️ Non usato nel prototipo |

### Dark Mode (prototipo)
| Token | Valore |
|---|---|
| `--bg` | `#0F0F0F` |
| `--bg2` | `#1A1A1A` |
| `--text` | `#F0EAD8` |
| `--text2` | `#8A8070` |
| `--text3` | `#5C5448` |
| `--border` | `#2A2520` |
| `--red` | `#C41E2A` |

---

## 2. TIPOGRAFIA

### DS attuale usa:
| Ruolo | Font | Peso | Dimensione |
|---|---|---|---|
| Brand/Titoli | Fraunces | Regular / Italic | 22px (header), 26px (card) |
| UI / Label | JetBrains Mono | Medium | 9.5px–11px |
| Letter-spacing label | — | — | `2.66px` (categorie), `2.42px` (primario) |

### Prototipo usa:
| Ruolo | Font | Peso | Dimensione |
|---|---|---|---|
| Titoli articolo | Libre Baskerville | 700 | 20px (scalabile) |
| Corpo testo | Libre Baskerville | 400 | 14–15px |
| UI / Label | IBM Plex Mono | 500–600 | 9–15px |
| Letter-spacing label | — | — | `0.06–0.1em` |

### ⚠️ Differenza chiave:
Il DS usa **Fraunces** (con variazioni `SOFT/WONK`) per i titoli. Il prototipo usa **Libre Baskerville**. Entrambi sono serif con carattere editoriale. Scelta da fare: allineare su Fraunces (più distintivo) o mantenere Libre Baskerville.

---

## 3. COMPONENTI — CONFRONTO

### Header / TopBar
| Proprietà | DS attuale | Prototipo |
|---|---|---|
| Altezza | 56px | 58px |
| Background | `--ink` | `--bg` |
| Border bottom | `1px --border` | `1px --border` |
| Padding laterale | 32px (desktop) | 14px (mobile) |
| Font logo | Fraunces Regular+Italic 22px | IBM Plex Mono Bold |
| Tagline | "Intelligence" in `--accent` | — |
| Controlli | Aa, ☾, Accedi | 🌐, Aa, ☾ |

### Bottom Navigation
| Proprietà | DS attuale | Prototipo |
|---|---|---|
| Altezza | 56px | 64px |
| Icone | 4 tab | 4 tab |
| Font label | JetBrains Mono | IBM Plex Mono |

### Bottoni
| Variante | DS (`.lp-btn-access`) | Prototipo (`.ctrl-btn`) |
|---|---|---|
| Border | `1px --cream-dim` | `1px --border` |
| Padding | `8px 16px` | `height:28px` |
| Font | JetBrains Mono 11px | IBM Plex Mono 11px |
| Radius | 0 (nessuno) | 6px |

### Category Pills / Chip
| Proprietà | DS (`Chip`) | Prototipo (`.cat-pill`) |
|---|---|---|
| Altezza | 26px | 30px |
| Radius | — | 15px (pill) |
| Active bg | `--cream` | `--red` |
| Active text | `--ink` | `#fff` |
| Font | JetBrains Mono | IBM Plex Mono |

> ⚠️ **Differenza importante**: il DS usa lo stile active con sfondo scuro (`--cream`), il prototipo usa rosso (`--red`). Il prototipo è più aggressivo visivamente.

### Article Card
| Proprietà | DS (`ArticleCard`) | Prototipo (`.art-item`) |
|---|---|---|
| Categoria | `--accent` uppercase 11px | `--red` uppercase |
| Titolo | Fraunces 26px line-height 1.12 | Libre Baskerville 17px |
| Meta (testate/lingue) | JetBrains Mono 10.5px `--muted` | IBM Plex Mono `--text3` |
| Separatore | `border-bottom --border` | `border-bottom --border` ✅ |
| Padding | `40px 32px` (desktop) | `12px 0` (mobile) |

---

## 4. NUOVI COMPONENTI (solo nel prototipo — da aggiungere al DS)

### 4.1 Barra Divergenza
Barra orizzontale segmentata in 3 colori che mostra la distribuzione editoriale di un articolo.

| Proprietà | Valore |
|---|---|
| Altezza | 6px |
| Radius | 3px |
| Segmento 1 (sinistra) | `#AEA68C` (neutro) |
| Segmento 2 (centro) | `#C8A84B` (giallo, mainstream) |
| Segmento 3 (destra) | `#4A90A4` (blu, alternativo) |
| Indicatore posizione | triangolino nero sotto `▲` |

### 4.2 Radar Pentagono
Canvas SVG/Canvas con 5 assi: TONO · TEMPERATURA · ORIZZONTE · POSIZIONAMENTO · FOCUS.

| Proprietà | Valore |
|---|---|
| Dimensione canvas | 220×220px |
| Colore griglia | `--border` opacity 0.4 |
| Colore area | `--red` opacity 0.15 |
| Colore bordo area | `--red` |
| Font assi | IBM Plex Mono 9px uppercase |

### 4.3 Ticker Breaking News
Barra orizzontale con scroll automatico delle breaking news.

| Proprietà | Valore |
|---|---|
| Altezza | ~34px |
| Background | `--bg` |
| Border bottom | `1px --border` |
| Icona | freccia trend su SVG in `--red` |
| Font | IBM Plex Mono 10px uppercase |
| Separatori | `|` in `--text3` |
| Visibilità | Solo schermata Home |

### 4.4 Meta Bar Articolo
Barra sotto l'immagine con testate · lingue · min lettura · data aggiornamento.

| Proprietà | Valore |
|---|---|
| Altezza | ~30px |
| Padding | `8px 14px` |
| Font | IBM Plex Mono 11px uppercase |
| Colore testo | `--text3` |
| Separatori | `|` in `--border` |
| Scroll | orizzontale, no scrollbar |

### 4.5 Footer
Footer con sezione superiore (logo + watermark + social) e sezione inferiore (copyright + link).

| Proprietà | Valore |
|---|---|
| Background | `--bg2` |
| Border top | `1px --border` |
| Watermark | logo triangolo compound a opacità 0.25 |
| Social buttons | LinkedIn (rect 7px radius), Facebook/Instagram (circle) 36×36px bg `--text3` |
| Font copyright | Libre Baskerville 13px |
| Link | `--red` underline |

---

## 5. SPAZIATURE E LAYOUT MOBILE

| Token | Valore |
|---|---|
| Max width app | 430px |
| Padding laterale | 14px |
| Header height | 58px |
| Category bar height | 47px |
| Nav bar height | 64px |
| Border radius bottoni | 6px |
| Border radius card img | 8px |

---

## 6. ROADMAP AGGIORNAMENTO DS

### Priorità Alta
- [ ] Aggiornare i valori hex dei token colore (differenze ~1%)
- [ ] Aggiungere varianti mobile a TopBar e BottomBar (padding 14px, dimensioni ridotte)
- [ ] Aggiornare ArticleCard per il mobile (padding e font size)
- [ ] Aggiornare Chip/pill: aggiungere variante active rossa

### Priorità Media
- [ ] Aggiungere componente **Barra Divergenza** con 3 varianti colore
- [ ] Aggiungere componente **Ticker** con stati show/hide
- [ ] Aggiungere componente **Meta Bar Articolo**
- [ ] Aggiungere componente **Footer** completo

### Priorità Bassa
- [ ] Aggiungere componente **Radar Pentagono** (annotazione: generato via Canvas JS)
- [ ] Decidere su Fraunces vs Libre Baskerville per i titoli
- [ ] Aggiungere token dark mode al DS

---

*Generato da Claude Code il 30/05/2026 — fonte: prismanews-new.html + PRISMANEWS-DESIGN-SYSTEM BACKUP (Figma)*
