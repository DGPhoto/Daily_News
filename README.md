# Daily_News
News Selection

Un briefing personale in italiano: selezione e contesto, con uno sguardo europeo.
Sito statico in HTML, CSS e JavaScript, senza framework, dipendenze di produzione,
build o tracciamento. Profilo completo: [config/news_profile.md](config/news_profile.md).

## Struttura

```text
index.html                   Briefing e archivio
css/style.css                Responsive, tema chiaro/scuro e stampa
js/app.js                    Lettura e visualizzazione
js/data.js                   Contratto dati e validazione
data/latest.json             Edizione corrente, inizialmente vuota
data/example.json            Anteprima dimostrativa, non notizie
data/archive/index.json      Elenco delle date pubblicate
data/archive/YYYY-MM-DD.json Copia di ciascuna edizione
config/news_profile.md       Criteri editoriali
scripts/validate.mjs         Controllo opzionale con Node.js
tests/data.test.mjs          Test senza librerie esterne
news/.gitkeep                Cartella preesistente conservata per note
.nojekyll                    File statici per GitHub Pages
```

Le edizioni del sito usano JSON; `news/` rimane disponibile per note Markdown.
Non sono state cancellate edizioni preesistenti.

## Anteprima locale

Avvia un server statico dalla cartella del repository, per esempio con Python:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Apri `http://127.0.0.1:8000/`. Non aprire l'HTML tramite `file://`: il browser
deve recuperare i JSON via HTTP. Non serve installare pacchetti Node.

- `/`: legge sempre `data/latest.json`.
- `/?preview=1`: testi dimostrativi e immagini d'archivio, esplicitamente indicati;
  non è un'edizione reale e non compare nell'archivio.
- `/?view=archive`: elenco delle edizioni dalla più recente.
- `/?date=YYYY-MM-DD`: edizione storica. Funziona anche sotto `/Daily_News/`.

Il primo avvio mostra «Nessuna edizione pubblicata»: nessuna notizia inventata
e nessuna data di esempio presentata come aggiornamento reale.

## Dati

Campi principali: `status`, `date`, `updated`, `summary`, `top_stories`,
`sections`, `watchlist`. `title` è facoltativo.

- `status`: `published` per edizioni vere; `draft` per lo stato iniziale vuoto;
  `demo` solo per l'anteprima.
- `date`: `YYYY-MM-DD`; `null` solo per draft/demo.
- `updated`: ISO 8601 con secondi e fuso, es. `2026-09-20T08:00:00+02:00`.
  Copenhagen usa +02:00 in estate e +01:00 in inverno, secondo la data.
  Il sito formatta con `Europe/Copenhagen`, senza fissare CET tutto l'anno.
- `top_stories`: notizie principali; 5–8 è un obiettivo, non un minimo.
- `sections`: liste nell'ordine `italia`, `europa`, `danimarca`, `geopolitica`,
  `ai`, `psicologia`, `antropologia`, `clima_spazio`, `motogp`,
  `fotografia_cultura`. Sezioni omesse o vuote non sono mostrate.
- `watchlist`: temi documentati; 3–5 quando disponibili, senza quote obbligatorie.

Ogni notizia richiede `title`, `category`, `summary`, `why_it_matters`, `source`,
`url` e, nelle edizioni pubblicate, `published` (data o timestamp con fuso).
Non inventare un'ora se la fonte fornisce solo la data.
La watchlist richiede `title`, `summary`, `source`, `url`, `published`.

Campi opzionali (esempio di formato, non una notizia da pubblicare):

