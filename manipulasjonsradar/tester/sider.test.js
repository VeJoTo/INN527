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
