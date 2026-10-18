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
