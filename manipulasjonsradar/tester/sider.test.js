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
const Radar = require("../radar.js");

function hent(sti) {
  return sti.split(".").reduce((obj, n) => (obj ? obj[n] : undefined), T);
}

test("alle data-tekst og data-etikett i index.html finnes", () => {
  const html = les("index.html");
  const stier = [...html.matchAll(/data-(?:tekst|etikett)="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(stier.length > 10, "fant for få tekstnøkler i index.html");
  stier.forEach((sti) => {
    assert.ok(Radar.PAKREVDE_TEKSTER.includes(sti), "mangler i PAKREVDE_TEKSTER: " + sti);
    assert.equal(typeof hent(sti), "string", "mangler tekst: " + sti);
  });
});

test("alle T.del.nokkel i app.js finnes", () => {
  const js = les("app.js");
  const stier = [...js.matchAll(/\bT\.([a-zA-Z]+)\.([a-zA-Z]+)/g)].map((m) => m[1] + "." + m[2]);
  assert.ok(stier.length > 5, "fant for få tekstnøkler i app.js");
  stier.forEach((sti) => {
    // reise.nivaer er en liste og valideres for seg i valider(). Resten er tekster.
    if (sti === "reise.nivaer") return assert.ok(Array.isArray(hent(sti)), "reise.nivaer må være en liste");
    assert.ok(Radar.PAKREVDE_TEKSTER.includes(sti), "mangler i PAKREVDE_TEKSTER: " + sti);
    assert.equal(typeof hent(sti), "string", "mangler tekst: " + sti);
  });
});

test("radar-statusene (T.radar[status]) er påkrevde tekster", () => {
  ["funnet", "oversett", "ikkeHer"].forEach((n) => {
    assert.ok(Radar.PAKREVDE_TEKSTER.includes("radar." + n), "mangler i PAKREVDE_TEKSTER: radar." + n);
  });
});

test("index.html laster filene i riktig rekkefølge", () => {
  const html = les("index.html");
  const content = html.indexOf('src="content.js"');
  const radar = html.indexOf('src="radar.js"');
  const app = html.indexOf('src="app.js"');
  assert.ok(content > 0 && radar > content && app > radar, "rekkefølgen må være content.js, radar.js, app.js");
});
