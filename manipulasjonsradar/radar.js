/*
 * RADARENS LOGIKK
 * ---------------
 * Rene utregninger uten noe med selve siden å gjøre, slik at de kan testes
 * med `node --test tester/`. app.js bruker dem som window.Radar.
 *
 * Du trenger ikke endre denne fila for å endre innhold. Det gjøres i content.js.
 */

(function (rot, lag) {
  var api = lag();
  if (typeof module === "object" && module.exports) module.exports = api;
  else rot.Radar = api;
})(this, function () {
  "use strict";

  function erTekst(v) {
    return typeof v === "string" && v.trim() !== "";
  }

  function erTekstliste(v) {
    return Array.isArray(v) && v.every(erTekst);
  }

  // Alle tekster appen leser fra «tekster» (data-tekst og data-etikett i index.html,
  // T.del.nokkel i app.js, og T.radar[status]). Mangler én, sjekkes det her og ikke på siden.
  // reise.nivaer er en liste og sjekkes for seg.
  var PAKREVDE_TEKSTER = [
    "feed.fiktiv",
    "feed.fremdrift",
    "feed.kommentarer",
    "feed.kortEtikett",
    "feed.likes",
    "feed.skann",
    "feed.skannet",
    "feed.sluttTekst",
    "feed.sluttTittel",
    "feed.tilReisen",
    "feed.tittel",
    "feed.utvalgte",
    "intro.hopp",
    "intro.start",
    "intro.tekst",
    "intro.tittel",
    "radar.funnet",
    "radar.hjelp",
    "radar.ikkeHer",
    "radar.ingen",
    "radar.ingenRiktig",
    "radar.ingenTeknikker",
    "radar.lukk",
    "radar.omTeknikken",
    "radar.oversett",
    "radar.resultatTittel",
    "radar.snakkOm",
    "radar.sporsmal",
    "radar.tilbake",
    "radar.vis",
    "reise.igjen",
    "reise.ikkeMedSkannet",
    "reise.ikkeSkannet",
    "reise.ingenSkannet",
    "reise.kartTeknikk",
    "reise.kartTekst",
    "reise.kartTittel",
    "reise.kontrollForklaring",
    "reise.kontrollKort",
    "reise.nyStart",
    "reise.refleksjonTittel",
    "reise.soyleEtikett",
    "reise.tekst",
    "reise.tidslinjeTekst",
    "reise.tidslinjeTittel",
    "reise.tittel",
    "reise.treffTekst",
    "reise.treffTittel",
    "reise.treffTittelSammen",
    "start.alene",
    "start.aleneBeskrivelse",
    "start.personvern",
    "start.ramme",
    "start.sammen",
    "start.sammenBeskrivelse",
    "start.tekst",
    "start.tittel",
    "start.velg"
  ];

  function hentSti(obj, sti) {
    return sti.split(".").reduce(function (o, n) {
      return o && typeof o === "object" ? o[n] : undefined;
    }, obj);
  }

  // ---------- Validering av content.js ----------
  // Gir en liste med feilmeldinger på norsk. Tom liste betyr at alt er i orden.

  function valider(c) {
    if (!c || typeof c !== "object") return ["Fant ikke innholdet (window.CONTENT)."];
    var feil = [];

    if (!c.tekster || typeof c.tekster !== "object") {
      feil.push("Mangler «tekster».");
    } else {
      PAKREVDE_TEKSTER.forEach(function (sti) {
        if (!erTekst(hentSti(c.tekster, sti))) feil.push("Mangler tekst «" + sti + "» under «tekster».");
      });
      var nivaer = hentSti(c.tekster, "reise.nivaer");
      if (!Array.isArray(nivaer) || nivaer.length !== 4 || !erTekstliste(nivaer)) {
        feil.push("tekster.reise.nivaer må være en liste med fire tekster.");
      }
    }

    var teknikkIder = {};
    if (!Array.isArray(c.teknikker) || c.teknikker.length === 0) {
      feil.push("«teknikker» må være en liste med minst én teknikk.");
    } else {
      c.teknikker.forEach(function (t, i) {
        if (!t || !erTekst(t.id)) {
          feil.push("Teknikk nr. " + (i + 1) + " mangler id.");
          return;
        }
        var navn = "Teknikk «" + t.id + "»";
        if (teknikkIder[t.id]) feil.push(navn + " finnes flere ganger. Hver id må være unik.");
        teknikkIder[t.id] = true;
        ["navn", "kort", "forklaring"].forEach(function (felt) {
          if (!erTekst(t[felt])) feil.push(navn + " mangler «" + felt + "».");
        });
      });
    }

    var faseNr = {};
    if (!Array.isArray(c.faser) || c.faser.length === 0) {
      feil.push("«faser» må være en liste med minst én fase.");
    } else {
      c.faser.forEach(function (f, i) {
        if (!f || typeof f.nr !== "number") {
          feil.push("Fase nr. " + (i + 1) + " mangler «nr».");
          return;
        }
        if (faseNr[f.nr]) feil.push("Fase " + f.nr + " finnes flere ganger.");
        faseNr[f.nr] = true;
        ["navn", "kort"].forEach(function (felt) {
          if (!erTekst(f[felt])) feil.push("Fase " + f.nr + " mangler «" + felt + "».");
        });
      });
    }

    if (!Array.isArray(c.innlegg) || c.innlegg.length === 0) {
      feil.push("«innlegg» må være en liste med minst ett innlegg.");
    } else {
      var innleggIder = {};
      c.innlegg.forEach(function (p, i) {
        feil.push.apply(feil, validerInnlegg(p, i, teknikkIder, faseNr, innleggIder));
      });
    }

    if (!Array.isArray(c.refleksjon) || c.refleksjon.length === 0 || !c.refleksjon.every(erRefleksjon)) {
      feil.push("«refleksjon» må være en liste med minst ett spørsmål.");
    }

    return feil;
  }

  // Et refleksjonsspørsmål er en tekst, eller { sporsmal: "...", barHvisSkannet: true }.
  function erRefleksjon(r) {
    return erTekst(r) || (r !== null && typeof r === "object" && erTekst(r.sporsmal));
  }

  function validerInnlegg(p, i, teknikkIder, faseNr, innleggIder) {
    if (!p || !erTekst(p.id)) return ["Innlegg nr. " + (i + 1) + " mangler id."];
    var feil = [];
    var navn = "Innlegg «" + p.id + "»";

    if (innleggIder[p.id]) feil.push(navn + " finnes flere ganger. Hver id må være unik.");
    innleggIder[p.id] = true;

    ["konto", "skjermtekst", "bildetekst", "snakkOm"].forEach(function (felt) {
      if (!erTekst(p[felt])) feil.push(navn + " mangler «" + felt + "».");
    });
    if (!faseNr[p.fase]) feil.push(navn + ": fase «" + p.fase + "» finnes ikke i «faser».");
    if ([0, 1, 2, 3].indexOf(p.intensitet) === -1) feil.push(navn + ": «intensitet» må være 0, 1, 2 eller 3.");
    if (p.kontroll !== undefined && typeof p.kontroll !== "boolean") feil.push(navn + ": «kontroll» må være true eller false.");
    if (p.notat !== undefined && !erTekst(p.notat)) feil.push(navn + ": «notat» er tomt. Fjern det eller skriv en tekst.");
    ["likes", "kommentarer"].forEach(function (felt) {
      if (typeof p[felt] !== "number" || p[felt] < 0) feil.push(navn + ": «" + felt + "» må være et tall (0 eller mer).");
    });
    if (!erTekstliste(p.hashtags)) feil.push(navn + ": «hashtags» må være en liste med tekster.");
    if (!erTekstliste(p.utvalgteKommentarer)) feil.push(navn + ": «utvalgteKommentarer» må være en liste med tekster.");
    if (!erTekstliste(p.bakgrunn) || p.bakgrunn.length !== 2) {
      feil.push(navn + ": «bakgrunn» må være en liste med to farger, f.eks. [\"#111827\", \"#7f1d1d\"].");
    }

    if (!Array.isArray(p.teknikker)) {
      feil.push(navn + ": «teknikker» må være en liste (tom liste [] betyr ingen teknikker).");
      return feil;
    }
    var sett = {};
    p.teknikker.forEach(function (t) {
      if (!t || !erTekst(t.id)) {
        feil.push(navn + ": en teknikk mangler id.");
        return;
      }
      if (!teknikkIder[t.id]) feil.push(navn + ": teknikk «" + t.id + "» finnes ikke i teknikklisten.");
      if (sett[t.id]) feil.push(navn + ": teknikk «" + t.id + "» står flere ganger.");
      sett[t.id] = true;
      if (!erTekst(t.hvor)) feil.push(navn + ": teknikk «" + t.id + "» mangler «hvor».");
    });
    if (p.kontroll === true && p.teknikker.length > 0) {
      feil.push(navn + " er et kontrollinnlegg og skal ikke ha teknikker.");
    }
    return feil;
  }

  // ---------- Gjetning ----------
  // En gjetning ser slik ut: { ingen: false, teknikker: ["falsk-hast"] }

  function tomGjetning() {
    return { ingen: false, teknikker: [] };
  }

  // Slår et valg av eller på. «Ingen av disse» og teknikker utelukker hverandre.
  function veksleValg(g, valg) {
    if (valg === "ingen") return g.ingen ? tomGjetning() : { ingen: true, teknikker: [] };
    var harDen = g.teknikker.indexOf(valg) !== -1;
    return {
      ingen: false,
      teknikker: harDen
        ? g.teknikker.filter(function (id) { return id !== valg; })
        : g.teknikker.concat([valg])
    };
  }

  function kanVise(g) {
    return !!g && (g.ingen || g.teknikker.length > 0);
  }

  // Sammenligner gjetningen med teknikkene innlegget faktisk bruker.
  function vurder(innlegg, g) {
    var fasit = innlegg.teknikker.map(function (t) { return t.id; });
    var gjettet = g.ingen ? [] : g.teknikker;
    return {
      funnet: fasit.filter(function (id) { return gjettet.indexOf(id) !== -1; }),
      oversett: fasit.filter(function (id) { return gjettet.indexOf(id) === -1; }),
      ikkeHer: gjettet.filter(function (id) { return fasit.indexOf(id) === -1; }),
      ingenRiktig: g.ingen && fasit.length === 0
    };
  }

  // ---------- Feedreisen ----------
  // svar: { innleggId: gjetning }. Innlegg som mangler i svar, er ikke skannet.

  function feedreise(c, svar) {
    var tidslinje = c.innlegg.map(function (p) {
      return {
        id: p.id,
        fase: p.fase,
        intensitet: p.intensitet,
        kontroll: p.kontroll === true,
        skannet: !!svar[p.id],
        antallTeknikker: p.teknikker.length
      };
    });

    var teknikkPerFase = c.faser.map(function (f) {
      var antall = {};
      c.teknikker.forEach(function (t) { antall[t.id] = 0; });
      c.innlegg.forEach(function (p) {
        if (p.fase !== f.nr) return;
        p.teknikker.forEach(function (t) { antall[t.id] += 1; });
      });
      return { nr: f.nr, navn: f.navn, kort: f.kort, antall: antall };
    });

    var treffPerTeknikk = c.teknikker.map(function (t) {
      var sett = 0;
      var av = 0;
      c.innlegg.forEach(function (p) {
        var g = svar[p.id];
        if (!g) return;
        if (!p.teknikker.some(function (x) { return x.id === t.id; })) return;
        av += 1;
        if (vurder(p, g).funnet.indexOf(t.id) !== -1) sett += 1;
      });
      return { id: t.id, navn: t.navn, sett: sett, av: av };
    });

    var skannet = c.innlegg.filter(function (p) { return !!svar[p.id]; }).length;

    return {
      tidslinje: tidslinje,
      teknikkPerFase: teknikkPerFase,
      treffPerTeknikk: treffPerTeknikk,
      skannet: skannet,
      ikkeSkannet: c.innlegg.length - skannet
    };
  }

  // Refleksjonsspørsmålene som tekster. Spørsmål med barHvisSkannet tas bare med
  // når minst ett innlegg er skannet (de spør om det man så med radaren).
  function refleksjonFor(c, skannet) {
    return c.refleksjon
      .filter(function (r) { return erTekst(r) || !r.barHvisSkannet || skannet > 0; })
      .map(function (r) { return erTekst(r) ? r : r.sporsmal; });
  }

  // ---------- Tekst og tall ----------

  // fyllInn("{nr} av {totalt}", { nr: 4, totalt: 12 }) → "4 av 12"
  function fyllInn(mal, verdier) {
    return mal.replace(/\{(\w+)\}/g, function (hele, navn) {
      return Object.prototype.hasOwnProperty.call(verdier, navn) ? String(verdier[navn]) : hele;
    });
  }

  // Likes og kommentarer slik feeder viser dem: 1840 → "1,8k"
  function kortTall(n) {
    if (n < 1000) return String(n);
    if (n < 10000) return String(Math.round(n / 100) / 10).replace(".", ",") + "k";
    if (n < 1000000) return Math.round(n / 1000) + "k";
    return String(Math.round(n / 100000) / 10).replace(".", ",") + " mill.";
  }

  return {
    PAKREVDE_TEKSTER: PAKREVDE_TEKSTER,
    valider: valider,
    tomGjetning: tomGjetning,
    veksleValg: veksleValg,
    kanVise: kanVise,
    vurder: vurder,
    feedreise: feedreise,
    refleksjonFor: refleksjonFor,
    fyllInn: fyllInn,
    kortTall: kortTall
  };
});
