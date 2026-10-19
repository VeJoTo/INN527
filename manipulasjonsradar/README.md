# Manipulasjonsradar – prototype

En fiktiv feed der elever kan se hvilke **manipulasjonsteknikker** innlegg bruker, ikke
hvilken ideologi kilden har. Eleven gjetter først, så viser radaren svaret. Til slutt viser
feedreisen hvordan innholdet endret seg fra første til siste innlegg.

Prototypen er en probe i et living lab-prosjekt: målet er å lære av hvordan elevene
reagerer, ikke å bevise at verktøyet virker. Se `docs/specs/` for hele designet.

Ren HTML, CSS og JavaScript, med Tailwind for utseendet. Ingen backend, ingen cookies,
ingen analyseverktøy. Siden lagrer ingenting om eleven eller svarene. Det eleven velger
ligger bare i nettleserens minne og forsvinner når siden lukkes eller lastes på nytt.

## Filene

| Fil / mappe            | Hva den gjør                                                         |
|------------------------|----------------------------------------------------------------------|
| `content.js`           | **Alt innhold**: tekster, teknikker, de 12 innleggene, refleksjon    |
| `index.html`           | Sidens skjelett: start, intro, feed, radar, feedreise                |
| `app.js`               | Logikken på siden: skjermene, feeden, radarpanelet                   |
| `radar.js`             | Utregningene: sjekk av innholdet, fasit og feedreisen                |
| `tailwind.css`         | Farger, skrift, kort og panel (kildefil for utseendet)               |
| `style.css`            | **Lages automatisk** fra `tailwind.css`. Ikke rediger denne direkte  |
| `bygg-css.sh`          | Bygger `style.css` (se «Endre utseendet»)                            |
| `sw.js`                | Gjør at siden virker uten nett etter første besøk                    |
| `manifest.webmanifest` | Navn, farger og ikon når siden legges til på hjemskjermen            |
| `tester/`              | Automatiske sjekker (se «Sjekk at innholdet er riktig»)              |
| `fonter/`, `ikoner/`   | Skrifttypen Archivo (fri lisens) og appikonet                        |

## Prøv siden lokalt

Kjør dette i Terminal i mappen `manipulasjonsradar` og åpne <http://localhost:8000>:

```sh
python3 -m http.server 8000
```

Vil du prøve på mobilen, må mobilen og maskinen være på samme nett. Åpne
`http://<maskinens-ip>:8000`. Hjemskjerm og offline virker først når siden ligger på
en nettadresse med https (se «Publisere»).

## Endre innholdet

All tekst ligger i `content.js`. Du trenger ikke røre de andre filene, og du trenger
ikke bygge noe på nytt etter tekstendringer. Forklaringen på hvert felt står øverst i fila.

Bruk «sitattegn» inne i teksten, ikke vanlige `"`. Et vanlig `"` avslutter teksten for
tidlig og gjør at siden slutter å virke.

### Endre et innlegg

Hvert innlegg ser slik ut (forkortet):

```js
{
  id: "nitti-prosent",
  fase: 2,
  intensitet: 1,
  konto: "@toppform.mindset",
  skjermtekst: "90 % av gutta gir opp før de er 25.\n\nEr du en av dem?",
  ...
  teknikker: [
    { id: "falsk-hast", hvor: "«Klokka tikker» skaper et press om å handle nå." }
  ],
  snakkOm: "Hvordan føles det å bli spurt «er du en av dem?»?"
}
```

- `teknikker` er fasiten. `id` må være en av id-ene i teknikklisten, og `hvor` forklarer
  i én setning hvor i innlegget teknikken ligger.
- `intensitet` (0–3) bestemmer høyden på søylen i feedreisen.
- Rekkefølgen i lista er rekkefølgen i feeden.

### Legge til eller fjerne et innlegg

Kopier et helt innlegg (fra `{` til `},`), lim det inn der det skal stå i feeden, og gi
det en ny `id`. Teller og feedreise oppdaterer seg selv. Husk komma mellom innleggene.

