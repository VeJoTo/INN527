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
