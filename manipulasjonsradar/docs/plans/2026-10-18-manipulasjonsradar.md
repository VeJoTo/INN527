# Manipulasjonsradar – implementeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygge Manipulasjonsradar: en klikkbar mobilnettside med en fiktiv feed på 12 innlegg, en radar der eleven gjetter manipulasjonsteknikker før fasit vises, og en feedreise som oppsummerer opptrappingen.

**Architecture:** Statisk nettside uten rammeverk i `INN527/manipulasjonsradar/`. `content.js` holder alt innhold. `radar.js` holder ren logikk (validering, fasit, feedreise) og kan testes med Node uten avhengigheter. `app.js` tegner skjermene og holder tilstanden i minnet. Tailwind v4 bygges med det frittstående programmet som allerede ligger i `INN527/.verktoy/`.

**Tech Stack:** HTML, CSS, vanilla JavaScript (ES5-stil med `var` og `function`, slik som «Trykk pause»), Tailwind CSS v4.3.3 (frittstående CLI), Node 20 `node --test` for enhetstester, Chrome DevTools MCP for ende-til-ende-sjekk, `rsvg-convert` for ikoner.

**Spec:** `manipulasjonsradar/docs/specs/2026-10-18-manipulasjonsradar-design.md`

Alle stier i planen er relative til `INN527/manipulasjonsradar/` med mindre annet står. Git-repoet ligger i `INN527/`.

## Global Constraints

- Ingen `localStorage`, `sessionStorage`, IndexedDB, cookies, analyseverktøy eller nettverkskall utover å laste egne filer.
- Ingen eksterne ressurser: skrift, ikoner og CSS ligger i prosjektet.
- All synlig tekst ligger i `content.js` (`CONTENT.tekster`). Unntak: de to feilskjermene i `index.html`, som må virke når `content.js` ikke kan leses.
- Alt innhold er fiktivt. «Dem» holdes vagt. Ingen ekte grupper, partier, personer, steder, søkeord eller slagord. Ingen slurs, banning, vold eller trusler.
- Teknikkene merkes, aldri ideologi. Ordet «feil» brukes ikke i radaren, og det vises ingen poengsum per innlegg.
- Status vises aldri bare med farge, men alltid også med ikon og tekst.
- Trykkflater er minst 44 px. Synlig fokusring. `prefers-reduced-motion` respekteres.
- Alltid mørkt tema (`color-scheme: dark`).
- Kodestil som i «Trykk pause»: `var`, `function`, norske navn uten æøå i identifikatorer, kommentarer på norsk.
- Tailwind-klasser må stå som hele strenger i `index.html` eller `app.js` (ellers genereres de ikke).
- Commit-meldinger på norsk, avsluttet med `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Start på nytt eller bytt modus midt i:** ingen svar fra forrige runde skal henge igjen i knapper, radar eller feedreise. (Sjekk i Task 6 steg 6 og Task 7 steg 4.)
2. **Åpne et innlegg som allerede er skannet:** radaren skal vise det lagrede resultatet, ikke et nytt tomt gjett som kan overskrive det. (Sjekk i Task 5 steg 6.)
3. **Ingen innlegg skannet:** feedreisen skal ikke vise «så 0 av 0» eller `NaN %`. (Test i Task 2 og sjekk i Task 6 steg 6.)
4. **Publisert på samme adresse som «Trykk pause»** (f.eks. GitHub Pages): service workeren må ha eget cachenavn og bare liste filer som finnes. (Test i Task 8.)
5. **Smale og korte skjermer** (320 px bredde, iPhone SE 375×667): ingen vannrett scrolling, og radarknappen må synes på hvert kort uten å scrolle inni kortet. (Sjekk i Task 4 steg 8 og Task 9.)

---

### Task 1: Mappe og validering av innhold (`radar.js`)

**Files:**
- Create: `radar.js`
- Test: `tester/radar.test.js`

**Interfaces:**
- Consumes: ingenting.
- Produces: `Radar.valider(content) → string[]` (tom liste = gyldig). I nettleseren `window.Radar`, i Node `require("../radar.js")`.

- [ ] **Step 1: Write the failing test**

Opprett `tester/radar.test.js`:

```js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Radar = require("../radar.js");

// Et lite, gyldig innhold å teste mot. Hver test lager sin egen kopi.
function lagInnhold() {
  return {
    tekster: {},
    teknikker: [
      { id: "a", navn: "A", kort: "a kort", forklaring: "a forklaring" },
      { id: "b", navn: "B", kort: "b kort", forklaring: "b forklaring" }
    ],
    faser: [
      { nr: 1, navn: "En", kort: "En" },
      { nr: 2, navn: "To", kort: "To" }
    ],
    innlegg: [
      lagInnlegg({ id: "p1", fase: 1, intensitet: 0, teknikker: [] }),
      lagInnlegg({ id: "p2", fase: 2, intensitet: 2, teknikker: [{ id: "a", hvor: "her" }, { id: "b", hvor: "der" }] }),
      lagInnlegg({ id: "p3", fase: 2, intensitet: 0, kontroll: true, teknikker: [], notat: "vanlig" })
    ],
    refleksjon: ["Hva tenker du?"]
  };
}

function lagInnlegg(felter) {
  return Object.assign({
    konto: "@konto",
    skjermtekst: "tekst",
    bildetekst: "bildetekst",
    hashtags: ["tag"],
    likes: 10,
    kommentarer: 2,
    utvalgteKommentarer: ["kommentar"],
    bakgrunn: ["#000000", "#111111"],
    snakkOm: "spørsmål"
  }, felter);
}

test("valider: gyldig innhold gir ingen feil", () => {
  assert.deepEqual(Radar.valider(lagInnhold()), []);
});

test("valider: manglende innhold", () => {
  assert.deepEqual(Radar.valider(undefined), ["Fant ikke innholdet (window.CONTENT)."]);
});

test("valider: ukjent teknikk i et innlegg", () => {
  const c = lagInnhold();
  c.innlegg[1].teknikker.push({ id: "finnes-ikke", hvor: "x" });
  assert.deepEqual(Radar.valider(c), ["Innlegg «p2»: teknikk «finnes-ikke» finnes ikke i teknikklisten."]);
});

test("valider: samme teknikk to ganger i ett innlegg", () => {
  const c = lagInnhold();
  c.innlegg[1].teknikker.push({ id: "a", hvor: "igjen" });
  assert.deepEqual(Radar.valider(c), ["Innlegg «p2»: teknikk «a» står flere ganger."]);
});

test("valider: teknikk i innlegg uten «hvor»", () => {
  const c = lagInnhold();
  c.innlegg[1].teknikker[0].hvor = "  ";
  assert.deepEqual(Radar.valider(c), ["Innlegg «p2»: teknikk «a» mangler «hvor»."]);
});

test("valider: like id-er", () => {
  const c = lagInnhold();
  c.innlegg[2].id = "p1";
  c.teknikker[1].id = "a";
  const feil = Radar.valider(c);
  assert.ok(feil.includes("Teknikk «a» finnes flere ganger. Hver id må være unik."));
  assert.ok(feil.includes("Innlegg «p1» finnes flere ganger. Hver id må være unik."));
});

test("valider: ugyldig intensitet og ukjent fase", () => {
  const c = lagInnhold();
  c.innlegg[0].intensitet = 4;
  c.innlegg[0].fase = 9;
  assert.deepEqual(Radar.valider(c), [
    "Innlegg «p1»: fase «9» finnes ikke i «faser».",
    "Innlegg «p1»: «intensitet» må være 0, 1, 2 eller 3."
  ]);
});

test("valider: kontrollinnlegg med teknikker", () => {
  const c = lagInnhold();
  c.innlegg[2].teknikker = [{ id: "a", hvor: "x" }];
  assert.deepEqual(Radar.valider(c), ["Innlegg «p3» er et kontrollinnlegg og skal ikke ha teknikker."]);
});

test("valider: manglende felt i innlegg og teknikk", () => {
  const c = lagInnhold();
  delete c.innlegg[0].skjermtekst;
  c.innlegg[0].bakgrunn = ["#000000"];
  c.innlegg[0].likes = -1;
  c.teknikker[0].forklaring = "";
  assert.deepEqual(Radar.valider(c), [
    "Teknikk «a» mangler «forklaring».",
    "Innlegg «p1» mangler «skjermtekst».",
    "Innlegg «p1»: «likes» må være et tall (0 eller mer).",
    "Innlegg «p1»: «bakgrunn» må være en liste med to farger, f.eks. [\"#111827\", \"#7f1d1d\"]."
  ]);
});

test("valider: teknikker må være en liste", () => {
  const c = lagInnhold();
  c.innlegg[0].teknikker = undefined;
  assert.deepEqual(Radar.valider(c), ["Innlegg «p1»: «teknikker» må være en liste (tom liste [] betyr ingen teknikker)."]);
});

