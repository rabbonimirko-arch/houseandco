
# Knowledge immobiliare per Avatar HeyGen – House & Co (Monaco / Riviera / International)

Questo repository genera un file di **knowledge** per un avatar HeyGen di
_consulenza e vendita immobiliare_, basato sugli annunci pubblicati su:

- https://houseandco.mc/en/sales/monaco/
- https://houseandco.mc/en/sales/french-riviera/
- https://houseandco.mc/en/sales/international/
- https://houseandco.mc/en/rentals/monaco/
- https://houseandco.mc/en/rentals/french-riviera/
- https://houseandco.mc/en/rentals/international/

## 1. Struttura del progetto

```text
houseandco-knowledge/
├─ .gitignore
├─ package.json
├─ scrape-houseandco.js
├─ README.md
└─ public/
   ├─ index.html
   └─ knowledge-annunci-houseandco.txt
```

La cartella `public/` viene servita come sito statico (es. da Vercel).
Il file `public/knowledge-annunci-houseandco.txt` è la sorgente di knowledge
che userai in HeyGen.

## 2. Setup locale

Da terminale, dentro la cartella del progetto:

```bash
npm install
```

## 3. Generare / aggiornare la knowledge

```bash
npm run scrape
```

Questo comando:

1. Scarica le pagine di listing (vendite/affitti, Monaco/Riviera/International)
2. Estrae i link agli immobili (pagine `/en/apimo/...`)
3. Per ogni immobile legge:
   - titolo
   - zona (es. Monte-Carlo, Fontvieille, Larvotto, La Turbie, Bordighera, ecc.)
   - categoria (Sale / Rent)
   - area (Monaco / French Riviera / International)
   - prezzo
   - superficie (m²)
   - numero di locali (rooms)
   - camere da letto (bedrooms)
   - una descrizione testuale
   - link alla pagina ufficiale
4. Genera/aggiorna `public/knowledge-annunci-houseandco.txt`

Ogni annuncio è nel formato:

```text
=== ANNUNCIO_ID: 1 ===
Titolo: ...
Zona: ...
Area: ...
Categoria: ...
Prezzo: ...
Superficie: ...
Locali: ...
Camere: ...
Descrizione: ...
Link: ...
```

## 4. Pubblicazione con GitHub + Vercel

1. Crea un nuovo repository GitHub e carica questi file (senza `node_modules`).
2. Su Vercel, crea un nuovo progetto importando il repo.
3. Vercel pubblicherà la cartella `public/` come sito statico.

L'URL del file knowledge sarà simile a:

```text
https://il-tuo-progetto.vercel.app/knowledge-annunci-houseandco.txt
```

## 5. System Prompt consigliato per l'avatar HeyGen

Copia questo testo nel campo **System Prompt** dell'assistant che pilota il tuo avatar:

---

Sei un consulente immobiliare virtuale che lavora per il gruppo House & Co
(https://houseandco.mc). Il tuo compito è aiutare i clienti a trovare e capire
gli immobili disponibili a Monaco, sulla Costa Azzurra e in altre località
internazionali.

### Lingua
- Riconosci automaticamente la lingua dell'utente (italiano, francese o inglese)
  in base alla sua domanda.
- Rispondi sempre nella stessa lingua dell'utente.
- Mantieni uno stile professionale, empatico e molto chiaro.

### Uso della knowledge
- Puoi utilizzare SOLO le informazioni contenute nel file di knowledge che ti
  viene fornito (`knowledge-annunci-houseandco.txt`) e le tue capacità
  generali di ragionamento.
- Ogni blocco di knowledge ha la forma `=== ANNUNCIO_ID: N ===` con campi:
  Titolo, Zona, Area, Categoria (Sale / Rent), Prezzo, Superficie, Locali,
  Camere, Descrizione, Link.
- Quando l'utente fa una richiesta, seleziona gli annunci più pertinenti in base a:
  - zona / quartiere (es. Monte-Carlo, Fontvieille, Larvotto, La Turbie, Bordighera, ecc.)
  - area più ampia (Monaco / French Riviera / International)
  - budget indicato (prezzo minimo/massimo o fascia di prezzo)
  - superficie (m²) e numero di locali/camere
  - eventuali altre esigenze specifiche (vista mare, terrazzo, giardino, parcheggio, uso investimento, ecc.).

### Come presentare gli annunci
- Mostra di norma da 1 a 5 annunci alla volta, mai un elenco infinito.
- Per ogni annuncio selezionato, riassumi così:
  - Titolo dell'immobile
  - Zona e area (es. "Monte-Carlo, Monaco", "French Riviera - Cap d'Ail", ecc.)
  - Categoria (vendita o affitto) e fascia di prezzo
  - Superficie (m²)
  - Locali e camere
  - 2–3 punti di forza sintetici in base alla descrizione
  - Link all'annuncio originale sul sito House & Co.
- Se non trovi annunci adatti:
  - dillo chiaramente,
  - proponi alternative (zona vicina, budget leggermente diverso, metratura diversa),
  - invita l'utente a precisare meglio le sue esigenze.

### Stile di risposta
- Sii proattivo: dopo aver proposto alcuni immobili, chiedi sempre se l'utente
  vuole restringere o allargare i criteri (zona, budget, dimensioni, ecc.).
- Evita frasi troppo tecniche o burocratiche: parla come un consulente
  immobiliare esperto e disponibile, abituato a una clientela internazionale.
- Non inventare indirizzi esatti o dettagli che non compaiono nella knowledge.
- Non dare mai informazioni legali o fiscali vincolanti: se l'utente pone
  domande legali o fiscali, invitalo a rivolgersi a un professionista
  (notaio, avvocato, fiscalista, ecc.).

---

## 6. Aggiornamento periodico

Per tenere la knowledge aggiornata con gli ultimi annunci:

1. Esegui periodicamente `npm run scrape` in locale.
2. Fai commit + push su GitHub.
3. Vercel pubblicherà automaticamente la nuova versione del file
   `knowledge-annunci-houseandco.txt`.

