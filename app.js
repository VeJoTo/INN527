/*
 * LOGIKKEN I VERKTØYET
 * --------------------
 * Alt brukeren skriver og svarer ligger bare i variabelen `tilstand`
 * mens siden er åpen. Ingenting lagres eller sendes noe sted.
 *
 * Klassene i denne fila (f.eks. "text-dempet") er Tailwind.
 * Kjør ./bygg-css.sh hvis du legger til nye.
 */

(function () {
  "use strict";

  var C = window.CONTENT;
  var V = C.video;

  // Alle spørsmål i én flat liste, med temaet på hvert spørsmål.
  var alleSporsmal = [];
  C.temaer.forEach(function (tema) {
    tema.sporsmal.forEach(function (s) {
      alleSporsmal.push(Object.assign({ tema: tema }, s));
    });
  });

  var tilstand;
  var analyseTimer = null;

  function nullstill() {
    clearTimeout(analyseTimer);
    tilstand = {
      beskrivelse: "",
      analyse: null, // den simulerte videoanalysen: { tittel, observasjoner } eller null
      svar: {},      // f.eks. { "avsender-kjent": "nei" }
      nr: 0          // hvilket spørsmål som vises (0 = første)
    };
  }

  // ---------- Hjelpefunksjoner ----------

  function $(id) {
    return document.getElementById(id);
  }

  // Henter en tekst fra CONTENT med en sti som "start.tittel".
  function hentTekst(sti) {
    return sti.split(".").reduce(function (obj, nokkel) {
      return obj ? obj[nokkel] : undefined;
    }, C);
  }

  // Fyller inn alle elementer som har data-tekst="...".
  function fyllInnTekster() {
    document.querySelectorAll("[data-tekst]").forEach(function (el) {
      var tekst = hentTekst(el.getAttribute("data-tekst"));
      el.textContent = tekst !== undefined ? tekst : "[mangler tekst: " + el.getAttribute("data-tekst") + "]";
    });
  }

  function lagElement(tag, tekst, klasse) {
    var el = document.createElement(tag);
    if (tekst) el.textContent = tekst;
    if (klasse) el.className = klasse;
    return el;
  }

  // Overskrift med fargeprikk for et tema. Fargen settes i content.js.
  function lagTemaOverskrift(tag, tema) {
    var h = lagElement(tag, null, "mb-3 flex items-center gap-2.5 text-lg font-bold text-(--tema)");
    h.appendChild(lagElement("span", null, "size-3 shrink-0 rounded-full bg-(--tema)"));
    h.appendChild(document.createTextNode(tema.navn));
    return h;
  }

  function settTemafarge(el, tema) {
    el.style.setProperty("--tema", tema.farge);
  }

  // Viser én skjerm, skjuler resten, og flytter fokus til overskriften
  // slik at skjermlesere leser opp den nye skjermen.
  function visSkjerm(id) {
    document.querySelectorAll(".skjerm").forEach(function (s) {
      s.hidden = s.id !== id;
    });
    window.scrollTo(0, 0);
    $(id).querySelector("h1").focus();
  }

  // ---------- Videoeksempler ----------

  function lagEksempler() {
    var liste = $("eksempler");
    V.eksempler.forEach(function (eks) {
      var knapp = lagElement("button", null,
        "flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-kant bg-flate p-3 text-left transition-colors hover:bg-flate-lys");
      knapp.type = "button";

      // Liten «videoramme» som pynt
      var ramme = lagElement("span", "▶",
        "flex aspect-[9/16] w-12 shrink-0 items-center justify-center rounded-lg border border-kant bg-natt text-signal");
      ramme.setAttribute("aria-hidden", "true");
      knapp.appendChild(ramme);

      var tekst = lagElement("span", null, "block");
      tekst.appendChild(lagElement("span", eks.tittel, "block font-bold leading-snug"));
      tekst.appendChild(lagElement("span", eks.beskrivelse, "mt-1 block text-base leading-snug text-dempet"));
      knapp.appendChild(tekst);

      knapp.addEventListener("click", function () {
        tilstand.beskrivelse = $("beskrivelse").value.trim();
        startAnalyse(eks);
      });

      var li = document.createElement("li");
      li.appendChild(knapp);
      liste.appendChild(li);
    });
  }

  // ---------- Simulert analyse ----------

  function startAnalyse(analyse) {
    tilstand.analyse = analyse;
    visSkjerm("skjerm-analyserer");
    analyseTimer = setTimeout(visAnalyse, V.ventetidMs);
  }

  function visAnalyse() {
    $("analyse-video").textContent = tilstand.analyse.tittel;

    var liste = $("analyse-liste");
    liste.innerHTML = "";
    C.temaer.forEach(function (tema) {
      var funn = tema.sporsmal.filter(function (s) {
        return tilstand.analyse.observasjoner[s.id];
      });
      if (funn.length === 0) return;

      var del = document.createElement("section");
      settTemafarge(del, tema);
      del.appendChild(lagTemaOverskrift("h2", tema));
      var ul = lagElement("ul", null, "space-y-3");
      funn.forEach(function (s) {
        ul.appendChild(lagElement("li", tilstand.analyse.observasjoner[s.id], "border-l-4 border-(--tema) pl-4"));
      });
      del.appendChild(ul);
      liste.appendChild(del);
    });

    visSkjerm("skjerm-analyse");
  }

  // ---------- Spørsmål ----------

  // Fremdriftslinja: ett felt per tema, like bredt som antall spørsmål i temaet.
  function lagTidslinje() {
    var linje = $("tidslinje");
    C.temaer.forEach(function (tema) {
      var felt = lagElement("div", null, "h-2 overflow-hidden rounded-full bg-flate");
      felt.style.flexGrow = tema.sporsmal.length;
      var fyll = lagElement("div", null, "h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none");
      fyll.style.background = tema.farge;
      felt.appendChild(fyll);
      linje.appendChild(felt);
    });
  }

  function oppdaterTidslinje() {
    var felt = $("tidslinje").children;
    var forTemaet = 0;
    C.temaer.forEach(function (tema, i) {
      var besvart = Math.min(Math.max(tilstand.nr + 1 - forTemaet, 0), tema.sporsmal.length);
      felt[i].firstChild.style.width = (besvart / tema.sporsmal.length) * 100 + "%";
      forTemaet += tema.sporsmal.length;
    });
  }

  function visSporsmal() {
    var s = alleSporsmal[tilstand.nr];

    settTemafarge($("skjerm-sporsmal"), s.tema);
    $("sporsmal-tema").textContent = s.tema.navn;
    $("sporsmal-fremdrift").textContent = C.sporsmalSkjerm.fremdrift
      .replace("{nr}", tilstand.nr + 1)
      .replace("{totalt}", alleSporsmal.length);
    $("sporsmal-tekst").textContent = s.sporsmal;
    $("hvorfor-tekst").textContent = s.hvorfor;
    $("hvorfor").open = false;
    oppdaterTidslinje();

    // Hint fra den simulerte analysen, hvis det finnes et for dette spørsmålet.
    var observasjon = tilstand.analyse && tilstand.analyse.observasjoner[s.id];
    $("hint").hidden = !observasjon;
    $("hint-tekst").textContent = observasjon || "";

    // Marker tidligere valgt svar (når brukeren har gått tilbake).
    document.querySelectorAll("[data-svar]").forEach(function (knapp) {
      knapp.setAttribute("aria-pressed", knapp.getAttribute("data-svar") === tilstand.svar[s.id]);
    });

    visSkjerm("skjerm-sporsmal");
  }

  function svar(verdi) {
    tilstand.svar[alleSporsmal[tilstand.nr].id] = verdi;
    if (tilstand.nr < alleSporsmal.length - 1) {
      tilstand.nr++;
      visSporsmal();
    } else {
      visOppsummering();
    }
  }

  // ---------- Oppsummering ----------

  function visOppsummering() {
    // Det brukeren sjekket: egen beskrivelse og/eller videoen
    var sjekket = [tilstand.beskrivelse, tilstand.analyse && tilstand.analyse.tittel].filter(Boolean);
    var sjekketListe = $("du-sjekket-liste");
    sjekketListe.innerHTML = "";
    sjekket.forEach(function (t) {
      sjekketListe.appendChild(lagElement("li", t));
    });
    $("du-sjekket").hidden = sjekket.length === 0;

    // Varselsignaler gruppert per tema
    var signaler = $("signaler");
    signaler.innerHTML = "";
    var antallSignaler = 0;

    C.temaer.forEach(function (tema) {
      var markerte = tema.sporsmal.filter(function (s) {
        return tilstand.svar[s.id] === s.signalVed;
      });
      if (markerte.length === 0) return;
      antallSignaler += markerte.length;

      var del = document.createElement("section");
      settTemafarge(del, tema);
      del.appendChild(lagTemaOverskrift("h3", tema));
      var liste = lagElement("ul", null, "space-y-4");
      markerte.forEach(function (s) {
        var li = lagElement("li", null, "border-l-4 border-(--tema) pl-4");
        li.appendChild(lagElement("strong", s.teknikk, "block text-xl"));
        li.appendChild(lagElement("p", s.forklaring, "mt-1 text-base text-dempet"));
        liste.appendChild(li);
      });
      del.appendChild(liste);
      signaler.appendChild(del);
    });

    if (antallSignaler === 0) {
      signaler.appendChild(lagElement("p", C.oppsummering.ingenSignaler, "text-dempet"));
    }

    // «Vet ikke»-svar
    var vetIkke = alleSporsmal.filter(function (s) {
      return tilstand.svar[s.id] === "vetIkke";
    });
    var vetIkkeListe = $("sjekk-naermere-liste");
    vetIkkeListe.innerHTML = "";
    vetIkke.forEach(function (s) {
      vetIkkeListe.appendChild(lagElement("li", s.sporsmal));
    });
    $("sjekk-naermere").hidden = vetIkke.length === 0;

    // Lenker til videre lesing
    var lenker = $("lenker");
    lenker.innerHTML = "";
    C.oppsummering.lenker.forEach(function (l) {
      var a = lagElement("a", l.tekst, "font-semibold text-signal underline underline-offset-4");
      a.href = l.url;
      var li = document.createElement("li");
      li.appendChild(a);
      lenker.appendChild(li);
    });

    visSkjerm("skjerm-oppsummering");
  }

  // ---------- Knapper og skjema ----------

  $("start-knapp").addEventListener("click", function () {
    visSkjerm("skjerm-beskriv");
  });

  $("beskriv-tilbake").addEventListener("click", function () {
    visSkjerm("skjerm-start");
  });

  $("beskriv-skjema").addEventListener("submit", function (e) {
    e.preventDefault();
    tilstand.beskrivelse = $("beskrivelse").value.trim();
    tilstand.nr = 0;
    // Med lenke: vis den generelle eksempelanalysen. Lenken brukes ikke til noe.
    if ($("lenke").value.trim()) {
      startAnalyse(V.standardAnalyse);
    } else {
      tilstand.analyse = null;
      visSporsmal();
    }
  });

  $("analyse-videre").addEventListener("click", function () {
    tilstand.nr = 0;
    visSporsmal();
  });

  document.querySelectorAll("[data-svar]").forEach(function (knapp) {
    knapp.addEventListener("click", function () {
      svar(knapp.getAttribute("data-svar"));
    });
  });

  $("sporsmal-tilbake").addEventListener("click", function () {
    if (tilstand.nr > 0) {
      tilstand.nr--;
      visSporsmal();
    } else {
      visSkjerm(tilstand.analyse ? "skjerm-analyse" : "skjerm-beskriv");
    }
  });

  $("start-pa-nytt").addEventListener("click", function () {
    nullstill();
    $("beskrivelse").value = "";
    $("lenke").value = "";
    visSkjerm("skjerm-start");
  });

  // ---------- Oppstart ----------

  nullstill();
  fyllInnTekster();
  lagEksempler();
  lagTidslinje();
  document.title = C.start.tittel;

  if (!V.visDemoMerke) {
    document.querySelectorAll(".demo-merke, .demo").forEach(function (el) {
      el.hidden = true;
    });
  }

  // Gjør at siden kan legges til på hjemskjermen og virke uten nett.
  // Virker bare når siden ligger på en nettadresse (https), ikke når fila åpnes direkte.
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js");
  }
})();