test("valider: tomme lister på toppnivå", () => {
  const c = lagInnhold();
  c.refleksjon = [];
  c.faser[1].kort = "";
  assert.deepEqual(Radar.valider(c), [
    "Fase 2 mangler «kort».",
    "«refleksjon» må være en liste med minst ett spørsmål."
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: FAIL med `Cannot find module '../radar.js'`

- [ ] **Step 3: Write minimal implementation**

Opprett `radar.js`:

```js
/*
 * RADARENS LOGIKK
 * ---------------
 * Rene utregninger uten noe med selve siden å gjøre, slik at de kan testes
 * med `node --test tester/`. app.js bruker dem som window.Radar.
 *
 * Du trenger ikke endre denne fila for å endre innhold. Det gjøres i content.js.
 */

(function (rot, lag) {
  var api = lag();
  if (typeof module === "object" && module.exports) module.exports = api;
  else rot.Radar = api;
})(this, function () {
  "use strict";

  function erTekst(v) {
    return typeof v === "string" && v.trim() !== "";
  }

  function erTekstliste(v) {
    return Array.isArray(v) && v.every(erTekst);
  }

  // ---------- Validering av content.js ----------
  // Gir en liste med feilmeldinger på norsk. Tom liste betyr at alt er i orden.

  function valider(c) {
    if (!c || typeof c !== "object") return ["Fant ikke innholdet (window.CONTENT)."];
    var feil = [];

    if (!c.tekster || typeof c.tekster !== "object") feil.push("Mangler «tekster».");

    var teknikkIder = {};
    if (!Array.isArray(c.teknikker) || c.teknikker.length === 0) {
      feil.push("«teknikker» må være en liste med minst én teknikk.");
    } else {
      c.teknikker.forEach(function (t, i) {
        if (!t || !erTekst(t.id)) {
          feil.push("Teknikk nr. " + (i + 1) + " mangler id.");
          return;
        }
        var navn = "Teknikk «" + t.id + "»";
        if (teknikkIder[t.id]) feil.push(navn + " finnes flere ganger. Hver id må være unik.");
        teknikkIder[t.id] = true;
        ["navn", "kort", "forklaring"].forEach(function (felt) {
          if (!erTekst(t[felt])) feil.push(navn + " mangler «" + felt + "».");
        });
      });
    }

    var faseNr = {};
    if (!Array.isArray(c.faser) || c.faser.length === 0) {
      feil.push("«faser» må være en liste med minst én fase.");
    } else {
      c.faser.forEach(function (f, i) {
        if (!f || typeof f.nr !== "number") {
          feil.push("Fase nr. " + (i + 1) + " mangler «nr».");
          return;
        }
        if (faseNr[f.nr]) feil.push("Fase " + f.nr + " finnes flere ganger.");
        faseNr[f.nr] = true;
        ["navn", "kort"].forEach(function (felt) {
          if (!erTekst(f[felt])) feil.push("Fase " + f.nr + " mangler «" + felt + "».");
        });
      });
    }

    if (!Array.isArray(c.innlegg) || c.innlegg.length === 0) {
      feil.push("«innlegg» må være en liste med minst ett innlegg.");
    } else {
      var innleggIder = {};
      c.innlegg.forEach(function (p, i) {
        feil.push.apply(feil, validerInnlegg(p, i, teknikkIder, faseNr, innleggIder));
      });
    }

    if (!Array.isArray(c.refleksjon) || c.refleksjon.length === 0 || !erTekstliste(c.refleksjon)) {
      feil.push("«refleksjon» må være en liste med minst ett spørsmål.");
    }

    return feil;
  }

  function validerInnlegg(p, i, teknikkIder, faseNr, innleggIder) {
    if (!p || !erTekst(p.id)) return ["Innlegg nr. " + (i + 1) + " mangler id."];
    var feil = [];
    var navn = "Innlegg «" + p.id + "»";

    if (innleggIder[p.id]) feil.push(navn + " finnes flere ganger. Hver id må være unik.");
    innleggIder[p.id] = true;

    ["konto", "skjermtekst", "bildetekst", "snakkOm"].forEach(function (felt) {
      if (!erTekst(p[felt])) feil.push(navn + " mangler «" + felt + "».");
    });
    if (!faseNr[p.fase]) feil.push(navn + ": fase «" + p.fase + "» finnes ikke i «faser».");
    if ([0, 1, 2, 3].indexOf(p.intensitet) === -1) feil.push(navn + ": «intensitet» må være 0, 1, 2 eller 3.");
    if (p.kontroll !== undefined && typeof p.kontroll !== "boolean") feil.push(navn + ": «kontroll» må være true eller false.");
    if (p.notat !== undefined && !erTekst(p.notat)) feil.push(navn + ": «notat» er tomt. Fjern det eller skriv en tekst.");
    ["likes", "kommentarer"].forEach(function (felt) {
      if (typeof p[felt] !== "number" || p[felt] < 0) feil.push(navn + ": «" + felt + "» må være et tall (0 eller mer).");
    });
    if (!erTekstliste(p.hashtags)) feil.push(navn + ": «hashtags» må være en liste med tekster.");
    if (!erTekstliste(p.utvalgteKommentarer)) feil.push(navn + ": «utvalgteKommentarer» må være en liste med tekster.");
    if (!erTekstliste(p.bakgrunn) || p.bakgrunn.length !== 2) {
      feil.push(navn + ": «bakgrunn» må være en liste med to farger, f.eks. [\"#111827\", \"#7f1d1d\"].");
    }

    if (!Array.isArray(p.teknikker)) {
      feil.push(navn + ": «teknikker» må være en liste (tom liste [] betyr ingen teknikker).");
      return feil;
    }
    var sett = {};
    p.teknikker.forEach(function (t) {
      if (!t || !erTekst(t.id)) {
        feil.push(navn + ": en teknikk mangler id.");
        return;
      }
      if (!teknikkIder[t.id]) feil.push(navn + ": teknikk «" + t.id + "» finnes ikke i teknikklisten.");
      if (sett[t.id]) feil.push(navn + ": teknikk «" + t.id + "» står flere ganger.");
      sett[t.id] = true;
      if (!erTekst(t.hvor)) feil.push(navn + ": teknikk «" + t.id + "» mangler «hvor».");
    });
    if (p.kontroll === true && p.teknikker.length > 0) {
      feil.push(navn + " er et kontrollinnlegg og skal ikke ha teknikker.");
    }
    return feil;
  }

  return {
    valider: valider
  };
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: PASS, 11 tester, 0 feilet

- [ ] **Step 5: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/radar.js manipulasjonsradar/tester/radar.test.js
git commit -m "Manipulasjonsradar: validering av innhold

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Gjetning, fasit og feedreise (`radar.js`)

**Files:**
- Modify: `radar.js` (legg til funksjoner før `return {` og utvid objektet som returneres)
- Test: `tester/radar.test.js` (legg til nederst)

**Interfaces:**
- Consumes: `lagInnhold()` og `lagInnlegg()` i testfila fra Task 1.
- Produces (alle på `Radar`):
  - `tomGjetning() → { ingen: false, teknikker: [] }`
  - `veksleValg(gjetning, valg) → gjetning` der `valg` er `"ingen"` eller en teknikk-id. Endrer ikke originalen. «Ingen» og teknikker utelukker hverandre.
  - `kanVise(gjetning) → boolean`: sann når «Ingen» eller minst én teknikk er valgt.
  - `vurder(innlegg, gjetning) → { funnet: string[], oversett: string[], ikkeHer: string[], ingenRiktig: boolean }`. `funnet` og `oversett` følger rekkefølgen i innlegget, `ikkeHer` følger rekkefølgen eleven valgte i.
  - `feedreise(content, svar) → { tidslinje, teknikkPerFase, treffPerTeknikk, skannet, ikkeSkannet }`, der `svar` er `{ [innleggId]: gjetning }`.
    - `tidslinje: [{ id, fase, intensitet, kontroll: boolean, skannet: boolean, antallTeknikker }]`
    - `teknikkPerFase: [{ nr, navn, kort, antall: { [teknikkId]: number } }]` (alle teknikk-id-er med, også 0)
    - `treffPerTeknikk: [{ id, navn, sett, av }]`, der `av` = antall skannede innlegg med teknikken og `sett` = hvor mange av dem eleven fant
  - `fyllInn(mal, verdier) → string`: bytter `{navn}` med verdier. Ukjente plassholdere står urørt.
  - `kortTall(n) → string`: `999 → "999"`, `1840 → "1,8k"`, `26700 → "27k"`, `1200000 → "1,2 mill."`

- [ ] **Step 1: Write the failing test**

Legg til nederst i `tester/radar.test.js`:

```js
// ---------- Gjetning ----------

test("veksleValg: teknikker legges til og fjernes", () => {
  let g = Radar.tomGjetning();
  g = Radar.veksleValg(g, "a");
  g = Radar.veksleValg(g, "b");
  assert.deepEqual(g, { ingen: false, teknikker: ["a", "b"] });
  g = Radar.veksleValg(g, "a");
  assert.deepEqual(g, { ingen: false, teknikker: ["b"] });
});

test("veksleValg: «ingen» fjerner teknikker, og en teknikk fjerner «ingen»", () => {
  let g = Radar.veksleValg(Radar.veksleValg(Radar.tomGjetning(), "a"), "ingen");
  assert.deepEqual(g, { ingen: true, teknikker: [] });
  g = Radar.veksleValg(g, "b");
  assert.deepEqual(g, { ingen: false, teknikker: ["b"] });
  assert.deepEqual(Radar.veksleValg({ ingen: true, teknikker: [] }, "ingen"), Radar.tomGjetning());
});

test("veksleValg: endrer ikke den gamle gjetningen", () => {
  const g = Radar.tomGjetning();
  Radar.veksleValg(g, "a");
  assert.deepEqual(g, { ingen: false, teknikker: [] });
});

test("kanVise", () => {
  assert.equal(Radar.kanVise(Radar.tomGjetning()), false);
  assert.equal(Radar.kanVise({ ingen: true, teknikker: [] }), true);
  assert.equal(Radar.kanVise({ ingen: false, teknikker: ["a"] }), true);
});

// ---------- Vurdering ----------

test("vurder: funnet, oversett og ikke her", () => {
  const p2 = lagInnhold().innlegg[1]; // teknikker a og b
  assert.deepEqual(Radar.vurder(p2, { ingen: false, teknikker: ["c", "b"] }), {
    funnet: ["b"], oversett: ["a"], ikkeHer: ["c"], ingenRiktig: false
  });
});

test("vurder: «ingen» på et innlegg uten teknikker", () => {
  const p1 = lagInnhold().innlegg[0];
  assert.deepEqual(Radar.vurder(p1, { ingen: true, teknikker: [] }), {
    funnet: [], oversett: [], ikkeHer: [], ingenRiktig: true
  });
});

test("vurder: «ingen» på et innlegg med teknikker gir bare oversette", () => {
  const p2 = lagInnhold().innlegg[1];
  assert.deepEqual(Radar.vurder(p2, { ingen: true, teknikker: [] }), {
    funnet: [], oversett: ["a", "b"], ikkeHer: [], ingenRiktig: false
  });
});

// ---------- Feedreisen ----------

test("feedreise: tidslinje og teknikker per fase", () => {
  const r = Radar.feedreise(lagInnhold(), {});
  assert.deepEqual(r.tidslinje, [
    { id: "p1", fase: 1, intensitet: 0, kontroll: false, skannet: false, antallTeknikker: 0 },
    { id: "p2", fase: 2, intensitet: 2, kontroll: false, skannet: false, antallTeknikker: 2 },
    { id: "p3", fase: 2, intensitet: 0, kontroll: true, skannet: false, antallTeknikker: 0 }
  ]);
  assert.deepEqual(r.teknikkPerFase, [
    { nr: 1, navn: "En", kort: "En", antall: { a: 0, b: 0 } },
    { nr: 2, navn: "To", kort: "To", antall: { a: 1, b: 1 } }
  ]);
});

test("feedreise: ingen skannet gir av = 0 overalt, ikke NaN", () => {
  const r = Radar.feedreise(lagInnhold(), {});
  assert.equal(r.skannet, 0);
  assert.equal(r.ikkeSkannet, 3);
  assert.deepEqual(r.treffPerTeknikk, [
    { id: "a", navn: "A", sett: 0, av: 0 },
    { id: "b", navn: "B", sett: 0, av: 0 }
  ]);
});

test("feedreise: treff teller bare skannede innlegg", () => {
  const c = lagInnhold();
  c.innlegg.push(lagInnlegg({ id: "p4", fase: 2, intensitet: 3, teknikker: [{ id: "a", hvor: "x" }] }));
  const r = Radar.feedreise(c, {
    p1: { ingen: true, teknikker: [] },
    p2: { ingen: false, teknikker: ["a"] }
    // p3 og p4 er ikke skannet
  });
  assert.equal(r.skannet, 2);
  assert.equal(r.ikkeSkannet, 2);
  assert.deepEqual(r.treffPerTeknikk, [
    { id: "a", navn: "A", sett: 1, av: 1 },
    { id: "b", navn: "B", sett: 0, av: 1 }
  ]);
  assert.equal(r.tidslinje[1].skannet, true);
  assert.equal(r.tidslinje[3].skannet, false);
});

// ---------- Tekst og tall ----------

test("fyllInn", () => {
  assert.equal(Radar.fyllInn("{nr} av {totalt}", { nr: 4, totalt: 12 }), "4 av 12");
  assert.equal(Radar.fyllInn("så {sett} av {av}", { sett: 0, av: 3 }), "så 0 av 3");
  assert.equal(Radar.fyllInn("{ukjent} står", {}), "{ukjent} står");
});

test("kortTall", () => {
  assert.equal(Radar.kortTall(0), "0");
  assert.equal(Radar.kortTall(999), "999");
  assert.equal(Radar.kortTall(1000), "1k");
  assert.equal(Radar.kortTall(1840), "1,8k");
  assert.equal(Radar.kortTall(26700), "27k");
  assert.equal(Radar.kortTall(168000), "168k");
  assert.equal(Radar.kortTall(1200000), "1,2 mill.");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: FAIL med `TypeError: Radar.tomGjetning is not a function` (og lignende)

- [ ] **Step 3: Write minimal implementation**

I `radar.js`: legg til denne blokken rett før linjen `  return {`:

```js
  // ---------- Gjetning ----------
  // En gjetning ser slik ut: { ingen: false, teknikker: ["falsk-hast"] }

  function tomGjetning() {
    return { ingen: false, teknikker: [] };
  }

  // Slår et valg av eller på. «Ingen av disse» og teknikker utelukker hverandre.
  function veksleValg(g, valg) {
    if (valg === "ingen") return g.ingen ? tomGjetning() : { ingen: true, teknikker: [] };
    var harDen = g.teknikker.indexOf(valg) !== -1;
    return {
      ingen: false,
      teknikker: harDen
        ? g.teknikker.filter(function (id) { return id !== valg; })
        : g.teknikker.concat([valg])
    };
  }

  function kanVise(g) {
    return !!g && (g.ingen || g.teknikker.length > 0);
  }

  // Sammenligner gjetningen med teknikkene innlegget faktisk bruker.
  function vurder(innlegg, g) {
    var fasit = innlegg.teknikker.map(function (t) { return t.id; });
    var gjettet = g.ingen ? [] : g.teknikker;
    return {
      funnet: fasit.filter(function (id) { return gjettet.indexOf(id) !== -1; }),
      oversett: fasit.filter(function (id) { return gjettet.indexOf(id) === -1; }),
      ikkeHer: gjettet.filter(function (id) { return fasit.indexOf(id) === -1; }),
      ingenRiktig: g.ingen && fasit.length === 0
    };
  }

  // ---------- Feedreisen ----------
  // svar: { innleggId: gjetning }. Innlegg som mangler i svar, er ikke skannet.

  function feedreise(c, svar) {
    var tidslinje = c.innlegg.map(function (p) {
      return {
        id: p.id,
        fase: p.fase,
        intensitet: p.intensitet,
        kontroll: p.kontroll === true,
        skannet: !!svar[p.id],
        antallTeknikker: p.teknikker.length
      };
    });

    var teknikkPerFase = c.faser.map(function (f) {
      var antall = {};
      c.teknikker.forEach(function (t) { antall[t.id] = 0; });
      c.innlegg.forEach(function (p) {
        if (p.fase !== f.nr) return;
        p.teknikker.forEach(function (t) { antall[t.id] += 1; });
      });
      return { nr: f.nr, navn: f.navn, kort: f.kort, antall: antall };
    });

    var treffPerTeknikk = c.teknikker.map(function (t) {
      var sett = 0;
      var av = 0;
      c.innlegg.forEach(function (p) {
        var g = svar[p.id];
        if (!g) return;
        if (!p.teknikker.some(function (x) { return x.id === t.id; })) return;
        av += 1;
        if (vurder(p, g).funnet.indexOf(t.id) !== -1) sett += 1;
      });
      return { id: t.id, navn: t.navn, sett: sett, av: av };
    });

    var skannet = c.innlegg.filter(function (p) { return !!svar[p.id]; }).length;

    return {
      tidslinje: tidslinje,
      teknikkPerFase: teknikkPerFase,
      treffPerTeknikk: treffPerTeknikk,
      skannet: skannet,
      ikkeSkannet: c.innlegg.length - skannet
    };
  }

  // ---------- Tekst og tall ----------

  // fyllInn("{nr} av {totalt}", { nr: 4, totalt: 12 }) → "4 av 12"
  function fyllInn(mal, verdier) {
    return mal.replace(/\{(\w+)\}/g, function (hele, navn) {
      return Object.prototype.hasOwnProperty.call(verdier, navn) ? String(verdier[navn]) : hele;
    });
  }

  // Likes og kommentarer slik feeder viser dem: 1840 → "1,8k"
  function kortTall(n) {
    if (n < 1000) return String(n);
    if (n < 10000) return String(Math.round(n / 100) / 10).replace(".", ",") + "k";
    if (n < 1000000) return Math.round(n / 1000) + "k";
    return String(Math.round(n / 100000) / 10).replace(".", ",") + " mill.";
  }

```

Bytt ut objektet som returneres nederst med:

```js
  return {
    valider: valider,
    tomGjetning: tomGjetning,
    veksleValg: veksleValg,
    kanVise: kanVise,
    vurder: vurder,
    feedreise: feedreise,
    fyllInn: fyllInn,
    kortTall: kortTall
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: PASS, 23 tester, 0 feilet

- [ ] **Step 5: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/radar.js manipulasjonsradar/tester/radar.test.js
git commit -m "Manipulasjonsradar: gjetning, fasit og feedreise

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Innholdet (`content.js`)

**Files:**
- Create: `content.js`
- Test: `tester/innhold.test.js`

**Interfaces:**
- Consumes: `Radar.valider` (Task 1), `Radar.fyllInn` (Task 2).
- Produces: `window.CONTENT` med `tekster`, `teknikker` (6), `faser` (4), `innlegg` (12), `refleksjon` (3). Tekstnøklene under `tekster` brukes av `index.html` (Task 4) og `app.js` (Task 4–7). Plassholdere i tekstene: `{nr}`, `{totalt}`, `{antall}`, `{sett}`, `{av}`, `{niva}`.

- [ ] **Step 1: Write the failing test**

Opprett `tester/innhold.test.js`:

```js
"use strict";

// Sjekker det ekte innholdet i content.js. Kjør denne etter at du har endret innhold:
//   node --test tester/

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Radar = require("../radar.js");

function lastInnhold() {
  const kode = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");
  const kontekst = { window: {} };
  vm.runInNewContext(kode, kontekst, { filename: "content.js" });
  return kontekst.window.CONTENT;
}

const C = lastInnhold();
const vanlige = C.innlegg.filter((p) => !p.kontroll);

test("innholdet er gyldig", () => {
  assert.deepEqual(Radar.valider(C), []);
});

test("12 innlegg, hvorav 2 kontrollinnlegg", () => {
  assert.equal(C.innlegg.length, 12);
  assert.equal(C.innlegg.filter((p) => p.kontroll).length, 2);
});

test("hver teknikk brukes minst én gang", () => {
  C.teknikker.forEach((t) => {
    const brukt = C.innlegg.some((p) => p.teknikker.some((x) => x.id === t.id));
    assert.ok(brukt, "Teknikken «" + t.id + "» brukes ikke i noe innlegg");
  });
});

test("opptrappingen: intensiteten synker aldri (kontrollinnlegg unntatt)", () => {
  for (let i = 1; i < vanlige.length; i++) {
    assert.ok(vanlige[i].intensitet >= vanlige[i - 1].intensitet, "Intensiteten synker ved «" + vanlige[i].id + "»");
  }
});

test("opptrappingen: likes øker gjennom feeden (kontrollinnlegg unntatt)", () => {
  for (let i = 1; i < vanlige.length; i++) {
    assert.ok(vanlige[i].likes > vanlige[i - 1].likes, "Likes øker ikke ved «" + vanlige[i].id + "»");
  }
});

test("kontrollinnlegg har et notat som forklarer dem", () => {
  C.innlegg.filter((p) => p.kontroll).forEach((p) => {
    assert.ok(p.notat && p.notat.trim(), "Kontrollinnlegget «" + p.id + "» mangler notat");
  });
});

test("feedreisen har én nivåtekst per intensitet", () => {
  assert.equal(C.tekster.reise.nivaer.length, 4);
});

test("bare kjente plassholdere i tekstene", () => {
  const kjente = ["nr", "totalt", "antall", "sett", "av", "niva"];
  JSON.stringify(C.tekster).replace(/\{(\w+)\}/g, (hele, navn) => {
    assert.ok(kjente.includes(navn), "Ukjent plassholder {" + navn + "} i tekster");
    return hele;
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: FAIL med `ENOENT: no such file or directory, open '.../content.js'`

- [ ] **Step 3: Write the content**

Opprett `content.js`:

```js
/*
 * ALT INNHOLD I MANIPULASJONSRADAR
 * --------------------------------
 * Her ligger alle tekster, teknikker og innlegg. Du kan endre denne fila
 * uten å røre index.html, app.js, radar.js eller style.css.
 *
 * Etter at du har endret noe: kjør `node --test tester/` i Terminal, eller
 * last siden på nytt. Siden sier fra hvis noe ikke stemmer.
 *
 * Regler for redigering:
 * - Tekst står i "anførselstegn". Bruk «sitattegn» inne i teksten,
 *   ikke vanlige " (de avslutter teksten for tidlig).
 * - Hvert element i en liste skilles med komma.
 * - id-er skrives med små bokstaver og bindestrek, uten mellomrom og æøå.
 * - \n i en tekst betyr ny linje.
 * - Ord i {krøllparenteser} fylles inn av siden. La dem stå.
 *
 * Felter på hvert innlegg:
 *   id                  – unik id, brukes bare internt
 *   fase                – hvilken del av feeden (nr. i «faser»)
 *   intensitet          – hvor mye innlegget presser: 0 (ingenting) til 3 (mye)
 *   kontroll            – true for vanlige innlegg som er blandet inn (skal ikke ha teknikker)
 *   konto               – fiktivt brukernavn. Skal ikke ligne ekte kontoer
 *   skjermtekst         – den store teksten på kortet
 *   bildetekst          – teksten under, som en caption
 *   hashtags            – uten #
 *   likes, kommentarer  – tall
 *   utvalgteKommentarer – 1–3 kommentarer som vises på kortet
 *   bakgrunn            – to farger for bakgrunnen. Velg mørke farger, teksten er hvit
 *   teknikker           – teknikkene innlegget bruker: id + «hvor» (én setning om hvor i innlegget)
 *                         Tom liste [] betyr ingen teknikker.
 *   snakkOm             – spørsmål som vises før gjetting i Sammen-modus
 *   notat               – valgfri forklaring etter radaren (brukes på kontrollinnleggene)
 */

window.CONTENT = {
  tekster: {
    start: {
      tittel: "Manipulasjonsradar",
      tekst: "Bla gjennom en feed og se om du klarer å avsløre triksene innleggene bruker for å påvirke deg.",
      ramme:
        "Dette handler om hvordan feeder og algoritmer virker – ikke om deg. " +
        "Alle innlegg og kontoer er fiktive og laget for dette prosjektet. " +
        "Radaren ser på hvordan innhold prøver å påvirke, ikke på hvilke meninger noen har.",
      velg: "Hvordan skal dere bruke den?",
      alene: "Alene",
      aleneBeskrivelse: "På din egen mobil, i ditt eget tempo.",
      sammen: "Sammen",
      sammenBeskrivelse: "På felles skjerm. Gruppa gjetter sammen, og én trykker.",
      personvern: "Ingenting du velger blir lagret eller sendt noe sted. Lukker du siden, er alt borte."
    },
    intro: {
      tittel: "Seks triks å se etter",
      tekst: "Radaren leter etter disse teknikkene. De finnes i memes, videoer og innlegg om alt mulig – uansett politisk ståsted.",
      hopp: "Hopp over",
      start: "Start feeden"
    },
    feed: {
      tittel: "Feeden",
      fiktiv: "Fiktiv feed",
      fremdrift: "{nr} av {totalt}",
      kortEtikett: "Innlegg {nr} av {totalt}",
      likes: "{antall} likes",
      kommentarer: "{antall} kommentarer",
      utvalgte: "Kommentarer",
      skann: "Skann med radaren",
      skannet: "Se radaren igjen",
      sluttTittel: "Det var feeden.",
      sluttTekst: "Tolv innlegg. Hvordan endret de seg fra første til siste?",
      tilReisen: "Se feedreisen"
    },
    radar: {
      lukk: "Lukk radaren",
      sporsmal: "Hvilke triks ser du?",
      hjelp: "Velg alle du tror er med. Det er lov å gjette.",
      ingen: "Ingen av disse",
      vis: "Vis radaren",
      snakkOm: "Snakk om dette først",
      resultatTittel: "Dette fant radaren",
      funnet: "Du så den",
      oversett: "Vanskelig å se",
      ikkeHer: "Ikke i dette innlegget",
      ingenRiktig: "Stemmer – dette innlegget bruker ingen av teknikkene.",
      ingenTeknikker: "Dette innlegget bruker ingen av teknikkene.",
      omTeknikken: "Om teknikken",
      tilbake: "Tilbake til feeden"
    },
    reise: {
      tittel: "Feedreisen",
      tekst: "Slik så feeden ut fra første til siste innlegg.",
      tidslinjeTittel: "Hvordan feeden endret seg",
      tidslinjeTekst: "Hver søyle er ett innlegg. Jo høyere søyle, jo mer prøvde innlegget å presse deg.",
      soyleEtikett: "Innlegg {nr}: {niva}",
      nivaer: ["nøytralt", "litt press", "mer press", "sterkt press"],
      kontrollKort: "vanlig innhold",
      kontrollForklaring: "Vanlig innhold uten triks, blandet inn underveis",
      kartTittel: "Triksene underveis",
      kartTekst: "Hvor mange ganger hver teknikk dukket opp i hver del av feeden.",
      kartTeknikk: "Teknikk",
      treffTittel: "Det du la merke til",
      treffTittelSammen: "Det gruppa la merke til",
      treffTekst: "så {sett} av {av}",
      ikkeMedSkannet: "Ikke med i innleggene som ble skannet",
      ingenSkannet: "Ingen innlegg ble skannet. Det er også et funn – hva fikk deg til å bla videre?",
      ikkeSkannet: "{antall} av innleggene ble ikke skannet.",
      refleksjonTittel: "Snakk om det",
      igjen: "Se innleggene igjen",
      nyStart: "Start på nytt"
    }
  },

  // Listen er et utgangspunkt. Elevene kan endre den i fokusgruppen.
  teknikker: [
    {
      id: "oss-mot-dem",
      navn: "Oss mot dem",
      kort: "Verden deles i to grupper, der den andre gruppen er en trussel.",
      forklaring:
        "Innholdet gjør «oss» til de gode og «dem» til et problem eller en fare. " +
        "Det gjør det vanskelig å se at folk er sammensatte, og lett å føle at du må velge side."
    },
    {
      id: "syndebukk",
      navn: "Syndebukk",
      kort: "En gruppe får skylden for et sammensatt problem.",
      forklaring:
        "Store problemer har som regel mange årsaker. Når én gruppe får all skylden, " +
        "føles forklaringen enkel og tilfredsstillende – men den stemmer sjelden."
    },
    {
      id: "sterke-folelser",
      navn: "Sterke følelser",
      kort: "Sinne, frykt eller ydmykelse brukes for å få deg til å reagere før du tenker.",
      forklaring:
        "Innhold som gjør deg sint, redd eller flau, får mer engasjement – og algoritmen viser mer av det som engasjerer. " +
        "Når følelsene tar over, er det lettere å dele før man har tenkt seg om."
    },
    {
      id: "skjuler-sannheten",
      navn: "«De skjuler sannheten»",
      kort: "Innholdet hevder å avsløre noe mediene eller eliten holder skjult.",
      forklaring:
        "«Ingen vil snakke om dette» får deg til å føle at du er blant de få som skjønner det. " +
        "Samtidig blir all motforestilling bare et nytt «bevis» på at noen skjuler noe."
    },
    {
      id: "ironi-skjold",
      navn: "Ironi som skjold",
      kort: "Ekstreme utsagn pakkes inn i humor, så kritikk kan avfeies som «bare tull».",
      forklaring:
        "Når et hardt budskap pakkes inn i en meme eller en vits, blir det vanskelig å kritisere: «det er jo bare tull». " +
        "Men budskapet blir værende, og det som startet som en vits, kan bli normalt."
    },
    {
      id: "falsk-hast",
      navn: "Falsk hast",
      kort: "Du må handle eller dele nå, før det er for sent.",
      forklaring:
        "«Del før det blir slettet» eller «snart er det for sent» presser deg til å handle med en gang. " +
        "Hast gir mindre tid til å tenke og sjekke."
    }
  ],

  faser: [
    { nr: 1, navn: "Nøytralt", kort: "Nøytralt" },
    { nr: 2, navn: "Selvforbedring med brodd", kort: "Brodd" },
    { nr: 3, navn: "Mistillit", kort: "Mistillit" },
    { nr: 4, navn: "Fiendebilde", kort: "Fiende" }
  ],

  // Rekkefølgen her er rekkefølgen i feeden.
  innlegg: [
    {
      id: "trening",
      fase: 1,
      intensitet: 0,
      konto: "@formkurven",
      skjermtekst: "3 øvelser for sterkere rygg 💪\n\nMarkløft · Roing · Pull-ups",
      bildetekst: "Rolig progresjon slår ego-løft hver gang. Lagre til neste økt.",
      hashtags: ["trening", "styrke", "gym"],
      likes: 1840,
      kommentarer: 42,
      utvalgteKommentarer: ["Prøvde dette i går, kjenner det godt i dag 😅", "Hvor mange sett anbefaler du?"],
      bakgrunn: ["#1e3a5f", "#0f766e"],
      teknikker: [],
      snakkOm: "Hva får dere til å stoppe opp ved et innlegg som dette?"
    },
    {
      id: "gaming",
      fase: 1,
      intensitet: 0,
      konto: "@pixelpelle",
      skjermtekst: "Når laget endelig vinner etter 9 tap på rad 😭🏆",
      bildetekst: "Aldri gi opp squaden. GG til alle som var med.",
      hashtags: ["gaming", "gg", "clutch"],
      likes: 3210,
      kommentarer: 87,
      utvalgteKommentarer: ["den siste runden var helt syk", "9 tap?? respekt for at dere holdt ut"],
      bakgrunn: ["#4c1d95", "#9d174d"],
      teknikker: [],
      snakkOm: "Hva slags innhold er det vanlig at feeden starter med for folk på deres alder?"
    },
    {
      id: "morgen",
      fase: 1,
      intensitet: 0,
      konto: "@tidligoppe",
      skjermtekst: "Stå opp kl. 06.00 i 30 dager.\nDette skjedde 👇",
      bildetekst: "Bedre søvn, mer tid til trening og mindre stress om morgenen. Ikke magi – bare vaner.",
      hashtags: ["motivasjon", "rutiner", "disiplin"],
      likes: 5120,
      kommentarer: 130,
      utvalgteKommentarer: ["klarte 4 dager 💀", "hva gjorde du med telefonen om kvelden?"],
      bakgrunn: ["#92400e", "#1e293b"],
      teknikker: [],
      snakkOm: "Er motivasjonsinnhold mest nyttig, eller kan det også bli for mye?"
    },
    {
      id: "ingen-redder",
      fase: 2,
      intensitet: 1,
      konto: "@ulvementalitet",
      skjermtekst: "Ingen kommer til å redde deg.\n\nIkke familien. Ikke vennene. Ikke samfunnet.",
      bildetekst: "Jo før du skjønner at du står alene, jo før blir du sterk.",
      hashtags: ["mindset", "disiplin", "alene"],
      likes: 18400,
      kommentarer: 612,
      utvalgteKommentarer: ["trengte å høre dette i dag", "så sant. folk bryr seg bare om seg selv"],
      bakgrunn: ["#111827", "#7f1d1d"],
      teknikker: [
        {
          id: "sterke-folelser",
          hvor: "Innlegget spiller på ensomhet og en følelse av å være sviktet («ikke familien, ikke vennene») for å vekke en sterk reaksjon."
        }
      ],
      snakkOm: "Hvorfor tror dere et budskap som dette treffer mange?"
    },
    {
      id: "nitti-prosent",
      fase: 2,
      intensitet: 1,
      konto: "@toppform.mindset",
      skjermtekst: "90 % av gutta gir opp før de er 25.\n\nEr du en av dem?",
      bildetekst: "Klokka tikker. Hver dag du venter, er en dag de andre går forbi deg. Start i dag – ikke i morgen.",
      hashtags: ["hustle", "mindset", "gutta"],
      likes: 26700,
      kommentarer: 940,
      utvalgteKommentarer: ["25 er snart 😬", "hvor kommer 90 % fra?"],
      bakgrunn: ["#0f172a", "#991b1b"],
      teknikker: [
        {
          id: "falsk-hast",
          hvor: "«Klokka tikker» og «start i dag – ikke i morgen» skaper et press om å handle nå."
        },
        {
          id: "sterke-folelser",
          hvor: "«Er du en av dem?» spiller på frykten for å være en taper. Tallet 90 % har ingen kilde."
        }
      ],
      snakkOm: "Hvordan føles det å bli spurt «er du en av dem?»?"
    },
    {
      id: "sigma",
      fase: 2,
      intensitet: 1,
      konto: "@sigma.memes.no",
      skjermtekst: "Han: blir dumpet\nOgså han: åpner Excel og legger en 10-årsplan 🗿",
      bildetekst: "Følelser er for de svake 😂 (bare tull da)",
      hashtags: ["sigma", "meme", "grindset"],
      likes: 41200,
      kommentarer: 1530,
      utvalgteKommentarer: ["🗿🗿🗿", "det verste er at dette er meg"],
      bakgrunn: ["#18181b", "#3f3f46"],
      teknikker: [
        {
          id: "ironi-skjold",
          hvor: "«Følelser er for de svake» pakkes inn i en vits og «bare tull da», så budskapet er vanskelig å protestere mot."
        }
      ],
      snakkOm: "Når er en meme bare en vits, og når sier den noe mer?"
    },
    {
      id: "skolen",
      fase: 3,
      intensitet: 2,
      konto: "@vaakne.gutter",
      skjermtekst: "Det skolen ALDRI kommer til å lære deg 🤫",
      bildetekst: "De vil ha deg lydig og stille. Derfor er det ingen lærer som forteller deg dette. Del 1 av 5 – følg for resten.",
      hashtags: ["sannheten", "våkne", "skolen"],
      likes: 58300,
      kommentarer: 2210,
      utvalgteKommentarer: ["hvorfor har ingen sagt dette før?", "lærerne mine er sånn fr"],
      bakgrunn: ["#0c0a09", "#57534e"],
      teknikker: [
        {
          id: "skjuler-sannheten",
          hvor: "«Det skolen aldri kommer til å lære deg» og «ingen lærer forteller deg dette» antyder at noen holder noe skjult med vilje."
        }
      ],
      snakkOm: "Hvorfor er «det ingen vil fortelle deg» så fristende å klikke på?"
    },
    {
      id: "pasta",
      fase: 3,
      intensitet: 0,
      kontroll: true,
      konto: "@studentkjokkenet",
      skjermtekst: "Pasta på 10 minutter, under 30 kr 🍝",
      bildetekst: "Hvitløk, olivenolje, chili og litt parmesan. Det er det. Oppskrift i kommentarene.",
      hashtags: ["mat", "student", "billigmat"],
      likes: 9400,
      kommentarer: 210,
      utvalgteKommentarer: ["lagde den i går, 10/10", "funker det med cheddar også?"],
      bakgrunn: ["#7c2d12", "#a16207"],
      teknikker: [],
      snakkOm: "Hvorfor tror dere et matinnlegg dukker opp midt i alt det andre?",
      notat: "Feeder blander ofte inn helt vanlig innhold. Ikke alt i feeden prøver å påvirke deg."
    },
    {
      id: "skylda",
      fase: 3,
      intensitet: 2,
      konto: "@sannhetenomgutta",
      skjermtekst: "Hvorfor sliter unge menn?\n\nSvaret er enkelt: DE har ødelagt alt for oss.",
      bildetekst: "Jobber, boliger, respekt – alt er tatt fra oss. Og de ler av deg mens det skjer. Er du ikke sint, følger du ikke med.",
      hashtags: ["ungemenn", "sannheten", "nokernok"],
      likes: 74100,
      kommentarer: 3880,
      utvalgteKommentarer: ["endelig noen som sier det", "hvem er «de» egentlig?"],
      bakgrunn: ["#1c1917", "#991b1b"],
      teknikker: [
        {
          id: "syndebukk",
          hvor: "Sammensatte problemer som jobber og boligpriser forklares med at én gruppe – «de» – har skylden."
        },
        {
          id: "sterke-folelser",
          hvor: "«De ler av deg» og «er du ikke sint, følger du ikke med» skal vekke sinne og ydmykelse."
        }
      ],
      snakkOm: "Hva skjer når et stort problem får én enkel forklaring?"
    },
    {
      id: "bussen",
      fase: 3,
      intensitet: 0,
      kontroll: true,
      konto: "@minmening.vgs",
      skjermtekst: "Mener: Bussen til skolen burde vært gratis for alle elever.",
      bildetekst:
        "Mange bruker over 1000 kr i måneden på buss. Motargumentet er at det koster kommunen mye. " +
        "Jeg mener likevel det er verdt det. Enig eller uenig?",
      hashtags: ["mening", "kollektiv", "skole"],
      likes: 2300,
      kommentarer: 410,
      utvalgteKommentarer: ["uenig, heller billigere enn gratis", "enig! spesielt for de som bor langt unna"],
      bakgrunn: ["#1e3a8a", "#155e75"],
      teknikker: [],
      snakkOm: "Hva er forskjellen på å ha en sterk mening og å manipulere?",
      notat:
        "Dette innlegget tar et tydelig standpunkt, men bruker ingen av teknikkene. " +
        "Det nevner motargumentet og inviterer til uenighet. Å mene noe er ikke manipulasjon."
    },
    {
      id: "oss-eller-dem",
      fase: 4,
      intensitet: 3,
      konto: "@frontlinja.memes",
      skjermtekst: "Det er oss eller dem.\nVelg side 🫵\n\n(det er bare en meme, chill 😂)",
      bildetekst:
        "Alt som har gått galt de siste årene? Takk til de der. " +
        "Hvis du blir sur av en meme, er du sannsynligvis en av dem.",
      hashtags: ["memes", "velgside", "ossellerdem"],
      likes: 112000,
      kommentarer: 6400,
      utvalgteKommentarer: ["😂😂 men ekte", "kjenner noen som ville blitt sure av dette"],
      bakgrunn: ["#09090b", "#7f1d1d"],
      teknikker: [
        {
          id: "oss-mot-dem",
          hvor: "«Det er oss eller dem» og «velg side» deler verden i to leirer, der den andre siden er en fiende."
        },
        {
          id: "ironi-skjold",
          hvor: "«Det er bare en meme, chill» gjør det vanskelig å kritisere – og den som reagerer, blir stemplet som «en av dem»."
        },
        {
          id: "syndebukk",
          hvor: "«Alt som har gått galt? Takk til de der» gir en vag gruppe skylden uten å si hva de har gjort."
        }
      ],
      snakkOm: "Hvorfor tror dere det er vanskelig å si imot en meme?"
    },
    {
      id: "del-for-slettet",
      fase: 4,
      intensitet: 3,
      konto: "@skjult.sannhet",
      skjermtekst: "⚠️ DEL FØR DETTE BLIR SLETTET ⚠️",
      bildetekst:
        "Mediene vil aldri vise deg dette. De vet at hvis nok av oss ser det, er det over for dem. " +
        "Du har kanskje bare timer på deg. Vi eller dem – du bestemmer.",
      hashtags: ["delnå", "sannheten", "våkneopp"],
      likes: 168000,
      kommentarer: 9900,
      utvalgteKommentarer: ["delt ✅", "hva er det egentlig som er i videoen?"],
      bakgrunn: ["#000000", "#7f1d1d"],
      teknikker: [
        {
          id: "falsk-hast",
          hvor: "«Del før dette blir slettet» og «bare timer på deg» skaper panikk og presser deg til å dele uten å sjekke."
        },
        {
          id: "skjuler-sannheten",
          hvor: "«Mediene vil aldri vise deg dette» hevder at noe holdes skjult – men innlegget sier aldri hva det er."
        },
        {
          id: "oss-mot-dem",
          hvor: "«Hvis nok av oss ser det, er det over for dem» og «vi eller dem» deler verden i to fiendtlige leirer."
        }
      ],
      snakkOm: "Hva gjør dere når noe sier at dere må dele nå?"
    }
  ],

  // Vises nederst i feedreisen, som utgangspunkt for samtalen etterpå.
  refleksjon: [
    "Kjenner du igjen en sånn utvikling fra feeder folk på din alder ser?",
    "Hvilket triks var vanskeligst å se? Hvorfor tror du det?",
    "Føltes radaren nyttig – eller som en pekefinger?"
  ]
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: PASS, 31 tester, 0 feilet

- [ ] **Step 5: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/content.js manipulasjonsradar/tester/innhold.test.js
git commit -m "Manipulasjonsradar: første utkast til innhold (12 fiktive innlegg)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Sideskall, utseende, start, intro og feed

**Files:**
- Create: `index.html`, `tailwind.css`, `bygg-css.sh`, `app.js`, `ikoner/ikon.svg`
- Create (kopi): `fonter/archivo.woff2`, `fonter/LISENS-OFL.txt` fra `../fonter/`
- Generated: `style.css` (fra `./bygg-css.sh`, committes slik som i «Trykk pause»)
- Test: `tester/sider.test.js`

**Interfaces:**
- Consumes: `window.CONTENT` (Task 3), `Radar.valider`, `Radar.fyllInn`, `Radar.kortTall`.
- Produces for Task 5–7 (i `app.js`, inne i IIFE-en):
  - `tilstand = { modus, aktivt, svar, utkast, apentInnlegg, apnetFra }`
  - `$(id)`, `lagElement(tag, tekst, klasse)`, `skjultTekst(tekst)`, `finnTeknikk(id)`, `visSkjerm(id)`, `settModus(modus)`, `startFeed()`, `gaTil(indeks, myk)`
  - Funksjonen `kobleKnapper()`, som senere tasks legger linjer inn i
  - Kommentarlinjene `// ---------- Radaren ----------`, `// ---------- Feedreisen ----------` og `// ---------- Tastatur ----------` som innsettingspunkter
  - DOM: `#feed` (ol), radarknapper med `data-skann="<innlegg-id>"`, sluttkortknapp med `data-handling="reise"`, `<dialog id="radar">` og `#skjerm-reise` med barn som beskrevet i `index.html`
  - `<html data-modus="alene|sammen">` og klassen `radar-apen` på `<html>` mens radaren er åpen

- [ ] **Step 1: Write the failing test**

Opprett `tester/sider.test.js`:

```js
"use strict";

// Sjekker at alle tekstnøkler som index.html og app.js bruker, finnes i content.js.
// Fanger skrivefeil som ellers bare vises som «[mangler tekst: …]» på siden.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rot = path.join(__dirname, "..");
const les = (fil) => fs.readFileSync(path.join(rot, fil), "utf8");

const kontekst = { window: {} };
vm.runInNewContext(les("content.js"), kontekst);
const T = kontekst.window.CONTENT.tekster;

function hent(sti) {
  return sti.split(".").reduce((obj, n) => (obj ? obj[n] : undefined), T);
}

test("alle data-tekst og data-etikett i index.html finnes", () => {
  const html = les("index.html");
  const stier = [...html.matchAll(/data-(?:tekst|etikett)="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(stier.length > 10, "fant for få tekstnøkler i index.html");
  stier.forEach((sti) => assert.equal(typeof hent(sti), "string", "mangler tekst: " + sti));
});

test("alle T.del.nokkel i app.js finnes", () => {
  const js = les("app.js");
  const stier = [...js.matchAll(/\bT\.([a-zA-Z]+)\.([a-zA-Z]+)/g)].map((m) => m[1] + "." + m[2]);
  assert.ok(stier.length > 5, "fant for få tekstnøkler i app.js");
  stier.forEach((sti) => assert.notEqual(hent(sti), undefined, "mangler tekst: " + sti));
});

test("index.html laster filene i riktig rekkefølge", () => {
  const html = les("index.html");
  const content = html.indexOf('src="content.js"');
  const radar = html.indexOf('src="radar.js"');
  const app = html.indexOf('src="app.js"');
  assert.ok(content > 0 && radar > content && app > radar, "rekkefølgen må være content.js, radar.js, app.js");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: FAIL med `ENOENT: no such file or directory, open '.../index.html'`

- [ ] **Step 3: Copy the font and create the icon and build script**

```bash
cd /Users/vera/INN527/manipulasjonsradar
mkdir -p fonter ikoner
cp ../fonter/archivo.woff2 ../fonter/LISENS-OFL.txt fonter/
```

Opprett `ikoner/ikon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0b0d12"/>
  <g fill="none" stroke="#3cf0b4" stroke-width="20">
    <circle cx="256" cy="256" r="168" opacity=".35"/>
    <circle cx="256" cy="256" r="108" opacity=".6"/>
  </g>
  <path d="M256 256 L256 88 A168 168 0 0 1 401.5 172 Z" fill="#3cf0b4" opacity=".3"/>
  <line x1="256" y1="256" x2="256" y2="88" stroke="#3cf0b4" stroke-width="20" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="26" fill="#3cf0b4"/>
  <circle cx="338" cy="190" r="22" fill="#ffb547"/>
</svg>
```

Opprett `bygg-css.sh` og gjør den kjørbar (`chmod +x bygg-css.sh`). Den bruker samme Tailwind-program som «Trykk pause», i `INN527/.verktoy/`:

```sh
#!/bin/sh
# Bygger style.css fra tailwind.css med Tailwinds frittstående program (ingen Node/npm).
# Programmet deles med «Trykk pause» og ligger i INN527/.verktoy/ (publiseres ikke).
# Første gang lastes det ned.
#
#   ./bygg-css.sh          bygg én gang
#   ./bygg-css.sh --watch  bygg på nytt automatisk hver gang du lagrer en fil

set -e
cd "$(dirname "$0")"

VERSJON="v4.3.3"
PROGRAM="../.verktoy/tailwindcss-$VERSJON"

if [ ! -x "$PROGRAM" ]; then
  case "$(uname -s)-$(uname -m)" in
    Darwin-arm64)  FIL="tailwindcss-macos-arm64" ;;
    Darwin-x86_64) FIL="tailwindcss-macos-x64" ;;
    Linux-aarch64) FIL="tailwindcss-linux-arm64" ;;
    Linux-x86_64)  FIL="tailwindcss-linux-x64" ;;
    *) echo "Ukjent maskin: $(uname -s)-$(uname -m). Se README.md."; exit 1 ;;
  esac
  echo "Laster ned Tailwind $VERSJON (bare første gang) ..."
  mkdir -p ../.verktoy
  curl -fsSL -o "$PROGRAM" "https://github.com/tailwindlabs/tailwindcss/releases/download/$VERSJON/$FIL"
  chmod +x "$PROGRAM"
fi

"$PROGRAM" --input tailwind.css --output style.css --minify "$@"
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="nb" data-modus="alene">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="referrer" content="no-referrer">
  <meta name="description" content="En fiktiv feed der du kan se hvilke manipulasjonsteknikker innlegg bruker. Prototype for et living lab-prosjekt.">
  <meta name="theme-color" content="#0b0d12">
  <meta name="color-scheme" content="dark">
  <title>Manipulasjonsradar</title>
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="ikoner/ikon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="ikoner/ikon-maskerbar-512.png">
  <link rel="stylesheet" href="style.css">
</head>
<body class="min-h-dvh bg-natt font-sans text-lg leading-relaxed text-tekst antialiased">
  <!--
    Alle synlige tekster hentes fra content.js (under «tekster»).
    data-tekst="start.tittel" betyr: sett inn CONTENT.tekster.start.tittel her.
    data-etikett="radar.lukk" gjør det samme for aria-label (teksten skjermlesere leser).
    Bare én <section class="skjerm"> vises om gangen.
    Klassene (f.eks. "text-3xl") er Tailwind. Kjør ./bygg-css.sh etter at du endrer dem.
  -->
  <noscript><p class="p-5">Denne siden trenger JavaScript.</p></noscript>

  <!-- Vises hvis content.js har en skrivefeil og ikke kan leses.
       Teksten står her fordi den da ikke kan hentes fra content.js. -->
  <section id="skjerm-innholdsfeil" class="skjerm side" hidden>
    <h1 tabindex="-1" class="display mb-4 text-4xl">Innholdsfila har en feil</h1>
    <p class="text-dempet">Siden klarte ikke å lese <code>content.js</code>. Som regel mangler det et komma eller et anførselstegn. Se README.md under «Hvis siden blir blank eller viser en feil».</p>
  </section>

  <!-- Vises hvis content.js kan leses, men noe i innholdet ikke stemmer. -->
  <section id="skjerm-feil" class="skjerm side" hidden>
    <h1 tabindex="-1" class="display mb-4 text-4xl">Noe i innholdet stemmer ikke</h1>
    <p class="mb-6 text-dempet">Rett opp dette i <code>content.js</code> og last siden på nytt:</p>
    <ul id="feilliste" class="list-disc space-y-2 pl-6"></ul>
  </section>

  <!-- 1. Start og valg av modus -->
  <section id="skjerm-start" class="skjerm side flex min-h-dvh flex-col justify-between gap-10" hidden>
    <div class="pt-6">
      <img src="ikoner/ikon.svg" alt="" class="mb-8 size-20 rounded-2xl">
      <h1 tabindex="-1" class="display mb-6 text-5xl" data-tekst="start.tittel"></h1>
      <p class="mb-4 text-xl" data-tekst="start.tekst"></p>
      <p class="text-dempet" data-tekst="start.ramme"></p>
    </div>
    <div class="space-y-3">
      <p class="font-bold" data-tekst="start.velg"></p>
      <button type="button" id="velg-alene" class="knapp-modus">
        <span class="block text-xl font-bold" data-tekst="start.alene"></span>
        <span class="block text-base text-dempet" data-tekst="start.aleneBeskrivelse"></span>
      </button>
      <button type="button" id="velg-sammen" class="knapp-modus">
        <span class="block text-xl font-bold" data-tekst="start.sammen"></span>
        <span class="block text-base text-dempet" data-tekst="start.sammenBeskrivelse"></span>
      </button>
      <p class="pt-2 text-base text-dempet" data-tekst="start.personvern"></p>
    </div>
  </section>

  <!-- 2. De seks teknikkene (kan hoppes over) -->
  <section id="skjerm-intro" class="skjerm side" hidden>
    <div class="mb-4 flex justify-end">
      <button type="button" id="intro-hopp" class="knapp-tekst" data-tekst="intro.hopp"></button>
    </div>
    <h1 tabindex="-1" class="display mb-4 text-4xl" data-tekst="intro.tittel"></h1>
    <p class="mb-8 text-dempet" data-tekst="intro.tekst"></p>
    <ul id="intro-liste" class="mb-10 space-y-4"></ul>
    <button type="button" id="intro-start" class="knapp-hoved" data-tekst="intro.start"></button>
  </section>

  <!-- 3. Feeden: ett kort per innlegg, pluss et sluttkort. Kortene lages av app.js. -->
  <section id="skjerm-feed" class="skjerm relative" hidden>
    <h1 tabindex="-1" class="sr-only" data-tekst="feed.tittel"></h1>
    <div class="feed-topp">
      <span class="kort-merke" data-tekst="feed.fiktiv"></span>
      <p id="fremdrift" class="kort-merke tabular-nums"></p>
    </div>
    <ol id="feed" class="feed"></ol>
  </section>

  <!-- Radarpanelet: åpnes fra «Skann med radaren» på hvert kort. -->
  <dialog id="radar" class="radar" aria-labelledby="radar-tittel">
    <div class="radar-innhold">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <p id="radar-konto" class="text-base text-dempet"></p>
          <h2 id="radar-tittel" tabindex="-1" class="display text-3xl"></h2>
        </div>
        <button type="button" id="radar-lukk" class="knapp-ikon" data-etikett="radar.lukk"><span aria-hidden="true">✕</span></button>
      </div>

      <div id="radar-snakk" class="mb-5 rounded-2xl bg-flate-lys p-4" hidden>
        <p class="text-sm font-bold uppercase tracking-wide text-oversett" data-tekst="radar.snakkOm"></p>
        <p id="radar-snakk-tekst" class="mt-1 text-xl font-semibold"></p>
      </div>

      <div id="radar-gjett">
        <p class="mb-4 text-dempet" data-tekst="radar.hjelp"></p>
        <ul id="radar-valg" class="mb-6 space-y-2"></ul>
        <button type="button" id="radar-vis" class="knapp-hoved" data-tekst="radar.vis" disabled></button>
      </div>

      <div id="radar-resultat" hidden>
        <div id="radar-funn" class="mb-6 space-y-3"></div>
        <p id="radar-notat" class="mb-6 rounded-2xl bg-flate-lys p-4" hidden></p>
        <button type="button" id="radar-tilbake" class="knapp-hoved" data-tekst="radar.tilbake"></button>
      </div>
    </div>
  </dialog>

  <!-- 4. Feedreisen -->
  <section id="skjerm-reise" class="skjerm side" hidden>
    <h1 tabindex="-1" class="display mb-4 text-5xl" data-tekst="reise.tittel"></h1>
    <p class="mb-10 text-xl text-dempet" data-tekst="reise.tekst"></p>

    <h2 class="mb-2 text-2xl font-bold" data-tekst="reise.tidslinjeTittel"></h2>
    <p class="mb-4 text-base text-dempet" data-tekst="reise.tidslinjeTekst"></p>
    <ol id="reise-tidslinje" class="mb-3 flex h-40 items-end gap-1.5"></ol>
    <p class="mb-12 flex items-center gap-2 text-sm text-dempet">
      <span class="soyle soyle-kontroll inline-block h-3 w-5 rounded-sm" aria-hidden="true"></span>
      <span data-tekst="reise.kontrollForklaring"></span>
    </p>

    <h2 class="mb-2 text-2xl font-bold" data-tekst="reise.kartTittel"></h2>
    <p class="mb-4 text-base text-dempet" data-tekst="reise.kartTekst"></p>
    <div class="mb-12 overflow-x-auto">
      <table id="reise-kart" class="w-full border-separate border-spacing-1 text-sm"></table>
    </div>

    <h2 id="reise-treff-tittel" class="mb-4 text-2xl font-bold"></h2>
    <ul id="reise-treff" class="mb-3 space-y-3"></ul>
    <p id="reise-ikke-skannet" class="mb-12 text-base text-dempet"></p>

    <h2 class="mb-4 text-2xl font-bold" data-tekst="reise.refleksjonTittel"></h2>
    <ul id="reise-refleksjon" class="mb-12 space-y-3"></ul>

    <div class="space-y-3">
      <button type="button" id="reise-igjen" class="knapp-hoved" data-tekst="reise.igjen"></button>
      <button type="button" id="reise-ny" class="knapp-tekst w-full" data-tekst="reise.nyStart"></button>
    </div>
  </section>

  <script src="content.js"></script>
  <script src="radar.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create `tailwind.css` and build**

```css
/*
 * UTSEENDE – kildefil for Tailwind
 * --------------------------------
 * Ikke rediger style.css direkte. Den lages fra denne fila med:
 *   ./bygg-css.sh
 *
 * Det meste av utseendet står som Tailwind-klasser i index.html og app.js.
 * Her ligger farger, skrift, feedkortene, radarpanelet og søylene i feedreisen.
 */

@import "tailwindcss" source(none);
@source "./index.html";
@source "./app.js";

/* Skrifttypen ligger i prosjektet, så ingenting hentes fra andre nettsteder. */
@font-face {
  font-family: "Archivo";
  src: url("fonter/archivo.woff2") format("woff2");
  font-weight: 100 900;
  font-stretch: 62% 125%;
  font-display: swap;
}

@theme {
  --font-sans: "Archivo", system-ui, -apple-system, "Segoe UI", sans-serif;

  --color-natt: #0b0d12;      /* bakgrunn */
  --color-flate: #171a22;     /* bokser og panel */
  --color-flate-lys: #222633;
  --color-kant: #3a4052;
  --color-tekst: #f3f4f7;
  --color-dempet: #a6adbd;
  --color-radar: #3cf0b4;     /* radaren, «du så den», hovedknapper, fokus */
  --color-oversett: #ffb547;  /* «vanskelig å se» */
  --color-press: #ff7a59;     /* søylene i feedreisen */
}

:root {
  color-scheme: dark;
  --radar-bredde: min(34rem, 45vw); /* bredden på radarpanelet i Sammen-modus */
}

@layer base {
  html {
    background: var(--color-natt);
    color: var(--color-tekst);
    -webkit-tap-highlight-color: transparent;
  }

  /* Sammen-modus: alt blir større, så det kan leses fra en felles skjerm. */
  html[data-modus="sammen"] {
    font-size: 125%;
  }

  :focus-visible {
    outline: 3px solid var(--color-radar);
    outline-offset: 3px;
  }

  /* Overskrifter får fokus av skriptet (for skjermlesere), men trenger ingen ring. */
  [tabindex="-1"]:focus {
    outline: none;
  }

  ::selection {
    background: var(--color-radar);
    color: var(--color-natt);
  }
}

@layer components {
  .display {
    font-stretch: 125%;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }

  /* Vanlige tekstskjermer (start, intro, feedreise) */
  .side {
    @apply mx-auto max-w-xl px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))];
  }
  html[data-modus="sammen"] .side {
    max-width: 60rem;
  }

  /* ---------- Knapper ---------- */

  .knapp-hoved {
    @apply block w-full min-h-14 rounded-2xl bg-radar px-6 py-4 text-lg font-bold text-natt;
    @apply cursor-pointer transition-transform active:scale-[0.98];
  }
  .knapp-hoved:disabled {
    @apply cursor-not-allowed bg-kant text-dempet active:scale-100;
  }

  .knapp-modus {
    @apply block w-full min-h-16 rounded-2xl border-2 border-kant bg-flate px-5 py-4 text-left;
    @apply cursor-pointer transition-colors hover:border-radar;
  }

  .knapp-tekst {
    @apply min-h-12 cursor-pointer px-1 font-semibold text-dempet underline underline-offset-4 hover:text-tekst;
  }

  .knapp-ikon {
    @apply grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-flate-lys text-xl;
  }

  /* ---------- Feeden ---------- */

  .feed {
    height: 100dvh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    overscroll-behavior: contain;
  }
  /* Sammen-modus: kortet flytter seg til venstre mens radarpanelet er åpent til høyre. */
  html.radar-apen[data-modus="sammen"] .feed {
    padding-right: var(--radar-bredde);
  }

  .feed-topp {
    @apply pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))];
  }

  .kort-merke {
    @apply rounded-full bg-natt/70 px-3 py-1 text-sm font-semibold;
  }

  .kort {
    position: relative;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 1rem;
    height: 100dvh;
    overflow: hidden;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    padding: max(4rem, env(safe-area-inset-top)) 1.25rem max(1.25rem, env(safe-area-inset-bottom));
    background: linear-gradient(165deg, var(--fra), var(--til));
    text-shadow: 0 1px 3px rgb(0 0 0 / 0.5);
  }
  /* Mørkere nederst, så bildeteksten alltid er lett å lese. */
  .kort::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent 45%, rgb(0 0 0 / 0.65));
  }
  .kort > * {
    position: relative;
    z-index: 1;
  }

  .kort-skjermtekst {
    align-self: center;
    white-space: pre-line;
    overflow-wrap: anywhere;
    font-size: clamp(1.75rem, 8vw, 3.25rem);
  }
  html[data-modus="sammen"] .kort-skjermtekst {
    font-size: clamp(2rem, 4.5vw, 4rem);
  }

  .kort-tall {
    @apply flex shrink-0 gap-4 text-base font-semibold;
  }

  .knapp-radar {
    @apply mt-4 flex w-full min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-radar bg-natt/80 px-5 py-3 text-lg font-bold text-radar;
    text-shadow: none;
  }
  .knapp-radar.er-skannet {
    @apply bg-radar text-natt;
  }

  .kort-slutt {
    background: var(--color-natt);
    text-shadow: none;
  }
  .kort-slutt::after {
    display: none;
  }

  /* ---------- Radarpanelet ---------- */

  /* Mobil: et ark som kommer opp nedenfra. */
  .radar {
    margin: auto 0 0;
    width: 100%;
    max-width: 100%;
    max-height: 88dvh;
    overflow-y: auto;
    border: 0;
    padding: 0;
    border-radius: 1.5rem 1.5rem 0 0;
    background: var(--color-flate);
    color: var(--color-tekst);
  }
  .radar::backdrop {
    background: rgb(0 0 0 / 0.6);
  }
  .radar-innhold {
    padding: 1.25rem 1.25rem max(1.5rem, env(safe-area-inset-bottom));
  }
  @media (min-width: 40rem) {
    .radar {
      margin: auto;
      max-width: 36rem;
      border-radius: 1.5rem;
    }
  }
  /* Sammen-modus: et panel til høyre, og kortet synes ved siden av. */
  html[data-modus="sammen"] .radar {
    margin: 0 0 0 auto;
    width: var(--radar-bredde);
    max-width: var(--radar-bredde);
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
  html[data-modus="sammen"] .radar::backdrop {
    background: transparent;
  }

  .knapp-valg {
    @apply flex w-full min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 border-kant bg-natt px-4 py-3 text-left transition-colors hover:border-dempet;
  }
  .knapp-valg::before {
    content: "";
    @apply size-6 shrink-0 rounded-md border-2 border-dempet;
  }
  .knapp-valg[aria-pressed="true"] {
    @apply border-radar;
    background: color-mix(in srgb, var(--color-radar) 12%, var(--color-natt));
  }
  .knapp-valg[aria-pressed="true"]::before {
    content: "✓";          /* reserve for eldre nettlesere */
    content: "✓" / "";     /* skjermlesere hopper over haken */
    @apply grid place-items-center border-radar bg-radar text-base font-bold text-natt;
  }

  .funn {
    @apply rounded-2xl border-2 bg-natt p-4;
  }
  .funn[data-status="funnet"] {
    @apply border-radar;
  }
  .funn[data-status="oversett"] {
    @apply border-oversett;
  }
  .funn[data-status="ikkeHer"] {
    @apply border-dashed border-kant;
  }
  .funn-status {
    @apply mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide;
  }
  .funn[data-status="funnet"] .funn-status {
    @apply text-radar;
  }
  .funn[data-status="oversett"] .funn-status {
    @apply text-oversett;
  }
  .funn[data-status="ikkeHer"] .funn-status {
    @apply text-dempet;
  }

  /* ---------- Feedreisen ---------- */

  .soyle {
    background: var(--color-press);
  }
  .soyle[data-niva="0"] {
    background: var(--color-kant);
  }
  .soyle[data-niva="1"] {
    background: color-mix(in srgb, var(--color-press) 55%, var(--color-natt));
  }
  .soyle[data-niva="2"] {
    background: color-mix(in srgb, var(--color-press) 78%, var(--color-natt));
  }
  .soyle.soyle-kontroll {
    background: repeating-linear-gradient(45deg, var(--color-dempet) 0 3px, transparent 3px 6px);
    border: 1px solid var(--color-dempet);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
    transition: none !important;
  }
}
```

Run: `cd /Users/vera/INN527/manipulasjonsradar && ./bygg-css.sh`
Expected: `Done in …ms` og en ny `style.css`

- [ ] **Step 6: Create `app.js`**

```js
/*
 * LOGIKKEN I MANIPULASJONSRADAR
 * -----------------------------
 * Alt eleven velger ligger bare i variabelen `tilstand` mens siden er åpen.
 * Ingenting lagres eller sendes noe sted. Laster du siden på nytt, starter alt på nytt.
 *
 * Utregningene (fasit og feedreisen) ligger i radar.js. Alt innhold ligger i content.js.
 * Klassene i denne fila (f.eks. "text-dempet") er Tailwind. Kjør ./bygg-css.sh hvis du legger til nye.
 */

(function () {
  "use strict";

  var C = window.CONTENT;
  var R = window.Radar;
  var T; // = C.tekster, settes når innholdet er sjekket

  var tilstand;

  function nullstill(modus) {
    tilstand = {
      modus: modus || "alene", // "alene" (egen mobil) eller "sammen" (felles skjerm)
      aktivt: 0,               // hvilket kort som vises i feeden (0 = første)
      svar: {},                // innlegg-id → gjetning, f.eks. { ingen: false, teknikker: ["falsk-hast"] }
      utkast: null,            // gjetningen i radarpanelet før «Vis radaren»
      apentInnlegg: null,      // innlegget radarpanelet viser
      apnetFra: null           // knappen som åpnet radarpanelet (får fokus tilbake)
    };
  }

  // ---------- Hjelpefunksjoner ----------

  function $(id) {
    return document.getElementById(id);
  }

  // Henter en tekst fra CONTENT.tekster med en sti som "start.tittel".
  function hentTekst(sti) {
    return sti.split(".").reduce(function (obj, nokkel) {
      return obj ? obj[nokkel] : undefined;
    }, T);
  }

  // Fyller inn alle elementer som har data-tekst="..." eller data-etikett="...".
  function fyllInnTekster() {
    document.querySelectorAll("[data-tekst]").forEach(function (el) {
      var tekst = hentTekst(el.getAttribute("data-tekst"));
      el.textContent = tekst !== undefined ? tekst : "[mangler tekst: " + el.getAttribute("data-tekst") + "]";
    });
    document.querySelectorAll("[data-etikett]").forEach(function (el) {
      el.setAttribute("aria-label", hentTekst(el.getAttribute("data-etikett")) || "");
    });
  }

  function lagElement(tag, tekst, klasse) {
    var el = document.createElement(tag);
    if (tekst) el.textContent = tekst;
    if (klasse) el.className = klasse;
    return el;
  }

  // Tekst som bare skjermlesere leser.
  function skjultTekst(tekst) {
    return lagElement("span", tekst, "sr-only");
  }

  function finnTeknikk(id) {
    return C.teknikker.filter(function (t) { return t.id === id; })[0];
  }

  function finnInnlegg(id) {
    return C.innlegg.filter(function (p) { return p.id === id; })[0];
  }

  // Viser én skjerm, skjuler resten, og flytter fokus til overskriften
  // slik at skjermlesere leser opp den nye skjermen.
  function visSkjerm(id) {
    document.querySelectorAll(".skjerm").forEach(function (s) {
      s.hidden = s.id !== id;
    });
    window.scrollTo(0, 0);
    var overskrift = $(id).querySelector("h1");
    if (overskrift) overskrift.focus({ preventScroll: true });
  }

  // Ny runde: tømmer alle svar og lager feeden på nytt.
  function settModus(modus) {
    nullstill(modus);
    document.documentElement.setAttribute("data-modus", modus);
    lagFeed();
  }

  // ---------- Feil i innholdet ----------

  function visFeil(feil) {
    var liste = $("feilliste");
    feil.forEach(function (f) {
      liste.appendChild(lagElement("li", f));
    });
    visSkjerm("skjerm-feil");
  }

  // ---------- Intro ----------

  function lagIntro() {
    var liste = $("intro-liste");
    liste.textContent = "";
    C.teknikker.forEach(function (t) {
      var li = lagElement("li", null, "rounded-2xl bg-flate p-5");
      li.appendChild(lagElement("h2", t.navn, "text-xl font-bold text-radar"));
      li.appendChild(lagElement("p", t.kort, "mt-1 font-semibold"));
      li.appendChild(lagElement("p", t.forklaring, "mt-2 text-base text-dempet"));
      liste.appendChild(li);
    });
  }

  // ---------- Feeden ----------

  function lagFeed() {
    var liste = $("feed");
    liste.textContent = "";
    C.innlegg.forEach(function (innlegg, i) {
      liste.appendChild(lagKort(innlegg, i));
    });
    liste.appendChild(lagSluttkort());
    folgMedPaKort();
  }

  function lagKort(innlegg, i) {
    var kort = lagElement("li", null, "kort");
    kort.setAttribute("data-indeks", i);
    kort.setAttribute("aria-label", R.fyllInn(T.feed.kortEtikett, { nr: i + 1, totalt: C.innlegg.length }));
    kort.style.setProperty("--fra", innlegg.bakgrunn[0]);
    kort.style.setProperty("--til", innlegg.bakgrunn[1]);

    kort.appendChild(lagElement("p", innlegg.skjermtekst, "kort-skjermtekst display"));

    var bunn = lagElement("div", null, "space-y-1");

    var topp = lagElement("div", null, "flex items-center justify-between gap-3");
    topp.appendChild(lagElement("p", innlegg.konto, "font-bold"));
    var tall = lagElement("p", null, "kort-tall");
    tall.appendChild(lagTall("♥", innlegg.likes, T.feed.likes));
    tall.appendChild(lagTall("💬", innlegg.kommentarer, T.feed.kommentarer));
    topp.appendChild(tall);
    bunn.appendChild(topp);

    bunn.appendChild(lagElement("p", innlegg.bildetekst, "text-base"));
    bunn.appendChild(lagElement("p", innlegg.hashtags.map(function (h) { return "#" + h; }).join(" "), "text-base font-semibold text-tekst/80"));

    if (innlegg.utvalgteKommentarer.length) {
      var kommentarer = lagElement("ul", null, "mt-2 space-y-0.5 border-l-2 border-tekst/40 pl-3 text-sm text-tekst/85");
      kommentarer.setAttribute("aria-label", T.feed.utvalgte);
      innlegg.utvalgteKommentarer.slice(0, 3).forEach(function (k) {
        kommentarer.appendChild(lagElement("li", k));
      });
      bunn.appendChild(kommentarer);
    }

    var knapp = lagElement("button", T.feed.skann, "knapp-radar");
    knapp.type = "button";
    knapp.setAttribute("data-skann", innlegg.id);
    bunn.appendChild(knapp);

    kort.appendChild(bunn);
    return kort;
  }

  // «♥ 1,8k» på skjermen, «1840 likes» for skjermlesere.
  function lagTall(ikon, antall, mal) {
    var span = lagElement("span", null, "flex items-center gap-1");
    var symbol = lagElement("span", ikon);
    symbol.setAttribute("aria-hidden", "true");
    var synlig = lagElement("span", R.kortTall(antall));
    synlig.setAttribute("aria-hidden", "true");
    span.appendChild(symbol);
    span.appendChild(synlig);
    span.appendChild(skjultTekst(R.fyllInn(mal, { antall: antall })));
    return span;
  }

  function lagSluttkort() {
    var kort = lagElement("li", null, "kort kort-slutt");
    kort.setAttribute("data-indeks", C.innlegg.length);
    var innhold = lagElement("div", null, "self-center");
    innhold.appendChild(lagElement("h2", T.feed.sluttTittel, "display mb-4 text-4xl"));
    innhold.appendChild(lagElement("p", T.feed.sluttTekst, "mb-8 text-xl text-dempet"));
    var knapp = lagElement("button", T.feed.tilReisen, "knapp-hoved");
    knapp.type = "button";
    knapp.setAttribute("data-handling", "reise");
    innhold.appendChild(knapp);
    kort.appendChild(innhold);
    return kort;
  }

  // Oppdaterer «4 av 12» når et kort er mest synlig på skjermen.
  var kortObservator = null;

  function folgMedPaKort() {
    if (kortObservator) kortObservator.disconnect();
    if (!("IntersectionObserver" in window)) return;
    kortObservator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (!o.isIntersecting) return;
        tilstand.aktivt = Number(o.target.getAttribute("data-indeks"));
        oppdaterFremdrift();
      });
    }, { root: $("feed"), threshold: 0.6 });
    $("feed").querySelectorAll("[data-indeks]").forEach(function (k) {
      kortObservator.observe(k);
    });
  }

  function oppdaterFremdrift() {
    var totalt = C.innlegg.length;
    $("fremdrift").textContent = tilstand.aktivt < totalt
      ? R.fyllInn(T.feed.fremdrift, { nr: tilstand.aktivt + 1, totalt: totalt })
      : "";
  }

  // Blar til kort nr. i (0 = første). myk = animert, hvis brukeren ikke har slått av animasjoner.
  function gaTil(i, myk) {
    var kort = $("feed").querySelectorAll("[data-indeks]");
    i = Math.max(0, Math.min(kort.length - 1, i));
    tilstand.aktivt = i;
    var animert = myk && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    kort[i].scrollIntoView({ behavior: animert ? "smooth" : "auto", block: "start" });
    oppdaterFremdrift();
  }

  function startFeed() {
    visSkjerm("skjerm-feed");
    gaTil(0);
  }

  // ---------- Radaren ----------

  // ---------- Feedreisen ----------

  // ---------- Tastatur ----------

  // ---------- Oppstart ----------

  function kobleKnapper() {
    $("velg-alene").addEventListener("click", function () {
      settModus("alene");
      visSkjerm("skjerm-intro");
    });
    $("velg-sammen").addEventListener("click", function () {
      settModus("sammen");
      visSkjerm("skjerm-intro");
    });
    $("intro-hopp").addEventListener("click", startFeed);
    $("intro-start").addEventListener("click", startFeed);
  }

  function start() {
    // content.js eller radar.js kunne ikke leses (som regel en skrivefeil i content.js).
    if (!C || !R) {
      visSkjerm("skjerm-innholdsfeil");
      return;
    }
    var feil = R.valider(C);
    if (feil.length) {
      visFeil(feil);
      return;
    }
    T = C.tekster;
    fyllInnTekster();
    lagIntro();
    settModus("alene");
    kobleKnapper();
    visSkjerm("skjerm-start");
  }

  start();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js");
  }
})();
```

Kjør `./bygg-css.sh` på nytt, fordi `app.js` har nye klasser.

- [ ] **Step 7: Run tests**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: PASS, 34 tester, 0 feilet

- [ ] **Step 8: Check in the browser**

Start en server i bakgrunnen: `cd /Users/vera/INN527/manipulasjonsradar && python3 -m http.server 8123`. Bruk Chrome DevTools MCP (`new_page` → `http://localhost:8123/`, `emulate` eller `resize_page` til 375×667).

Sjekk:
1. Startskjermen viser tittel, ramme og to modusknapper. Ingen «[mangler tekst»-tekst.
2. Alene → intro med seks teknikker → «Start feeden» → første kort med «1 av 12» øverst.
3. Bla ned (scroll i `#feed`): kortene snapper ett om gangen, og telleren følger med. Siste kort er «Det var feeden.».
4. Kjør `evaluate_script` på hvert kort med 375×667 og 320×568:
   ```js
   () => {
     const feed = document.getElementById("feed");
     const res = [];
     feed.querySelectorAll("[data-indeks]").forEach((k) => {
       k.scrollIntoView();
       const knapp = k.querySelector("button");
       const r = knapp.getBoundingClientRect();
       res.push({ kort: k.dataset.indeks, synlig: r.bottom <= window.innerHeight && r.top >= 0 });
     });
     return { vannrett: document.documentElement.scrollWidth > document.documentElement.clientWidth, res };
   }
   ```
   Expected: `vannrett: false`, og `synlig: true` for alle kort. Hvis et kort ikke passer: reduser `clamp()` i `.kort-skjermtekst` eller vis bare to utvalgte kommentarer, og sjekk på nytt.
5. `list_console_messages`: ingen feil, bortsett fra 404 for `sw.js`, `manifest.webmanifest` og `ikoner/ikon-maskerbar-512.png`. Disse er forventet frem til Task 8.
6. Feilsider: legg midlertidig til `{ id: "x", hvor: "y" }` i `teknikker` på innlegget `trening`, last siden på nytt og se «Noe i innholdet stemmer ikke» med meldingen om teknikk «x». Bytt så ut `window.CONTENT = {` med `window.CONTENT = {,` og se «Innholdsfila har en feil». **Tilbakestill begge endringene** (`git diff manipulasjonsradar/content.js` skal være tom).

- [ ] **Step 9: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/index.html manipulasjonsradar/tailwind.css manipulasjonsradar/style.css manipulasjonsradar/bygg-css.sh manipulasjonsradar/app.js manipulasjonsradar/fonter manipulasjonsradar/ikoner/ikon.svg manipulasjonsradar/tester/sider.test.js
git commit -m "Manipulasjonsradar: sideskall, start, intro og bla-feed

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Radaren (gjett, så avsløring)

**Files:**
- Modify: `app.js`, under `// ---------- Radaren ----------` og inne i `kobleKnapper()`
- Generated: `style.css`

**Interfaces:**
- Consumes: fra Task 4: `tilstand`, `$`, `lagElement`, `finnTeknikk`, `finnInnlegg`, DOM-en i `<dialog id="radar">`, `[data-skann]`-knappene. Fra Task 2: `R.tomGjetning`, `R.veksleValg`, `R.kanVise`, `R.vurder`.
- Produces: `apneRadar(id, knapp)`, `lukkRadar()`. `tilstand.svar[id]` fylles når eleven trykker «Vis radaren». Et skannet innlegg får knappetekst `T.feed.skannet` og klassen `er-skannet`.

- [ ] **Step 1: Add the radar code**

Sett inn rett under linjen `  // ---------- Radaren ----------`:

```js

  // Ikonene står ved siden av teksten, så status aldri vises bare med farge.
  var IKON = { funnet: "◉", oversett: "◌", ikkeHer: "–" };

  function apneRadar(id, knapp) {
    var innlegg = finnInnlegg(id);
    tilstand.apentInnlegg = innlegg;
    tilstand.apnetFra = knapp;
    tilstand.utkast = R.tomGjetning();
    $("radar-konto").textContent = innlegg.konto;
    $("radar-snakk-tekst").textContent = innlegg.snakkOm;
    // Er innlegget allerede skannet, vises resultatet. Man gjetter bare én gang.
    if (tilstand.svar[innlegg.id]) visResultat();
    else visGjett();
    document.documentElement.classList.add("radar-apen");
    $("radar").showModal();
    $("radar-tittel").focus();
  }

  function lukkRadar() {
    $("radar").close();
  }

  // Kjøres uansett hvordan panelet lukkes (knapp, Esc eller trykk utenfor).
  function narRadarLukkes() {
    document.documentElement.classList.remove("radar-apen");
    tilstand.apentInnlegg = null;
    if (tilstand.apnetFra) tilstand.apnetFra.focus({ preventScroll: true });
    tilstand.apnetFra = null;
  }

  function visGjett() {
    $("radar-tittel").textContent = T.radar.sporsmal;
    $("radar-snakk").hidden = tilstand.modus !== "sammen";
    $("radar-gjett").hidden = false;
    $("radar-resultat").hidden = true;

    var liste = $("radar-valg");
    liste.textContent = "";
    C.teknikker.forEach(function (t) {
      liste.appendChild(lagValg(t.id, t.navn, t.kort));
    });
    liste.appendChild(lagValg("ingen", T.radar.ingen, null));
    oppdaterValg();
  }

  function lagValg(id, navn, kort) {
    var li = document.createElement("li");
    var knapp = lagElement("button", null, "knapp-valg");
    knapp.type = "button";
    knapp.setAttribute("data-valg", id);
    knapp.setAttribute("aria-pressed", "false");
    var tekst = lagElement("span", null, "block");
    tekst.appendChild(lagElement("span", navn, "block font-bold"));
    if (kort) tekst.appendChild(lagElement("span", kort, "block text-base text-dempet"));
    knapp.appendChild(tekst);
    knapp.addEventListener("click", function () {
      tilstand.utkast = R.veksleValg(tilstand.utkast, id);
      oppdaterValg();
    });
    li.appendChild(knapp);
    return li;
  }

  function oppdaterValg() {
    var g = tilstand.utkast;
    document.querySelectorAll("#radar-valg [data-valg]").forEach(function (knapp) {
      var valg = knapp.getAttribute("data-valg");
      var valgt = valg === "ingen" ? g.ingen : g.teknikker.indexOf(valg) !== -1;
      knapp.setAttribute("aria-pressed", String(valgt));
    });
    $("radar-vis").disabled = !R.kanVise(g);
  }

  function visRadar() {
    var innlegg = tilstand.apentInnlegg;
    tilstand.svar[innlegg.id] = tilstand.utkast;
    merkSomSkannet(innlegg.id);
    visResultat();
    $("radar-tittel").focus();
  }

  function merkSomSkannet(id) {
    var knapp = $("feed").querySelector('[data-skann="' + id + '"]');
    if (!knapp) return;
    knapp.textContent = T.feed.skannet;
    knapp.classList.add("er-skannet");
  }

  function visResultat() {
    var innlegg = tilstand.apentInnlegg;
    var vurdering = R.vurder(innlegg, tilstand.svar[innlegg.id]);
    $("radar-tittel").textContent = T.radar.resultatTittel;
    $("radar-snakk").hidden = true;
    $("radar-gjett").hidden = true;
    $("radar-resultat").hidden = false;

    var funn = $("radar-funn");
    funn.textContent = "";
    if (innlegg.teknikker.length === 0) {
      funn.appendChild(lagElement("p", vurdering.ingenRiktig ? T.radar.ingenRiktig : T.radar.ingenTeknikker, "rounded-2xl border-2 border-radar bg-natt p-4 font-bold"));
    }
    vurdering.funnet.forEach(function (id) { funn.appendChild(lagFunn("funnet", id, innlegg)); });
    vurdering.oversett.forEach(function (id) { funn.appendChild(lagFunn("oversett", id, innlegg)); });
    vurdering.ikkeHer.forEach(function (id) { funn.appendChild(lagFunn("ikkeHer", id, innlegg)); });

    var notat = $("radar-notat");
    notat.hidden = !innlegg.notat;
    notat.textContent = innlegg.notat || "";
  }

  function lagFunn(status, id, innlegg) {
    var teknikk = finnTeknikk(id);
    var iInnlegget = innlegg.teknikker.filter(function (t) { return t.id === id; })[0];

    var boks = lagElement("div", null, "funn");
    boks.setAttribute("data-status", status);

    var merke = lagElement("p", null, "funn-status");
    var ikon = lagElement("span", IKON[status]);
    ikon.setAttribute("aria-hidden", "true");
    merke.appendChild(ikon);
    merke.appendChild(document.createTextNode(T.radar[status]));
    boks.appendChild(merke);

    boks.appendChild(lagElement("h3", teknikk.navn, "text-xl font-bold"));
    if (iInnlegget) boks.appendChild(lagElement("p", iInnlegget.hvor, "mt-1 text-base"));

    var detaljer = lagElement("details", null, "mt-2 text-base");
    detaljer.appendChild(lagElement("summary", T.radar.omTeknikken, "cursor-pointer font-semibold text-dempet"));
    detaljer.appendChild(lagElement("p", teknikk.forklaring, "mt-1 text-dempet"));
    boks.appendChild(detaljer);
    return boks;
  }
```

Merk: `T.radar[status]` bruker nøklene `funnet`, `oversett` og `ikkeHer` i `content.js`.

- [ ] **Step 2: Wire up the buttons**

Legg til nederst inne i `kobleKnapper()`:

```js
    $("feed").addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-skann]");
      if (knapp) apneRadar(knapp.getAttribute("data-skann"), knapp);
    });
    $("radar-vis").addEventListener("click", visRadar);
    $("radar-lukk").addEventListener("click", lukkRadar);
    $("radar-tilbake").addEventListener("click", lukkRadar);
    $("radar").addEventListener("close", narRadarLukkes);
    // Et trykk på den mørke bakgrunnen utenfor panelet lukker det.
    $("radar").addEventListener("click", function (e) {
      if (e.target === $("radar")) lukkRadar();
    });
```

- [ ] **Step 3: Build CSS and run tests**

Run: `cd /Users/vera/INN527/manipulasjonsradar && ./bygg-css.sh && node --test tester/`
Expected: `Done in …`, deretter PASS, 34 tester

- [ ] **Step 4: Check guessing in the browser (375×667)**

Last `http://localhost:8123/` på nytt, velg Alene → Start feeden.
1. Bla til innlegg 5 (`nitti-prosent`), trykk «Skann med radaren». Panelet kommer opp nedenfra med tittelen «Hvilke triks ser du?», 6 teknikker + «Ingen av disse», og «Vis radaren» er deaktivert.
2. Velg «Falsk hast» og «Syndebukk». Knappen blir aktiv. Velg «Ingen av disse»: begge teknikkene blir avvalgt. Velg «Falsk hast» igjen: «Ingen» blir avvalgt.
3. Velg «Falsk hast» + «Syndebukk» → «Vis radaren». Expected: «Du så den: Falsk hast», «Vanskelig å se: Sterke følelser», «Ikke i dette innlegget: Syndebukk», hver med ikon og tekst. «Om teknikken» kan foldes ut.
4. Esc lukker panelet. Fokus står på kortets knapp, som nå heter «Se radaren igjen» og er fylt med radarfarge.

- [ ] **Step 5: Check the control posts**

1. Innlegg 8 (`pasta`): velg «Ingen av disse» → «Stemmer – dette innlegget bruker ingen av teknikkene.» + notatet om vanlig innhold.
2. Innlegg 10 (`bussen`): velg «Oss mot dem» → «Dette innlegget bruker ingen av teknikkene.», «Ikke i dette innlegget: Oss mot dem» og notatet om at det å mene noe ikke er manipulasjon.

- [ ] **Step 6: Check reopening (Review Focus 2)**

Åpne innlegg 5 igjen. Expected: resultatet fra steg 4 vises direkte, ikke gjettelisten. Trykk på bakgrunnen over panelet: panelet lukkes.

- [ ] **Step 7: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/app.js manipulasjonsradar/style.css
git commit -m "Manipulasjonsradar: radar med gjett først, så avsløring

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Feedreisen

**Files:**
- Modify: `app.js`, under `// ---------- Feedreisen ----------` og inne i `kobleKnapper()`
- Generated: `style.css`

Load the `dataviz` skill before writing this task's code. Chart colors are already set in `tailwind.css` (`--color-press` with three steps, a striped pattern for control posts). Don't add new colors, just follow the skill's rules for labels and accessibility.

**Interfaces:**
- Consumes: from Task 4: `$`, `lagElement`, `skjultTekst`, `visSkjerm`, `settModus`, `startFeed`, `tilstand`, the DOM in `#skjerm-reise`, the button `[data-handling="reise"]`. From Task 2: `R.feedreise`, `R.fyllInn`.
- Produces: `visReise()`.

- [ ] **Step 1: Add the feed journey code**

Insert right below the line `  // ---------- Feedreisen ----------`:

```js

  // Søylehøyde per intensitet (0–3). Står som hele klassenavn, så Tailwind finner dem.
  var SOYLEHOYDE = ["h-3", "h-12", "h-24", "h-32"];

  function visReise() {
    var reise = R.feedreise(C, tilstand.svar);
    lagTidslinje(reise.tidslinje);
    lagKart(reise.teknikkPerFase);
    lagTreff(reise);
    $("reise-treff-tittel").textContent = tilstand.modus === "sammen" ? T.reise.treffTittelSammen : T.reise.treffTittel;
    $("reise-ikke-skannet").textContent = reise.skannet > 0 && reise.ikkeSkannet > 0
      ? R.fyllInn(T.reise.ikkeSkannet, { antall: reise.ikkeSkannet })
      : "";

    var refleksjon = $("reise-refleksjon");
    refleksjon.textContent = "";
    C.refleksjon.forEach(function (sporsmal) {
      refleksjon.appendChild(lagElement("li", sporsmal, "rounded-2xl bg-flate p-4 font-semibold"));
    });

    visSkjerm("skjerm-reise");
  }

  function lagTidslinje(tidslinje) {
    var liste = $("reise-tidslinje");
    liste.textContent = "";
    tidslinje.forEach(function (punkt, i) {
      var li = lagElement("li", null, "flex flex-1 flex-col items-center justify-end gap-1");

      var soyle = lagElement("span", null, "soyle w-full rounded-t-md " + SOYLEHOYDE[punkt.intensitet] + (punkt.kontroll ? " soyle-kontroll" : ""));
      soyle.setAttribute("data-niva", punkt.intensitet);
      soyle.setAttribute("aria-hidden", "true");

      var nr = lagElement("span", String(i + 1), "text-xs tabular-nums text-dempet");
      nr.setAttribute("aria-hidden", "true");

      var beskrivelse = R.fyllInn(T.reise.soyleEtikett, { nr: i + 1, niva: T.reise.nivaer[punkt.intensitet] });
      if (punkt.kontroll) beskrivelse += " (" + T.reise.kontrollKort + ")";

      li.appendChild(soyle);
      li.appendChild(nr);
      li.appendChild(skjultTekst(beskrivelse));
      liste.appendChild(li);
    });
  }

  function lagKart(perFase) {
    var tabell = $("reise-kart");
    tabell.textContent = "";

    var hode = tabell.createTHead().insertRow();
    hode.appendChild(lagCelle("th", T.reise.kartTeknikk, "col", "text-left font-semibold text-dempet"));
    perFase.forEach(function (fase) {
      hode.appendChild(lagCelle("th", fase.kort, "col", "px-1 font-semibold text-dempet"));
    });

    var kropp = tabell.createTBody();
    C.teknikker.forEach(function (t) {
      var rad = kropp.insertRow();
      rad.appendChild(lagCelle("th", t.navn, "row", "pr-2 text-left font-semibold"));
      perFase.forEach(function (fase) {
        var antall = fase.antall[t.id];
        var celle = lagElement("td", null, "rounded-md bg-flate py-2 text-center " + (antall ? "text-press" : "text-kant"));
        var prikker = lagElement("span", antall ? "●".repeat(antall) : "·");
        prikker.setAttribute("aria-hidden", "true");
        celle.appendChild(prikker);
        celle.appendChild(skjultTekst(String(antall)));
        rad.appendChild(celle);
      });
    });
  }

  function lagCelle(tag, tekst, scope, klasse) {
    var celle = lagElement(tag, tekst, klasse);
    celle.setAttribute("scope", scope);
    return celle;
  }

  function lagTreff(reise) {
    var liste = $("reise-treff");
    liste.textContent = "";

    // Ingenting skannet: ingen «0 av 0», bare et spørsmål til samtalen.
    if (reise.skannet === 0) {
      liste.appendChild(lagElement("li", T.reise.ingenSkannet, "rounded-2xl bg-flate p-4"));
      return;
    }

    reise.treffPerTeknikk.forEach(function (t) {
      var li = lagElement("li", null, "rounded-2xl bg-flate p-4");
      var topp = lagElement("div", null, "flex flex-wrap items-baseline justify-between gap-x-3");
      topp.appendChild(lagElement("span", t.navn, "font-bold"));
      topp.appendChild(lagElement("span", t.av ? R.fyllInn(T.reise.treffTekst, { sett: t.sett, av: t.av }) : T.reise.ikkeMedSkannet, "text-base text-dempet"));
      li.appendChild(topp);

      if (t.av) {
        var spor = lagElement("div", null, "mt-2 h-2 overflow-hidden rounded-full bg-kant");
        spor.setAttribute("aria-hidden", "true");
        var fyll = lagElement("div", null, "h-full rounded-full bg-radar");
        fyll.style.width = Math.round((t.sett / t.av) * 100) + "%";
        spor.appendChild(fyll);
        li.appendChild(spor);
      }
      liste.appendChild(li);
    });
  }
```

- [ ] **Step 2: Wire up the buttons**

Add at the bottom of `kobleKnapper()`:

```js
    $("feed").addEventListener("click", function (e) {
      if (e.target.closest('[data-handling="reise"]')) visReise();
    });
    $("reise-igjen").addEventListener("click", startFeed);
    $("reise-ny").addEventListener("click", function () {
      settModus("alene");
      visSkjerm("skjerm-start");
    });
```

- [ ] **Step 3: Build CSS and run tests**

Run: `cd /Users/vera/INN527/manipulasjonsradar && ./bygg-css.sh && node --test tester/`
Expected: `Done in …`, then PASS, 34 tests

- [ ] **Step 4: Check a full run (375×667)**

Reload. Alene → skip the intro. Scan posts 4, 5, 8 and 12 (guess anything), and skip the rest. Scroll to the end card → «Se feedreisen».
Expected:
1. The timeline has 12 bars: 1–3 low and grey, rising towards 11–12. Bars 8 and 10 are striped. The legend at the bottom explains the stripes.
2. The table has 6 rows × 4 phases, with dots matching `content.js` (e.g. «Oss mot dem» has 0, 0, 0, ●● in the phases).
3. «Det du la merke til» shows «så X av Y» only for techniques in the scanned posts, and «Ikke med i innleggene som ble skannet» for the rest. The text below says «8 av innleggene ble ikke skannet.»
4. Three reflection questions.
5. `evaluate_script` → `document.documentElement.scrollWidth > document.documentElement.clientWidth` gives `false` (the table must not create horizontal page scroll).

- [ ] **Step 5: Screen reader text**

`take_snapshot` of the feed journey. Expected: the timeline is read as «Innlegg 1: nøytralt» … «Innlegg 8: nøytralt (vanlig innhold)» … «Innlegg 12: sterkt press», and the table cells have numbers.

- [ ] **Step 6: Restart and zero scanned (Review Focus 1 and 3)**

1. «Se innleggene igjen» → the feed starts at «1 av 12», and posts 4, 5, 8 and 12 still say «Se radaren igjen».
2. Back to the feed journey → «Start på nytt» → the start screen. Choose Alene → skip the intro. Expected: all buttons say «Skann med radaren» again.
3. Scroll straight to the end without scanning → «Se feedreisen». Expected: «Ingen innlegg ble skannet. Det er også et funn …», no «0 av 0», no «NaN», and no «… ble ikke skannet» text.

- [ ] **Step 7: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/app.js manipulasjonsradar/style.css
git commit -m "Manipulasjonsradar: feedreise med tidslinje, teknikkart og treff

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Keyboard navigation and Sammen mode

**Files:**
- Modify: `app.js`, under `// ---------- Tastatur ----------` and inside `kobleKnapper()`

**Interfaces:**
- Consumes: from Task 4: `tilstand.aktivt`, `gaTil(i, myk)`, `$`. From Task 5: `$("radar").open`.
- Produces: `vedTast(e)`.

- [ ] **Step 1: Add the keyboard code**

Insert right below the line `  // ---------- Tastatur ----------`:

```js

  // Arrow keys, Page Up/Down and space scroll through the feed (useful on a shared screen).
  var TASTER = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };

  function vedTast(e) {
    if ($("skjerm-feed").hidden || $("radar").open) return;
    var steg = TASTER[e.key];
    // Space on a button presses the button, as usual.
    if (e.key === " " && !e.target.closest("button, summary, a")) steg = e.shiftKey ? -1 : 1;
    if (!steg) return;
    e.preventDefault();
    gaTil(tilstand.aktivt + steg, true);
  }
```

Add at the bottom of `kobleKnapper()`:

```js
    document.addEventListener("keydown", vedTast);
```

- [ ] **Step 2: Run tests**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: PASS, 34 tests

- [ ] **Step 3: Check Sammen mode with the keyboard only (1280×800)**

`resize_page` to 1280×800, reload. Use only `press_key` (Tab, Enter, space, arrow keys, Esc):
1. Tab to «Sammen» → Enter. The text is noticeably larger (font size 125 %), and the intro is wider.
2. Tab to «Start feeden» → Enter. Arrow down 3 times → «4 av 12». Arrow up once → «3 av 12».
3. Arrow down to post 9, Tab to «Skann med radaren» → Enter. The panel lies along the right side, the post is visible on the left, and «Snakk om dette først» shows the post's question.
4. Tab to the options, press space on two of them, then Tab to «Vis radaren» → Enter. The result is shown, and «Snakk om dette først» is gone.
5. Esc → focus returns to the post's button. Arrow keys scroll through the feed again.
6. Scroll to the end → the feed journey. The heading says «Det gruppa la merke til».
7. `list_console_messages`: no errors.

- [ ] **Step 4: Switch mode (Review Focus 1)**

From the feed journey: «Start på nytt» → choose Alene. Expected: normal text size (`document.documentElement.dataset.modus === "alene"`), all buttons say «Skann med radaren», and the radar panel opens from the bottom again at 375 px width.

- [ ] **Step 5: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/app.js
git commit -m "Manipulasjonsradar: tastaturnavigasjon i feeden

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Offline, home screen and README

**Files:**
- Create: `sw.js`, `manifest.webmanifest`, `ikoner/ikon-192.png`, `ikoner/ikon-512.png`, `ikoner/ikon-maskerbar-512.png`, `README.md`
- Test: `tester/offline.test.js`

**Interfaces:**
- Consumes: the file list from Task 1–7.
- Produces: the service worker with the cache name `manipulasjonsradar`.

- [ ] **Step 1: Write the failing test**

Create `tester/offline.test.js`:

```js
"use strict";

// The service worker must list every file the page needs, and have its own cache name,
// so it doesn't collide with «Trykk pause» if both are published at the same address.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rot = path.join(__dirname, "..");
const sw = fs.readFileSync(path.join(rot, "sw.js"), "utf8");

function filliste() {
  const liste = sw.match(/var FILER = \[([\s\S]*?)\];/);
  assert.ok(liste, "fant ikke FILER i sw.js");
  return [...liste[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

test("eget cachenavn", () => {
  const navn = sw.match(/var CACHE = "([^"]+)"/);
  assert.ok(navn, "fant ikke CACHE i sw.js");
  assert.equal(navn[1], "manipulasjonsradar");
});

test("alle filer i FILER finnes", () => {
  filliste().filter((f) => f !== "./").forEach((f) => {
    assert.ok(fs.existsSync(path.join(rot, f)), "sw.js lister en fil som ikke finnes: " + f);
  });
});

test("alle filer index.html laster, er med i FILER", () => {
  const html = fs.readFileSync(path.join(rot, "index.html"), "utf8");
  const brukt = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]);
  const filer = filliste();
  brukt.forEach((f) => assert.ok(filer.includes(f), "mangler i FILER i sw.js: " + f));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: FAIL with `ENOENT: no such file or directory, open '.../sw.js'`

- [ ] **Step 3: Create `sw.js`, `manifest.webmanifest` and the icons**

`sw.js`:

```js
/*
 * SERVICE WORKER – gjør at siden virker uten nett etter første besøk.
 *
 * «Nett først»: når telefonen er på nett, hentes alltid nyeste versjon
 * (så endringer mellom testrundene vises med en gang). Uten nett brukes
 * kopien som ble lagret sist.
 *
 * Legger du til nye filer som siden trenger, før dem opp i FILER.
 * Cachenavnet må være forskjellig fra «Trykk pause» sitt.
 */

var CACHE = "manipulasjonsradar";
var FILER = [
  "./",
  "index.html",
  "style.css",
  "content.js",
  "radar.js",
  "app.js",
  "manifest.webmanifest",
  "fonter/archivo.woff2",
  "ikoner/ikon.svg",
  "ikoner/ikon-192.png",
  "ikoner/ikon-512.png",
  "ikoner/ikon-maskerbar-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FILER);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(function (svar) {
        var kopi = svar.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(e.request, kopi);
        });
        return svar;
      })
      .catch(function () {
        return caches.match(e.request, { ignoreSearch: true });
      })
  );
});
```

`manifest.webmanifest`:

```json
{
  "name": "Manipulasjonsradar",
  "short_name": "Radar",
  "description": "En fiktiv feed der du kan se hvilke manipulasjonsteknikker innlegg bruker.",
  "lang": "nb",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#0b0d12",
  "theme_color": "#0b0d12",
  "icons": [
    { "src": "ikoner/ikon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "ikoner/ikon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "ikoner/ikon-maskerbar-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Icons (the maskable version has no rounded corners, since the phone cuts the shape itself; the radar stays within the safe zone):

```bash
cd /Users/vera/INN527/manipulasjonsradar
rsvg-convert -w 192 -h 192 -o ikoner/ikon-192.png ikoner/ikon.svg
rsvg-convert -w 512 -h 512 -o ikoner/ikon-512.png ikoner/ikon.svg
sed 's/ rx="112"//' ikoner/ikon.svg | rsvg-convert -w 512 -h 512 -o ikoner/ikon-maskerbar-512.png
```

- [ ] **Step 4: Run tests**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: PASS, 37 tests

- [ ] **Step 5: Write `README.md`**

````markdown
# Manipulasjonsradar – prototype

En fiktiv feed der elever kan se hvilke **manipulasjonsteknikker** innlegg bruker, ikke
hvilken ideologi kilden har. Eleven gjetter først, så viser radaren svaret. Til slutt viser
feedreisen hvordan innholdet endret seg fra første til siste innlegg.

Prototypen er en probe i et living lab-prosjekt: målet er å lære av hvordan elevene
reagerer, ikke å bevise at verktøyet virker. Se `docs/specs/` for hele designet.

Ren HTML, CSS og JavaScript, med Tailwind for utseendet. Ingen backend, ingen cookies,
ingen analyseverktøy. Alt eleven velger ligger bare i nettleserens minne og forsvinner
når siden lukkes eller lastes på nytt.

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

## Publisere

Siden er bare vanlige filer, og kan legges hvor som helst som serverer filer over https:

- **Netlify Drop**: dra mappen `manipulasjonsradar` inn på <https://app.netlify.com/drop>.
- **GitHub Pages**: legg repoet på GitHub og slå på Pages. Siden ligger da på
  `https://<bruker>.github.io/<repo>/manipulasjonsradar/`.

Etter en endring kan det hende mobilen viser forrige versjon én gang. Last siden på nytt.

## Personvern

Siden lagrer ingenting: ingen cookies, ingen lagring i nettleseren, ingen analyse, og
ingenting sendes noe sted. Alt eleven velger forsvinner når siden lukkes.
````

- [ ] **Step 6: Check offline in the browser**

Reload `http://localhost:8123/` twice. `evaluate_script`:
```js
async () => ({
  sw: !!(await navigator.serviceWorker.getRegistration()),
  cacher: await caches.keys(),
  storage: localStorage.length + sessionStorage.length,
  cookies: document.cookie
})
```
Expected: `sw: true`, `cacher` contains `"manipulasjonsradar"`, `storage: 0`, `cookies: ""`. `list_network_requests` shows only requests to `localhost:8123`.

Then stop the server and reload: the page should still load and work from the cache. Start the server again afterwards.

- [ ] **Step 7: Commit**

```bash
cd /Users/vera/INN527
git add manipulasjonsradar/sw.js manipulasjonsradar/manifest.webmanifest manipulasjonsradar/ikoner manipulasjonsradar/README.md manipulasjonsradar/tester/offline.test.js
git commit -m "Manipulasjonsradar: offline, hjemskjerm og README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Final end-to-end check

**Files:**
- Modify only if a check fails (fix in the file that owns the bug, and commit with a message describing the fix).

- [ ] **Step 1: All tests**

Run: `cd /Users/vera/INN527/manipulasjonsradar && node --test tester/`
Expected: PASS, 37 tests, `fail 0`

- [ ] **Step 2: Full run on a small phone (320×568)**

Alene → intro → the whole feed with every post scanned → the feed journey. Check (`evaluate_script` as in Task 4 step 8) that there is no horizontal scroll on any screen, that the radar button is visible on every card, and that the radar panel can be scrolled to «Vis radaren» on the smallest screen.

- [ ] **Step 3: Accessibility**

Load the `chrome-devtools-mcp:a11y-debugging` skill and run its checks on the start screen, a card with the radar panel open (result view), and the feed journey. Requirements: contrast at least 4.5:1 for text (including bildetekst on the lightest gradient, `morgen`), all buttons have names, the radar status is read as text, and the focus order is logical.

- [ ] **Step 4: Privacy and network**

After a full run: `list_network_requests` shows only our own files. `localStorage.length === 0`, `sessionStorage.length === 0`, `document.cookie === ""`. `list_console_messages` shows no errors or warnings.

- [ ] **Step 5: Review the content against the rules**

Read through all 12 posts in `content.js` against the content rules in the spec (section 5.2): fictional usernames, a vague «dem», no real groups or keywords, mild language, and each `hvor` points to something that actually appears in the post's text.

- [ ] **Step 6: Commit any fixes**

```bash
cd /Users/vera/INN527
git status --short
# Bare hvis noe ble rettet:
git add manipulasjonsradar
git commit -m "Manipulasjonsradar: rettelser etter ende-til-ende-sjekk

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
