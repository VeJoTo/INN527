# Trykk pause – prototype

En nettside som hjelper unge å se nærmere på innhold de møter på sosiale medier,
gjennom guidede spørsmål. Laget for brukertesting i et living lab-prosjekt.

Ren HTML, CSS og JavaScript, med Tailwind for utseendet. Ingen backend, ingen cookies,
ingen analyseverktøy. Alt brukeren skriver og svarer ligger bare i nettleserens minne
og forsvinner når siden lukkes eller lastes på nytt.

## Filene

| Fil / mappe            | Hva den gjør                                                         |
|------------------------|----------------------------------------------------------------------|
| `content.js`           | **Alt innhold**: tekster, temaer, spørsmål, videoeksempler, lenker   |
| `index.html`           | Sidens skjelett: start, beskriv, analyse, spørsmål, oppsummering     |
| `app.js`               | Logikken: hvilken skjerm som vises, svarene, oppsummeringen           |
| `tailwind.css`         | Farger, skrift og noen felles knappestiler (kildefil for utseendet)   |
| `style.css`            | **Lages automatisk** fra `tailwind.css`. Ikke rediger denne direkte   |
| `bygg-css.sh`          | Bygger `style.css` (se «Endre utseendet»)                             |
| `sw.js`                | Gjør at siden virker uten nett etter første besøk                     |
| `manifest.webmanifest` | Navn, farger og ikon når siden legges til på hjemskjermen             |
| `fonter/`              | Skrifttypen Archivo (fri lisens, se `LISENS-OFL.txt`)                 |
| `ikoner/`              | Appikonet                                                             |

## Prøv siden lokalt

Dobbeltklikk på `index.html`, så åpnes den i nettleseren. Etter at du har endret en fil:
lagre, og last siden på nytt.

Hjemskjerm og offline virker bare når siden ligger på en nettadresse. For å teste det
lokalt, kjør dette i Terminal i prosjektmappen og åpne <http://localhost:8000>:

```sh
python3 -m http.server 8000
```

## Endre innholdet

All tekst ligger i `content.js`. Du trenger ikke røre de andre filene, og du trenger
ikke bygge noe på nytt etter tekstendringer.

### Endre en tekst

Finn teksten og endre det som står mellom anførselstegnene:

```js
tittel: "Trykk pause.",
```

Bruk «sitattegn» inne i teksten, ikke vanlige `"`. Et vanlig `"` avslutter teksten for tidlig
og gjør at siden slutter å virke.

### Endre, legge til eller fjerne et spørsmål

Hvert spørsmål ser slik ut:

```js
{
  id: "avsender-tjener",
  sporsmal: "Tjener avsenderen penger eller følgere på dette?",
  signalVed: "ja",
  hvorfor: "Mange lever av oppmerksomhet. ...",
  teknikk: "Oppmerksomhet som forretning",
  forklaring: "Innhold som provoserer, får ofte flest klikk. ..."
},
```

- `id`: et unikt navn. Små bokstaver, ingen mellomrom, ikke likt et annet spørsmål.
- `sporsmal`: selve spørsmålet. Det må kunne besvares med Ja / Nei / Vet ikke.
- `signalVed`: hvilket svar som regnes som et varselsignal, `"ja"` eller `"nei"`.
- `hvorfor`: teksten som vises når man åpner «Hvorfor spør vi om dette?».
- `teknikk` og `forklaring`: vises i oppsummeringen hvis brukeren markerte et varselsignal.

**Legge til:** kopier et helt spørsmål (fra `{` til og med `},`), lim det inn i riktig tema,
og endre feltene. Husk ny `id`.

**Fjerne:** slett hele spørsmålet fra `{` til og med `},`. Fjern også eventuelle
observasjoner med samme `id` under `video` (ellers blir de bare ikke vist).

Antall spørsmål, fremdriftslinja og «Spørsmål 3 av 12» oppdateres automatisk.

### Endre temaer

Temaene ligger i `temaer: [ ... ]`. Hvert tema har et `navn`, en `farge` og en liste
`sporsmal`. Rekkefølgen i fila er rekkefølgen brukeren ser dem i. Fargen brukes i
fremdriftslinja, analysen og oppsummeringen. Velg en lys farge, siden bakgrunnen er mørk.

### Den simulerte videoanalysen

Verktøyet analyserer **ikke** videoer på ekte. Alt ligger under `video` i `content.js`:

- `eksempler`: videoene brukeren kan velge. Hver har `tittel`, `beskrivelse` og
  `observasjoner`.
- `standardAnalyse`: vises når brukeren limer inn en egen lenke. Lenken åpnes ikke og
  sendes ingen steder.
- `observasjoner`: nøkkelen er `id`-en til spørsmålet observasjonen hører til, for eksempel
  `"avsender-tjener": "Videoen slutter med rabattkode på et nettkurs."`. Observasjonen
  vises i analysen og som hint over det spørsmålet.
- `visDemoMerke`: `true` viser «Demo»-merket og forklaringen om at analysen er simulert.
  Sett til `false` bare hvis testopplegget krever det, og husk å informere deltakerne
  etterpå.
- `ventetidMs`: hvor lenge «Analyserer videoen …» vises (2000 = 2 sekunder).

### Hvordan oppsummeringen virker

- **Mulige varselsignaler**: spørsmål der brukeren svarte det som står i `signalVed`,
  gruppert per tema.
- **Ting du kan sjekke nærmere**: spørsmål der brukeren svarte «Vet ikke».
- Det finnes ingen poengsum.

### Lenker til videre lesing

Nederst i `content.js`, under `lenker`. Bytt ut `"#"` med en ekte adresse:

