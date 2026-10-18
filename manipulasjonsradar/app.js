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

  // ---------- Feedreisen ----------

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
      hode.appendChild(lagCelle("th", fase.kort, "col", "font-semibold text-dempet"));
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

  // ---------- Tastatur ----------

  // Piltaster, Page Up/Down og mellomrom blar gjennom feeden (nyttig på en delt skjerm).
  var TASTER = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };

  function vedTast(e) {
    if ($("skjerm-feed").hidden || $("radar").open) return;
    var steg = TASTER[e.key];
    // Mellomrom på en knapp trykker knappen, som vanlig.
    if (e.key === " " && !e.target.closest("button, summary, a")) steg = e.shiftKey ? -1 : 1;
    if (!steg) return;
    e.preventDefault();
    gaTil(tilstand.aktivt + steg, true);
    // Fokus følger kortet, slik at Tab fortsetter derfra og ikke hopper tilbake til første innlegg.
    var kort = $("feed").querySelectorAll("[data-indeks]")[tilstand.aktivt];
    var knapp = kort && kort.querySelector("button");
    if (knapp) knapp.focus({ preventScroll: true });
  }

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
      var r = $("radar").getBoundingClientRect();
      var utenfor = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (e.target === $("radar") && utenfor) lukkRadar();
    });
    $("feed").addEventListener("click", function (e) {
      if (e.target.closest('[data-handling="reise"]')) visReise();
    });
    $("reise-igjen").addEventListener("click", startFeed);
    $("reise-ny").addEventListener("click", function () {
      settModus("alene");
      visSkjerm("skjerm-start");
    });
    document.addEventListener("keydown", vedTast);
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
