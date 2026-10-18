# Manipulasjonsradar – designspesifikasjon

Dato: 2026-10-18
Status: Til gjennomsyn
Grunnlag: Prototypeforslaget «Manipulasjonsradar» (13.10.2026)

## 1. Formål

Manipulasjonsradar er en **probe** for living lab-prosjektet i INN527. Den viser
hvilke manipulasjonsteknikker et innlegg bruker, ikke hvilken ideologi kilden har.
Målet er å lære hvordan mannlige VG3-elever i Bergen reagerer, ikke å bevise at
verktøyet virker.

Prototypen skal hjelpe gruppa å få svar på:

- Kjenner elevene igjen feedreisen fra egen bruk?
- Stoler de på merkingen, eller oppleves den som moralisering?
- Hvilke teknikker er lettest og vanskeligst å gjenkjenne?
- Hva skulle til for at de brukte noe slikt: alene, med venner eller i timen?

**Suksess** betyr at prototypen fungerer stabilt på elevenes egne mobiler og på
en felles skjerm, at gruppa kan endre innhold og teknikker uten hjelp, og at den
gir et godt utgangspunkt for samtalen etter testen. Det er ikke et mål at elevene
«scorer høyt».

## 2. Avgrensning

Med:

- Klikkbar nettside som ligner en TikTok/Reels-feed, med 12 fiktive innlegg
- Radar med «gjett først, så avsløring» per innlegg
- Feedreise-oppsummering til slutt
- To moduser: **Alene** (mobil) og **Sammen** (felles skjerm, fasilitator)
- Offline-støtte og «legg til på hjemskjerm»

Ikke med:

- Innsamling, lagring eller sending av elevenes svar (verken anonymt eller ikke)
- Ekte kontoer, influensere, skjermbilder, søkeord eller navngitte grupper
- Bilder, video eller AI-genererte illustrasjoner
- Pålogging, backend, analyseverktøy

## 3. Teknisk tilnærming

Samme oppsett som «Trykk pause» (`INN527/`), men i egen mappe
`INN527/manipulasjonsradar/` og med eget utseende:

- Ren HTML, CSS og JavaScript uten rammeverk
- Tailwind v4, bygget med eksisterende `INN527/.verktoy/tailwindcss-v4.3.3`
- All tekst og alt innhold i `content.js`
- Service worker for offline

Alternativer som ble vurdert og forkastet: én enkelt HTML-fil (vanskelig å
redigere trygt) og React/Vite (unødvendig byggesteg og Node-krav for gruppa).

## 4. Brukerflyt

### 4.1 Start

- Kort ramme: «Dette handler om hvordan feeder og algoritmer virker – ikke om deg.»
- Tydelig: alt innhold er fiktivt, ingenting lagres.
- Valg av modus: **Alene** eller **Sammen**.
- Kort forklaring av de seks teknikkene (kan hoppes over).

### 4.2 Feeden

- Loddrett feed, ett kort om gangen, fullskjerm på mobil (scroll-snap).
- Hvert kort viser fiktivt brukernavn, tekst på skjermen (stor), bildetekst,
  hashtags, likes, kommentarantall og 1–3 utvalgte kommentarer.
- Knapp på hvert kort: **«Skann med radaren»**.
- Eleven kan bla videre uten å skanne. Det registreres som «ikke skannet».
- En diskret fremdriftsindikator (f.eks. 4/12).
- Etter siste innlegg: knapp til feedreisen.

### 4.3 Radaren

1. **Gjett:** Panelet viser de seks teknikkene som avkrysningsvalg, pluss
   «Ingen av disse». «Ingen» og teknikker utelukker hverandre.
2. **Vis radaren:** Hver teknikk får én av tre statuser:
   - **Funnet**: i innlegget og gjettet
   - **Oversett**: i innlegget, ikke gjettet
   - **Ikke her**: gjettet, men ikke i innlegget
   Teknikker som verken er i innlegget eller gjettet, vises ikke.
3. Hver teknikk som finnes i innlegget, har én setning om *hvor* i innlegget den
   ligger (fra `content.js`).
4. Hvis innlegget ikke har noen teknikker, og eleven valgte «Ingen», vises en
   positiv bekreftelse. Ved kontrollinnlegget med en legitim politisk mening
   vises en egen forklaring: å ha et standpunkt er ikke manipulasjon.

**Tone:** spillaktig og ikke-dømmende. Ordet «feil» brukes ikke. Oversette
teknikker omtales som «vanskelig å se», ikke som et nederlag. Ingen poengsum
vises per innlegg.

### 4.4 Feedreisen

- **Tidslinje:** alle 12 innlegg som punkter eller søyler etter intensitet (0–3),
  slik at opptrappingen («kaninhullet») blir synlig.
- **Teknikk-kart:** hvor ofte hver teknikk forekom i hver fase (1–4).
- **Dine treff:** per teknikk, «så X av Y» (bare skannede innlegg teller).
  Antall ikke skannede innlegg vises separat.
- **Refleksjon:** 2–3 åpne spørsmål fra `content.js`, f.eks. «Kjenner du igjen
  dette fra feeder folk på din alder ser?»
