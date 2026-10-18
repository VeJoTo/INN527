"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Radar = require("../radar.js");

// Gyldige tekster: hver påkrevde sti får teksten «x», og nivåene fire tekster.
function lagTekster() {
  const tekster = {};
  (Radar.PAKREVDE_TEKSTER || []).forEach((sti) => {
    const deler = sti.split(".");
    let obj = tekster;
    deler.slice(0, -1).forEach((n) => { obj = obj[n] = obj[n] || {}; });
    obj[deler[deler.length - 1]] = "x";
  });
  tekster.reise = tekster.reise || {};
  tekster.reise.nivaer = ["a", "b", "c", "d"];
  return tekster;
}

// Et lite, gyldig innhold å teste mot. Hver test lager sin egen kopi.
function lagInnhold() {
  return {
    tekster: lagTekster(),
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

test("valider: manglende tekstnøkkel gir melding", () => {
  const c = lagInnhold();
  delete c.tekster.feed.kortEtikett;
  assert.deepEqual(Radar.valider(c), ["Mangler tekst «feed.kortEtikett» under «tekster»."]);
});

test("valider: tom tekst regnes som manglende", () => {
  const c = lagInnhold();
  c.tekster.start.tittel = "  ";
  assert.deepEqual(Radar.valider(c), ["Mangler tekst «start.tittel» under «tekster»."]);
});

test("valider: reise.nivaer må ha fire tekster", () => {
  const c = lagInnhold();
  c.tekster.reise.nivaer = ["a", "b", "c"];
  assert.deepEqual(Radar.valider(c), ["tekster.reise.nivaer må være en liste med fire tekster."]);
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