```js
{ tekst: "Om kildekritikk", url: "https://eksempel.no/kildekritikk" },
```

### Hvis siden blir tom etter en endring

Da er det nesten alltid en skrivefeil i `content.js`: et manglende komma, et vanlig `"`
inne i en tekst, eller en manglende `}`. Åpne nettleserens konsoll (F12 → «Console»),
så står det hvilken linje feilen er på.

## Endre utseendet (Tailwind)

Utseendet er laget med [Tailwind](https://tailwindcss.com): klasser som `text-3xl` og
`bg-flate` står direkte i `index.html` og `app.js`. Farger, skrift og felles knappestiler
ligger i `tailwind.css`.

Nettleseren leser `style.css`, som lages fra disse filene. **Etter at du har endret
klasser eller `tailwind.css`, må du bygge på nytt**. Kjør i Terminal i prosjektmappen:

```sh
./bygg-css.sh            # bygg én gang
./bygg-css.sh --watch    # bygg automatisk hver gang du lagrer (stopp med Ctrl+C)
```

Første gang laster skriptet ned Tailwinds frittstående program (ca. 80 MB) til mappen
`.verktoy/`. Det trengs ikke Node eller npm. Husk å ta med den nye `style.css` når du
publiserer.

Skriptet virker på Mac og Linux. På Windows: last ned `tailwindcss-windows-x64.exe` fra
[Tailwinds utgivelser](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3) og kjør
`tailwindcss-windows-x64.exe --input tailwind.css --output style.css --minify`.

Fargene heter `natt` (bakgrunn), `flate` (bokser), `signal` (gul), `tekst` og `dempet`.
Endre dem i `@theme`-blokken i `tailwind.css`.

## Publisere

### GitHub Pages

1. Lag et nytt repository på github.com (det kan være offentlig).
2. Last opp alle filene og mappene, **unntatt** `.verktoy/` (den er stor og trengs ikke).
   Med git skjer dette automatisk, fordi `.verktoy/` står i `.gitignore`.
3. Gå til **Settings → Pages**. Under «Build and deployment» velger du
   **Deploy from a branch**, branch `main` og mappe `/ (root)`. Trykk **Save**.
4. Etter et par minutter ligger siden på `https://<brukernavn>.github.io/<repo-navn>/`.

Når du senere endrer en fil på GitHub, oppdateres siden automatisk etter et minutt eller to.

### Netlify

Enklest: koble Netlify til GitHub-repoet (**Add new site → Import an existing project**).
Da publiseres hver endring automatisk.

Alternativt kan du dra prosjektmappen inn på app.netlify.com under **Sites**.
Slett i så fall mappen `.verktoy/` først (den lastes ned på nytt neste gang du bygger CSS).

### QR-kode til testene

Når siden er publisert, kan du lage en QR-kode av adressen, så testdeltakerne slipper å
skrive den. Bruk en QR-generator du stoler på, eller be Claude lage en `qr.png` lokalt.

### Etter publisering: legg til på hjemskjermen

- **iPhone (Safari):** Del-knappen → «Legg til på Hjem-skjerm».
- **Android (Chrome):** menyen ⋮ → «Legg til på startskjermen» / «Installer app».

Etter første besøk virker siden uten nett. Når telefonen er på nett, hentes alltid nyeste
versjon, så endringer mellom testrundene vises med en gang. Legger du til nye filer som
siden trenger, før dem også opp i lista `FILER` øverst i `sw.js`.

## Tilgjengelighet

Det er gjort:

- Semantisk HTML: ekte knapper, skjemaetiketter, overskrifter, `<details>` for «Hvorfor spør vi om dette?».
- Fokus flyttes til overskriften når skjermen bytter, så skjermlesere leser den nye skjermen.
- Synlig fokusring (gul) på alt som kan velges med tastatur.
- Kontrast etter WCAG AA. Store trykkflater (minst 48 px).
- Følger telefonens tekststørrelse. Ingen vannrett scrolling ned til 320 px bredde
  (tilsvarer 400 % zoom).
- Animasjonen på «Analyserer …» står stille hvis brukeren har slått av animasjoner.
- Lighthouse tilgjengelighet: 100.

**Sjekkliste før hver testrunde, med ekte skjermleser** (automatiske tester fanger ikke alt):

- [ ] **iPhone + VoiceOver** (Innstillinger → Tilgjengelighet → VoiceOver): gå gjennom hele
      flyten med sveip. Blir hvert nytt spørsmål lest opp, med tema og nummer?
- [ ] **Android + TalkBack**: samme runde.
- [ ] Blir valgt svar lest som «valgt/trykket» når du går tilbake?
- [ ] Er «Demo»-merket og hintet forståelig når det leses opp?
- [ ] **Tastatur på PC**: kun Tab, Shift+Tab, Enter og mellomrom – kommer du gjennom alt?
- [ ] **Stor tekst**: sett telefonens tekststørrelse til størst. Er alt lesbart?

## Personvern

- Siden laster ingen filer fra andre nettsteder (skrift og ikoner ligger i prosjektet).
- Ingen cookies, ingen innlogging, ingen analyseverktøy, ingen cookie-banner (trengs ikke).
- Ingenting sendes til en server. Tekst og lenke brukeren skriver finnes bare i minnet.
- Service workeren lagrer bare sidens egne filer (for offline-bruk), aldri svar eller tekst.

Merk: Selve vertstjenesten (GitHub/Netlify) logger tekniske data som IP-adresse når
noen besøker siden, slik alle nettsider gjør. Dette gjelder ikke det brukeren skriver eller svarer.