- Knapper: «Start på nytt» (nullstiller alt) og «Se innleggene igjen».

### 4.5 Sammen-modus

Samme flyt som Alene, med disse forskjellene:

- Større typografi og layout tilpasset liggende skjerm/prosjektor. Kortet vises
  midt på skjermen, og radarpanelet ligger ved siden av i stedet for under.
- Før gjetting vises ett «Snakk om dette»-spørsmål per innlegg (fra `content.js`).
- Fasilitatoren krysser av for det gruppa blir enige om.
- Navigasjon med piltaster og mellomrom i tillegg til klikk.
- Feedreisen viser gruppens felles treff.

## 5. Innhold

### 5.1 Teknikker

Startlisten fra forslaget. Hver teknikk har `id`, `navn`, `kort` (én linje) og
`forklaring` (2–3 setninger), og kan endres i `content.js`.

| id | Navn | Kort forklaring |
|---|---|---|
| `oss-mot-dem` | Oss mot dem | Verden deles i to grupper, der den andre gruppen er en trussel |
| `syndebukk` | Syndebukk | En gruppe får skylden for et sammensatt problem |
| `sterke-folelser` | Sterke følelser | Sinne, frykt eller ydmykelse brukes for å få deg til å reagere før du tenker |
| `skjuler-sannheten` | «De skjuler sannheten» | Innholdet hevder å avsløre noe mediene eller eliten holder skjult |
| `ironi-skjold` | Ironi som skjold | Ekstreme utsagn pakkes inn i humor, så kritikk kan avfeies som «bare tull» |
| `falsk-hast` | Falsk hast | Du må handle eller dele nå, før det er for sent |

### 5.2 Innleggene

Claude skriver første utkast. Gruppa og elevene justerer. 12 innlegg i fire faser:

| # | Fase | Innhold (retning) | Teknikker | Intensitet |
|---|---|---|---|---|
| 1 | Nøytralt | Treningsrutine | – | 0 |
| 2 | Nøytralt | Gaming-klipp | – | 0 |
| 3 | Nøytralt | «Stå opp kl. 6»-motivasjon | – | 0 |
| 4 | Selvforbedring med brodd | «Ingen kommer til å redde deg» | Sterke følelser | 1 |
| 5 | Selvforbedring med brodd | «90 % av gutta gir opp. Er du en av dem?» | Falsk hast, Sterke følelser | 1 |
| 6 | Selvforbedring med brodd | «Sigma»-meme | Ironi som skjold | 1 |
| 7 | Mistillit | «Det skolen aldri lærer deg» | «De skjuler sannheten» | 2 |
| 8 | Kontroll | Matvideo | – | 0 |
| 9 | Mistillit | «De» får skylden for at unge menn sliter | Syndebukk, Sterke følelser | 2 |
| 10 | Kontroll | Legitim politisk mening, saklig formulert | – | 0 |
| 11 | Fiendebilde | «Det er oss eller dem» + «bare tull»-meme | Oss mot dem, Ironi som skjold, Syndebukk | 3 |
| 12 | Fiendebilde | «Del før det blir slettet» | Falsk hast, «De skjuler sannheten», Oss mot dem | 3 |

Regler for innholdet:

- Alle kontoer og innlegg er fiktive. Brukernavn skal ikke ligne ekte kontoer.
- «Dem» holdes vagt («eliten», «de som styrer», «de der»). Ingen ekte grupper,
  partier, personer, steder, søkeord eller kjente slagord navngis.
