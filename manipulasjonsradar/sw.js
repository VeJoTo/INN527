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
