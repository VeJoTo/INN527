/*
 * ALT INNHOLD I VERKTØYET
 * -----------------------
 * Her ligger alle tekster, spørsmål og lenker. Du kan endre denne fila
 * uten å røre index.html, app.js eller style.css.
 *
 * Regler for redigering:
 * - Tekst står i "anførselstegn". Bruk «sitattegn» inne i teksten,
 *   ikke vanlige " (de avslutter teksten for tidlig).
 * - Hvert element i en liste skilles med komma.
 * - Hvert spørsmål må ha en unik id (små bokstaver, uten mellomrom).
 *
 * Felter på hvert spørsmål:
 *   id         – unik id, brukes bare internt
 *   sporsmal   – selve spørsmålet
 *   signalVed  – hvilket svar som regnes som varselsignal: "ja" eller "nei"
 *   hvorfor    – teksten under «Hvorfor spør vi om dette?»
 *   teknikk    – navnet på varselsignalet i oppsummeringen
 *   forklaring – kort forklaring av teknikken i oppsummeringen
 *
 * Hvert tema har også en farge (farge: "#7dd3fc"). Velg en lys farge,
 * siden bakgrunnen er mørk blå.
 */

window.CONTENT = {
  start: {
    tittel: "Trykk pause.",
    tekst:
      "Har du sett en video, en post eller en kommentar som satte i gang tanker? " +
      "Her får du noen spørsmål som hjelper deg å se nærmere på det. " +
      "Vi sier ikke hva som er sant – det vurderer du selv.",
    personvern: "Ingenting du skriver eller svarer blir lagret eller sendt noe sted.",
    knapp: "Sjekk noe du har sett"
  },

  beskriv: {
    tittel: "Hva har du sett?",
    label: "Beskriv kort innholdet (valgfritt)",
    hjelpetekst:
      "For eksempel: «video om at menn blir diskriminert». " +
      "Teksten blir bare værende på denne siden og forsvinner når du lukker den.",
    knapp: "Gå videre",
    tilbake: "Tilbake"
  },

  /*
   * SIMULERT VIDEOANALYSE
   * Verktøyet analyserer ikke videoer på ekte. Lenken som limes inn åpnes
   * ikke og sendes ingen steder. I stedet vises en ferdigskrevet analyse:
   * - et eksempel brukeren velger, eller
   * - «standardAnalyse» hvis brukeren limer inn en egen lenke.
   *
   * observasjoner: nøkkelen er id-en til spørsmålet observasjonen hører til.
   * Spørsmål uten observasjon får ingen hint. Rekkefølgen styres av spørsmålene.
   */
  video: {
    visDemoMerke: true, // false = skjul «Demo»-merket (f.eks. i en Wizard-of-Oz-test)
    demoMerke: "Demo",
    demoForklaring:
      "Dette er en simulert analyse laget for testing. Verktøyet har ikke sett videoen.",

    lenkeLabel: "Lenke til videoen (valgfritt)",
    lenkeHjelp: "Lenken åpnes ikke og sendes ingen steder.",
    eksemplerTittel: "Eller prøv med et eksempel",

    analyserer: "Analyserer videoen …",
    ventetidMs: 2000, // hvor lenge «Analyserer …» vises, i millisekunder

    resultatTittel: "Dette la verktøyet merke til",
    resultatIntro:
      "Dette er observasjoner, ikke en vurdering av om innholdet stemmer. Du får se dem igjen ved spørsmålene, så kan du selv vurdere dem.",
    resultatKnapp: "Gå videre til spørsmålene",
    hintLabel: "Verktøyet la merke til:",

    standardAnalyse: {
      tittel: "Videoen du limte inn",
      observasjoner: {
        "avsender-tjener": "Kontoen har lenker til en nettbutikk i profilen.",
        "pastander-kilder": "Det vises ingen kilder i videoen eller i beskrivelsen.",
        "folelser-sterke": "Videoen bruker dramatisk musikk og raske klipp i starten.",
        "folelser-press": "Teksten på skjermen sier «Del før de fjerner denne».",
        "verden-sannhet": "Personen sier at «media aldri vil fortelle deg dette»."
      }
    },

    eksempler: [
      {
        id: "podkast",
        tittel: "Podkastklipp: «Menn får ikke være menn lenger»",
        beskrivelse: "Et 60 sekunders klipp fra en populær podkast, delt av en fanside.",
        observasjoner: {
          "avsender-kjent": "Klippet er lagt ut av en fanside, ikke av podkasten selv.",
          "avsender-tjener": "Programlederen reklamerer for et betalt medlemskap på slutten.",
          "pastander-tall": "Det sies at «80 prosent» av noe, uten å forklare hvor tallet kommer fra.",
          "folelser-oss-dem": "Det snakkes mye om «de» som vil «ta fra oss» noe.",
          "verden-latterliggjort": "Et motargument blir gjentatt med fjasete stemme."
        }
      },
      {
        id: "trening",
        tittel: "Treningsvideo med et budskap",
        beskrivelse: "En treningsinfluenser snakker om disiplin og om «systemet» midt i en økt.",
        observasjoner: {
          "avsender-tjener": "Videoen slutter med rabattkode på et nettkurs.",
          "pastander-kilder": "Påstandene om «hva forskning viser» har ingen kilde.",
          "folelser-sterke": "Seeren omtales som «svak» hvis han ikke følger rådene.",
          "verden-fiende": "En gruppe beskrives samlet som grunnen til at unge menn sliter.",
          "verden-sannhet": "Influenseren sier han er «den eneste som tør å si det»."
        }
      },
      {
        id: "nyhetsklipp",
        tittel: "Nyhetsklipp med ny tekst",
        beskrivelse: "Et gammelt nyhetsinnslag med ny tekst lagt over bildene.",
        observasjoner: {
          "avsender-anonym": "Kontoen som delte klippet har ikke navn eller profilbilde.",
          "pastander-uavhengig": "Teksten over bildene matcher ikke det reporteren faktisk sier.",
          "pastander-tall": "Datoen på klippet er klippet bort.",
          "folelser-press": "Teksten sier «Dette skjer NÅ – del!»."
        }
      }
    ]
  },

  // Tekster som brukes på alle spørsmålene
  sporsmalSkjerm: {
    svar: { ja: "Ja", nei: "Nei", vetIkke: "Vet ikke" },
    hvorforLabel: "Hvorfor spør vi om dette?",
    // {nr} og {totalt} byttes ut automatisk
    fremdrift: "Spørsmål {nr} av {totalt}",
    tilbake: "Tilbake"
  },

  temaer: [
    {
      navn: "Avsender",
      farge: "#7dd3fc", // fargen på temaet i fremdriftslinja og oppsummeringen
      sporsmal: [
        {
          id: "avsender-kjent",
          sporsmal: "Vet du hvem som står bak innholdet?",
          signalVed: "nei",
          hvorfor:
            "Når du vet hvem som snakker, er det lettere å forstå hvorfor de sier det de sier.",
          teknikk: "Ukjent avsender",
          forklaring:
            "Det er vanskelig å vurdere et budskap når du ikke vet hvem som står bak, eller hva de vil oppnå."
        },
        {
          id: "avsender-tjener",
          sporsmal: "Tjener avsenderen penger eller følgere på dette?",
          signalVed: "ja",
          hvorfor:
            "Mange lever av oppmerksomhet. Det påvirker hva de lager, og hvordan.",
          teknikk: "Oppmerksomhet som forretning",
          forklaring:
            "Innhold som provoserer, får ofte flest klikk. Da kan det lønne seg å overdrive eller spisse budskapet."
        },
        {
          id: "avsender-anonym",
          sporsmal: "Er avsenderen anonym?",
          signalVed: "ja",
          hvorfor:
            "Det finnes gode grunner til å være anonym. Men det sier noe om hvem som står ansvarlig for det som blir sagt.",
          teknikk: "Ingen står ansvarlig",
          forklaring:
            "En anonym avsender kan si hva som helst uten at det får følger. Da er det ekstra viktig å sjekke påstandene."
        }
      ]
    },
    {
      navn: "Påstander",
      farge: "#86efac",
      sporsmal: [
        {
          id: "pastander-kilder",
          sporsmal: "Viser innholdet til kilder?",
          signalVed: "nei",
          hvorfor:
            "Kilder gjør det mulig for deg å sjekke selv, i stedet for å måtte stole på én person.",
          teknikk: "Påstander uten kilder",
          forklaring:
            "Når ingen kilder er oppgitt, har du bare avsenderens ord å gå på."
        },
        {
          id: "pastander-uavhengig",
          sporsmal: "Finner du det samme hos en annen, uavhengig kilde?",
          signalVed: "nei",
          hvorfor:
            "Hvis noe stemmer, har som regel flere ulike kilder fått det med seg.",
          teknikk: "Bare én kilde",
          forklaring:
            "Når en påstand bare finnes ett sted, eller bare hos folk som deler hverandres innhold, er den vanskelig å bekrefte."
        },
        {
          id: "pastander-tall",
          sporsmal: "Er tall og eksempler forklart?",
          signalVed: "nei",
          hvorfor:
            "Tall og historier kan virke overbevisende selv når de er tatt ut av sammenhengen.",
          teknikk: "Tall og eksempler uten sammenheng",
          forklaring:
            "Uten å vite hvor et tall kommer fra eller hva det måler, er det lett å trekke feil konklusjon. Ett eksempel er heller ikke det samme som et mønster."
        }
      ]
    },
    {
      navn: "Følelser",
      farge: "#fda4af",
      sporsmal: [
        {
          id: "folelser-sterke",
          sporsmal: "Gjør innholdet deg sint, redd eller ydmyket?",
          signalVed: "ja",
          hvorfor:
            "Det er helt normalt å reagere. Spørsmålet er om innholdet bruker reaksjonen din til noe.",
          teknikk: "Spiller på sterke følelser",
          forklaring:
            "Sinne, frykt og skam gjør det vanskeligere å tenke gjennom ting. Innhold som vil påvirke deg, bruker ofte nettopp disse følelsene."
        },
        {
          id: "folelser-oss-dem",
          sporsmal: "Får du følelsen av at «de» er ute etter «oss»?",
          signalVed: "ja",
          hvorfor:
            "Følelsen av å være under angrep kan få deg til å stå sammen med folk du ellers ikke ville vært enig med.",
          teknikk: "Oss mot dem",
          forklaring:
            "Verden deles i to leirer, der den andre siden er en trussel. Det gjør det vanskelig å se nyanser."
        },
        {
          id: "folelser-press",
          sporsmal: "Føler du deg presset til å dele eller reagere raskt?",
          signalVed: "ja",
          hvorfor:
            "Tidspress gjør at du rekker å handle før du rekker å tenke.",
          teknikk: "Hastverk",
          forklaring:
            "«Del før det blir slettet» eller «alle må vite dette nå» er måter å få deg til å hoppe over din egen vurdering."
        }
      ]
    },
    {
      navn: "Bilde av verden",
      farge: "#c4b5fd",
      sporsmal: [
        {
          id: "verden-fiende",
          sporsmal: "Fremstilles en gruppe som fiende?",
          signalVed: "ja",
          hvorfor:
            "Hvordan en gruppe beskrives, påvirker hvordan vi tenker om menneskene i den.",
          teknikk: "Fiendebilde",
          forklaring:
            "Når en hel gruppe framstilles som farlig eller skyldig, blir enkeltmennesker borte. Det gjør det lettere å godta hat mot dem."
        },
        {
          id: "verden-sannhet",
          sporsmal: "Får du inntrykk av at bare denne kilden «tør å si sannheten»?",
          signalVed: "ja",
          hvorfor:
            "Hvis alle andre lyver, blir det umulig å sjekke noe – da må du stole på én stemme.",
          teknikk: "«Bare vi sier sannheten»",
          forklaring:
            "Når en kilde sier at alle andre lyver eller skjuler noe, kan du bli avhengig av den ene kilden og miste andre perspektiver."
        },
        {
          id: "verden-latterliggjort",
          sporsmal: "Blir andre syn latterliggjort?",
          signalVed: "ja",
          hvorfor:
            "Humor kan være bra. Men latter kan også brukes for å slippe å svare på argumenter.",
          teknikk: "Latterliggjøring",
          forklaring:
            "Når andre syn gjøres til latter i stedet for å bli diskutert, får du ikke vite hva som faktisk taler for dem."
        }
      ]
    }
  ],

  oppsummering: {
    tittel: "Det du la merke til",
    intro:
      "Dette er ikke en dom over innholdet, og ikke over deg. Det er en oversikt over det du la merke til underveis.",
    duSjekket: "Du sjekket:",
    signalerTittel: "Mulige varselsignaler",
    ingenSignaler:
      "Du markerte ingen varselsignaler. Det betyr ikke nødvendigvis at innholdet stemmer – bare at disse tegnene ikke var tydelige.",
    sjekkNaermereTittel: "Ting du kan sjekke nærmere",
    sjekkNaermereIntro: "Her svarte du «Vet ikke». Det kan være verdt å finne ut av:",
    refleksjonTittel: "Til ettertanke",
    refleksjon:
      "Har synet ditt på innholdet endret seg etter disse spørsmålene? Hva ville du trengt å vite for å bli sikrere?",
    lesMerTittel: "Les mer",
    // TODO: Bytt ut "#" med ekte lenker før testing
    lenker: [
      { tekst: "Plassholder: Om kildekritikk", url: "#" },
      { tekst: "Plassholder: Om manipulasjonsteknikker på nett", url: "#" },
      { tekst: "Plassholder: Hvem kan du snakke med?", url: "#" }
    ],
    startPaNytt: "Start på nytt"
  }
};