- Mildt språk: ingen slurs, banning, vold eller trusler.
- Kontrollinnlegget (#10) tar et tydelig standpunkt i en hverdagslig sak
  (f.eks. lokalpolitikk eller skole) uten noen av de seks teknikkene.
- Likes og kommentarantall øker gjennom feeden for å illustrere at engasjement
  gir mer av det samme.
- Rekkefølgen er fast, så opptrappingen blir lik for alle.
- Kontrollinnleggene (#8 og #10) har `fase: 3` (der de står i feeden) og
  `kontroll: true`. I tidslinjen vises de med intensitet 0 og eget merke.

### 5.3 Datamodell i `content.js`

```js
window.CONTENT = {
  tekster: { /* start, modusvalg, radar, feedreise, knapper */ },
  teknikker: [
    { id: "oss-mot-dem", navn: "Oss mot dem", kort: "…", forklaring: "…" }
  ],
  faser: [ { nr: 1, navn: "Nøytralt", kort: "Nøytralt" } /* … */ ], // kort brukes i tabellen i feedreisen
  innlegg: [
    {
      id: "trening",
      fase: 1,
      intensitet: 0,               // 0–3
      kontroll: false,             // true for kontrollinnlegg
      konto: "@…",
      skjermtekst: "…",            // stor tekst på kortet
      bildetekst: "…",
      hashtags: ["…"],
      likes: 1200,
      kommentarer: 48,
      utvalgteKommentarer: ["…"],
      bakgrunn: ["#…", "#…"],      // gradient
      teknikker: [                 // tom liste = ingen teknikker
        { id: "sterke-folelser", hvor: "…" }
      ],
      snakkOm: "…",                // spørsmål i Sammen-modus
      notat: "…"                   // valgfri forklaring, brukes på kontrollinnlegg
    }
  ],
  refleksjon: ["…", "…"]
};
```

## 6. Arkitektur

```
manipulasjonsradar/
├── index.html            Skjelett: start, feed, radarpanel, feedreise
├── content.js            Alt innhold (det eneste gruppa redigerer)
├── radar.js              Ren logikk, ingen DOM
├── app.js                Skjermer, feed, radarpanel, moduser, tastatur
├── tailwind.css          Kildefil for utseendet
├── style.css             Generert – ikke rediger
├── bygg-css.sh           Bygger style.css
├── sw.js                 Offline
├── manifest.webmanifest
├── fonter/               Archivo (kopi, OFL)
├── ikoner/
├── tester/
│   └── radar.test.js     Enhetstester (node --test)
├── docs/specs/           Denne spesifikasjonen
└── README.md             For ikke-tekniske redaktører
```

### 6.1 `radar.js` (ren logikk)

Eksporteres både som `window.Radar` i nettleseren og som modul for Node-tester.

- `valider(content)` → liste over feilmeldinger på norsk (tom = gyldig). Sjekker
  unike id-er, at alle teknikk-id-er i innlegg finnes i `teknikker`, at
  `intensitet` er 0–3, at `fase` finnes, og at påkrevde felt er fylt ut.
- `vurder(innlegg, gjetning)` → `{ funnet: [id], oversett: [id], ikkeHer: [id], ingenRiktig: bool }`.
  `gjetning` er `{ ingen: bool, teknikker: [id] }`.
- `feedreise(content, svar)` → `{ tidslinje, teknikkPerFase, treffPerTeknikk, ikkeSkannet }`.
  `svar` er et kart fra innlegg-id til gjetning, og manglende id betyr ikke skannet.

### 6.2 `app.js`

- Tilstand i én variabel i minnet: `{ modus, aktivtInnlegg, svar }`.
- Ved oppstart kjøres `Radar.valider(CONTENT)`. Ved feil vises en tydelig
  feilside med meldingene i stedet for appen.
- Ingen `localStorage`, `sessionStorage`, cookies eller nettverkskall utover
  lasting av egne filer.

### 6.3 Utseende

- Alltid mørk feed-estetikk (`color-scheme: dark`, ingen lys modus). Én tydelig radarfarge for funn, en dempet farge for
  «oversett» og en nøytral farge for «ikke her». Status skal aldri vises bare
  med farge, men også med ikon og tekst.
- Eget uttrykk som skiller seg fra «Trykk pause».
- Støtte for `prefers-reduced-motion`, synlig fokus og trykkflater på minst 44 px.

## 7. Feilhåndtering

| Situasjon | Oppførsel |
|---|---|
| Ugyldig `content.js` (syntaksfeil) | Statisk melding i `index.html` som vises hvis `CONTENT` mangler: «Innholdsfila har en feil. Se README.» |
| Ugyldige data (f.eks. ukjent teknikk-id) | Feilside med listen fra `valider()` |
| Innlegg ikke skannet | Telles som «ikke skannet» i feedreisen, inngår ikke i treff |
| «Vis radaren» uten noe valgt | Knappen er deaktivert til minst ett valg (eller «Ingen») er gjort |
| Oppdatering/omlasting | Starter på nytt (ønsket, av personvernhensyn) |

## 8. Testing

- **Enhetstester** (`node --test tester/`) for `valider`, `vurder` og
  `feedreise`, inkludert kanttilfeller: tomt gjett, «Ingen» på innlegg med
  teknikker, kontrollinnlegg og ingen skannede innlegg. Testene kjøres også mot
  det ekte `content.js`, så redigeringsfeil fanges opp.
- **Ende-til-ende** i Chrome via DevTools: hele flyten i Alene-modus på 375 px
  bredde og i Sammen-modus på 1280 px, kun tastaturnavigasjon, og ingen konsollfeil eller nettverkskall
  etter lasting.
- **Tilgjengelighet:** kontrastsjekk og skjermleser-etiketter på radarstatusene.

## 9. Etikk og personvern (kobling til RRI)

- Ingen persondata behandles av prototypen. Svar finnes bare i minnet.
- Startskjermen rammer inn prosjektet som utforskning av algoritmer, ikke av guttene.
- Teknikker merkes, aldri ideologi. Kontrollinnlegget viser at legitime
  standpunkter ikke er manipulasjon.
- Innholdet er mildt og fiktivt og peker ikke til ekte kontoer eller søkeord.
- Feedreisen avsluttes med refleksjon som støtter debriefen gruppa holder etterpå.

## 10. Åpne punkter (avklares utenfor prototypen)

- Endelig navn (kan endres med elevene, ligger i `content.js`).
- Endringer i teknikklisten etter fokusgruppen.
- Publisering: hvor siden skal ligge (f.eks. GitHub Pages eller Netlify), slik at
  offline og hjemskjerm virker. README beskriver framgangsmåten.