```json
{
  "additional_sources": [{"name": "Seconda fonte", "url": "https://example.org/articolo"}],
  "statements": "Dichiarazioni attribuite a chi le ha pronunciate.",
  "analysis": "Analisi distinta dai fatti.",
  "limitations": "Limiti, campione, forza dell'effetto, risultati preliminari.",
  "image": {
    "url": "https://example.org/fotografia.jpg",
    "alt": "Descrizione del contenuto visivo",
    "caption": "Contesto, data, eventuale archivio e modifiche",
    "credit": "Autore / fonte",
    "source_url": "https://example.org/pagina-originale",
    "license": "Licenza o autorizzazione verificata",
    "license_url": "https://example.org/condizioni-di-riuso",
    "width": 1200,
    "height": 800
  }
}
```

Testi trattati come testo semplice: HTML nei dati non viene eseguito.
Le fonti accettano URL HTTP(S). Per foto locali usare `assets/nome.jpg`.
Il validatore segnala URL principali duplicati nella stessa edizione.

## Aggiungere un briefing

1. Leggere il profilo, selezionare e verificare le fonti, confrontare l'archivio
   per evitare ripetizioni senza sviluppi sostanziali.
2. Creare `data/archive/YYYY-MM-DD.json` con `status: "published"`, date effettive,
   sommario e notizie. Non pubblicare i testi dimostrativi come notizie.
3. Copiare lo stesso documento in `data/latest.json` se è il più recente.
4. Aggiungere la data a `data/archive/index.json`, per esempio
   `{"dates": ["2026-09-20"]}`. Includere tutte e solo le edizioni vere.
5. Per correzioni dell'edizione corrente aggiornare sia archivio sia latest,
   mantenerli identici e aggiornare l'ora. Dichiarare correzioni sostanziali nel
   contenuto. Conservare tutte le edizioni precedenti.
6. Controllare pagina, fonti, immagini e archivio. Con Node.js 22+ è possibile
   eseguire controlli facoltativi senza installare dipendenze:

   ```sh
   node scripts/validate.mjs
   node --test tests/data.test.mjs
   ```

7. Revisionare il diff, poi commit e push secondo il proprio flusso Git.

Il sito non raccoglie notizie automaticamente e non esistono processi ricorrenti.
Gli aggiornamenti richiedono lavoro editoriale e verifica delle fonti.

## Immagini e crediti

Circa 2–4 immagini pertinenti, se i diritti lo consentono. `image` è opzionale.
Conservare alt, credito, pagina fonte, didascalia e licenza/condizioni verificate.
Per NASA/ESA controllare la singola attribuzione, senza presumere riuso universale.
Segnalare ritagli e immagini d'archivio.

Le immagini remote contattano i rispettivi host. Se non caricano, testo e crediti
restano visibili. Si possono salvare copie autorizzate in `assets/`.

Anteprima: Parlamento europeo, jeffowenphotos / Wikimedia Commons, CC BY 2.0;
Cosmic Cliffs, NASA/ESA/CSA/STScI, condizioni NASA per uso editoriale. Fonti e termini
sono in `data/example.json`. Nessuna approvazione degli enti citati è implicata.

## GitHub Pages

Dopo aver approvato e integrato le modifiche in `main`:

1. Nel repository aprire **Settings → Pages**.
2. Scegliere **Build and deployment → Deploy from a branch**.
3. Selezionare `main` e `/(root)`, quindi **Save**.
4. Attendere l'esito della pubblicazione e aprire l'URL mostrato da GitHub.
   Quello previsto senza dominio personalizzato è
   `https://dgphoto.github.io/Daily_News/`; non ne attestiamo qui l'attivazione.

I riferimenti locali sono relativi e supportano il sottopercorso del repository.
Non serve un workflow personalizzato. Disponibilità e visibilità dipendono da
piano e impostazioni del repository; i contenuti diventano accessibili secondo
la configurazione Pages scelta.

[Documentazione ufficiale GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Accessibilità e stati

HTML semantico, tastiera, link al contenuto, alt, tema scuro automatico, una colonna
sui telefoni. Data corrente, data dell'edizione e data delle fonti restano distinte.
Sono previsti caricamento, assenza di edizioni, archivio vuoto ed errore di rete/dati.
Un JSON invalido genera un messaggio leggibile.
