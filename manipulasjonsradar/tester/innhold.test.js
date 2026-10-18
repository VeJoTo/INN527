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
