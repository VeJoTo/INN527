"use strict";

// Service workeren må liste alle filene siden trenger, og ha eget cachenavn,
// så den ikke kolliderer med «Trykk pause» hvis begge publiseres på samme adresse.

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
