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

  // ---------- Validering av content.js ----------
  // Gir en liste med feilmeldinger på norsk. Tom liste betyr at alt er i orden.

  function valider(c) {
    if (!c || typeof c !== "object") return ["Fant ikke innholdet (window.CONTENT)."];
    var feil = [];

    if (!c.tekster || typeof c.tekster !== "object") feil.push("Mangler «tekster».");

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

    if (!Array.isArray(c.refleksjon) || c.refleksjon.length === 0 || !erTekstliste(c.refleksjon)) {
      feil.push("«refleksjon» må være en liste med minst ett spørsmål.");
    }

    return feil;
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

  return {
    valider: valider
  };
});