### Kontrollinnlegg

Innlegg med `kontroll: true` er vanlig innhold uten triks, blandet inn for å se om
elevene «ser teknikker overalt». De skal ha `teknikker: []` og et `notat` som forklarer
dem etter radaren.

### Endre teknikklisten

Teknikkene står under `teknikker`. Endrer du en `id`, må du endre den samme id-en i
alle innlegg som bruker den. Siden sier fra hvis du glemmer det.

### Refleksjonsspørsmålene

Spørsmålene på slutten av feedreisen står under `refleksjon`. Et spørsmål er vanligvis
bare en tekst. Spørsmål som bare gir mening når eleven har brukt radaren, skrives slik:

```js
{ sporsmal: "Hvilket triks var vanskeligst å se? Hvorfor tror du det?", barHvisSkannet: true },
```

Da vises spørsmålet bare hvis minst ett innlegg er skannet.

### Regler for innholdet

Alt er fiktivt. Ikke bruk ekte kontoer, personer, grupper, partier, steder, søkeord eller
slagord. Hold «dem» vagt. Ingen banning, slurs, vold eller trusler.

## Sjekk at innholdet er riktig

Etter at du har endret `content.js`, kjør dette i mappen `manipulasjonsradar`
(krever [Node.js](https://nodejs.org)):

```sh
node --test tester/
```

Står det `fail 0` til slutt, er alt i orden. Ellers står det hva som er galt.

## Hvis siden blir blank eller viser en feil

- **«Innholdsfila har en feil»**: `content.js` har en skrivefeil. Som regel et manglende
  komma, et `"` inne i en tekst, eller en `{` uten `}`. Angre den siste endringen, eller
  kjør `node --test tester/`, som peker på linjen.
- **«Noe i innholdet stemmer ikke»**: fila kan leses, men noe passer ikke sammen, for
  eksempel en teknikk-id som ikke finnes. Siden viser en liste over hva som må rettes.

## Endre utseendet

Farger og stiler står i `tailwind.css`, og klassene står i `index.html` og `app.js`. Etter en
endring må `style.css` bygges på nytt:

```sh
./bygg-css.sh          # bygg én gang
./bygg-css.sh --watch  # bygg automatisk hver gang du lagrer
```

Første gang lastes Tailwind ned til `INN527/.verktoy/` (deles med «Trykk pause»).

Siden er laget for telefoner fra 320 px bredde, stående og liggende, og for projektor i
Sammen-modus. Skjermteksten på hvert kort krymper automatisk til den får plass
(`tilpassSkjermtekst` i `app.js`), så lange tekster legger seg aldri oppå bildeteksten.
Liggende mobil får skjermteksten til venstre og resten til høyre, og radaren åpnes som
et panel ved siden av innlegget.

## Publisere

Siden er bare vanlige filer, og kan legges hvor som helst som serverer filer over https:

- **Netlify Drop**: dra mappen `manipulasjonsradar` inn på <https://app.netlify.com/drop>.
- **GitHub Pages**: legg repoet på GitHub og slå på Pages. Siden ligger da på
  `https://<bruker>.github.io/<repo>/manipulasjonsradar/`.

Etter en endring kan det hende mobilen viser forrige versjon én gang. Last siden på nytt.

## Personvern

Siden lagrer ingenting om deg eller svarene dine: ingen cookies, ingen analyse, og
ingenting sendes noe sted. Alt eleven velger forsvinner når siden lukkes.

For at siden skal virke uten nett, lagrer nettleseren en kopi av sidens egne filer
(HTML, CSS, JavaScript, skrift og innhold). Det er bare programfilene, aldri svar eller
noe annet eleven har gjort.

Tilbakeknappen virker inne i appen fordi hver skjerm legges i nettleserens historikk for
fanen. Der står bare navnet på skjermen (for eksempel «feeden»), aldri hva eleven har svart.
