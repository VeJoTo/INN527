/*
 * ALT INNHOLD I MANIPULASJONSRADAR
 * --------------------------------
 * Her ligger alle tekster, teknikker og innlegg. Du kan endre denne fila
 * uten å røre index.html, app.js, radar.js eller style.css.
 *
 * Etter at du har endret noe: kjør `node --test tester/` i Terminal, eller
 * last siden på nytt. Siden sier fra hvis noe ikke stemmer.
 *
 * Regler for redigering:
 * - Tekst står i "anførselstegn". Bruk «sitattegn» inne i teksten,
 *   ikke vanlige " (de avslutter teksten for tidlig).
 * - Hvert element i en liste skilles med komma.
 * - id-er skrives med små bokstaver og bindestrek, uten mellomrom og æøå.
 * - \n i en tekst betyr ny linje.
 * - Ord i {krøllparenteser} fylles inn av siden. La dem stå.
 *
 * Felter på hvert innlegg:
 *   id                  – unik id, brukes bare internt
 *   fase                – hvilken del av feeden (nr. i «faser»)
 *   intensitet          – hvor mye innlegget presser: 0 (ingenting) til 3 (mye)
 *   kontroll            – true for vanlige innlegg som er blandet inn (skal ikke ha teknikker)
 *   konto               – fiktivt brukernavn. Skal ikke ligne ekte kontoer
 *   skjermtekst         – den store teksten på kortet
 *   bildetekst          – teksten under, som en caption
 *   hashtags            – uten #
 *   likes, kommentarer  – tall
 *   utvalgteKommentarer – 1–3 kommentarer som vises på kortet
 *   bakgrunn            – to farger for bakgrunnen. Velg mørke farger, teksten er hvit
 *   teknikker           – teknikkene innlegget bruker: id + «hvor» (én setning om hvor i innlegget)
 *                         Tom liste [] betyr ingen teknikker.
 *   snakkOm             – spørsmål som vises før gjetting i Sammen-modus
 *   notat               – valgfri forklaring etter radaren (brukes på kontrollinnleggene)
 */

window.CONTENT = {
  tekster: {
    start: {
      tittel: "Manipulasjonsradar",
      tekst: "Bla gjennom en feed og se om du klarer å avsløre triksene innleggene bruker for å påvirke deg.",
      ramme:
        "Dette handler om hvordan feeder og algoritmer virker – ikke om deg. " +
        "Alle innlegg og kontoer er fiktive og laget for dette prosjektet. " +
        "Radaren ser på hvordan innhold prøver å påvirke, ikke på hvilke meninger noen har.",
      velg: "Hvordan skal dere bruke den?",
      alene: "Alene",
      aleneBeskrivelse: "På din egen mobil, i ditt eget tempo.",
      sammen: "Sammen",
      sammenBeskrivelse: "På felles skjerm. Gruppa gjetter sammen, og én trykker.",
      personvern: "Ingenting du velger blir lagret eller sendt noe sted. Lukker du siden, er alt borte."
    },
    intro: {
      tittel: "Seks triks å se etter",
      tekst: "Radaren leter etter disse teknikkene. De finnes i memes, videoer og innlegg om alt mulig – uansett politisk ståsted.",
      hopp: "Hopp over",
      start: "Start feeden"
    },
    feed: {
      tittel: "Feeden",
      fiktiv: "Fiktiv feed",
      fremdrift: "{nr} av {totalt}",
      kortEtikett: "Innlegg {nr} av {totalt}",
      likes: "{antall} likes",
      kommentarer: "{antall} kommentarer",
      utvalgte: "Kommentarer",
      skann: "Skann med radaren",
      skannet: "Se radaren igjen",
      sluttTittel: "Det var feeden.",
      sluttTekst: "Tolv innlegg. Hvordan endret de seg fra første til siste?",
      tilReisen: "Se feedreisen"
    },
    radar: {
      lukk: "Lukk radaren",
      sporsmal: "Hvilke triks ser du?",
      hjelp: "Velg alle du tror er med. Det er lov å gjette.",
      ingen: "Ingen av disse",
      vis: "Vis radaren",
      snakkOm: "Snakk om dette først",
      resultatTittel: "Dette fant radaren",
      funnet: "Du så den",
      oversett: "Vanskelig å se",
      ikkeHer: "Ikke i dette innlegget",
      ingenRiktig: "Stemmer – dette innlegget bruker ingen av teknikkene.",
      ingenTeknikker: "Dette innlegget bruker ingen av teknikkene.",
      omTeknikken: "Om teknikken",
      tilbake: "Tilbake til feeden"
    },
    reise: {
      tittel: "Feedreisen",
      tekst: "Slik så feeden ut fra første til siste innlegg.",
      tidslinjeTittel: "Hvordan feeden endret seg",
      tidslinjeTekst: "Hver søyle er ett innlegg. Jo høyere søyle, jo mer prøvde innlegget å presse deg.",
      soyleEtikett: "Innlegg {nr}: {niva}",
      nivaer: ["nøytralt", "litt press", "mer press", "sterkt press"],
      kontrollKort: "vanlig innhold",
      kontrollForklaring: "Vanlig innhold uten triks, blandet inn underveis",
      kartTittel: "Triksene underveis",
      kartTekst: "Hvor mange ganger hver teknikk dukket opp i hver del av feeden.",
      kartTeknikk: "Teknikk",
      treffTittel: "Det du la merke til",
      treffTittelSammen: "Det gruppa la merke til",
      treffTekst: "så {sett} av {av}",
      ikkeMedSkannet: "Ikke med i innleggene som ble skannet",
      ingenSkannet: "Ingen innlegg ble skannet. Det er også et funn – hva fikk deg til å bla videre?",
      ikkeSkannet: "{antall} av innleggene ble ikke skannet.",
      refleksjonTittel: "Snakk om det",
      igjen: "Se innleggene igjen",
      nyStart: "Start på nytt"
    }
  },

  // Listen er et utgangspunkt. Elevene kan endre den i fokusgruppen.
  teknikker: [
    {
      id: "oss-mot-dem",
      navn: "Oss mot dem",
      kort: "Verden deles i to grupper, der den andre gruppen er en trussel.",
      forklaring:
        "Innholdet gjør «oss» til de gode og «dem» til et problem eller en fare. " +
        "Det gjør det vanskelig å se at folk er sammensatte, og lett å føle at du må velge side."
    },
    {
      id: "syndebukk",
      navn: "Syndebukk",
      kort: "En gruppe får skylden for et sammensatt problem.",
      forklaring:
        "Store problemer har som regel mange årsaker. Når én gruppe får all skylden, " +
        "føles forklaringen enkel og tilfredsstillende – men den stemmer sjelden."
    },
    {
      id: "sterke-folelser",
      navn: "Sterke følelser",
      kort: "Sinne, frykt eller ydmykelse brukes for å få deg til å reagere før du tenker.",
      forklaring:
        "Innhold som gjør deg sint, redd eller flau, får mer engasjement – og algoritmen viser mer av det som engasjerer. " +
        "Når følelsene tar over, er det lettere å dele før man har tenkt seg om."
    },
    {
      id: "skjuler-sannheten",
      navn: "«De skjuler sannheten»",
      kort: "Innholdet hevder å avsløre noe mediene eller eliten holder skjult.",
      forklaring:
        "«Ingen vil snakke om dette» får deg til å føle at du er blant de få som skjønner det. " +
        "Samtidig blir all motforestilling bare et nytt «bevis» på at noen skjuler noe."
    },
    {
      id: "ironi-skjold",
      navn: "Ironi som skjold",
      kort: "Ekstreme utsagn pakkes inn i humor, så kritikk kan avfeies som «bare tull».",
      forklaring:
        "Når et hardt budskap pakkes inn i en meme eller en vits, blir det vanskelig å kritisere: «det er jo bare tull». " +
        "Men budskapet blir værende, og det som startet som en vits, kan bli normalt."
    },
    {
      id: "falsk-hast",
      navn: "Falsk hast",
      kort: "Du må handle eller dele nå, før det er for sent.",
      forklaring:
        "«Del før det blir slettet» eller «snart er det for sent» presser deg til å handle med en gang. " +
        "Hast gir mindre tid til å tenke og sjekke."
    }
  ],

  faser: [
    { nr: 1, navn: "Nøytralt", kort: "Nøytralt" },
    { nr: 2, navn: "Selvforbedring med brodd", kort: "Brodd" },
    { nr: 3, navn: "Mistillit", kort: "Mistillit" },
    { nr: 4, navn: "Fiendebilde", kort: "Fiende" }
  ],

  // Rekkefølgen her er rekkefølgen i feeden.
  innlegg: [
    {
      id: "trening",
      fase: 1,
      intensitet: 0,
      konto: "@formkurven",
      skjermtekst: "3 øvelser for sterkere rygg 💪\n\nMarkløft · Roing · Pull-ups",
      bildetekst: "Rolig progresjon slår ego-løft hver gang. Lagre til neste økt.",
      hashtags: ["trening", "styrke", "gym"],
      likes: 1840,
      kommentarer: 42,
      utvalgteKommentarer: ["Prøvde dette i går, kjenner det godt i dag 😅", "Hvor mange sett anbefaler du?"],
      bakgrunn: ["#1e3a5f", "#0f766e"],
      teknikker: [],
      snakkOm: "Hva får dere til å stoppe opp ved et innlegg som dette?"
    },
    {
      id: "gaming",
      fase: 1,
      intensitet: 0,
      konto: "@pixelpelle",
      skjermtekst: "Når laget endelig vinner etter 9 tap på rad 😭🏆",
      bildetekst: "Aldri gi opp squaden. GG til alle som var med.",
      hashtags: ["gaming", "gg", "clutch"],
      likes: 3210,
      kommentarer: 87,
      utvalgteKommentarer: ["den siste runden var helt syk", "9 tap?? respekt for at dere holdt ut"],
      bakgrunn: ["#4c1d95", "#9d174d"],
      teknikker: [],
      snakkOm: "Hva slags innhold er det vanlig at feeden starter med for folk på deres alder?"
    },
    {
      id: "morgen",
      fase: 1,
      intensitet: 0,
      konto: "@tidligoppe",
      skjermtekst: "Stå opp kl. 06.00 i 30 dager.\nDette skjedde 👇",
      bildetekst: "Bedre søvn, mer tid til trening og mindre stress om morgenen. Ikke magi – bare vaner.",
      hashtags: ["motivasjon", "rutiner", "disiplin"],
      likes: 5120,
      kommentarer: 130,
      utvalgteKommentarer: ["klarte 4 dager 💀", "hva gjorde du med telefonen om kvelden?"],
      bakgrunn: ["#92400e", "#1e293b"],
      teknikker: [],
      snakkOm: "Er motivasjonsinnhold mest nyttig, eller kan det også bli for mye?"
    },
    {
      id: "ingen-redder",
      fase: 2,
      intensitet: 1,
      konto: "@ulvementalitet",
      skjermtekst: "Ingen kommer til å redde deg.\n\nIkke familien. Ikke vennene. Ikke samfunnet.",
      bildetekst: "Jo før du skjønner at du står alene, jo før blir du sterk.",
      hashtags: ["mindset", "disiplin", "alene"],
      likes: 18400,
      kommentarer: 612,
      utvalgteKommentarer: ["trengte å høre dette i dag", "så sant. folk bryr seg bare om seg selv"],
      bakgrunn: ["#111827", "#7f1d1d"],
      teknikker: [
        {
          id: "sterke-folelser",
          hvor: "Innlegget spiller på ensomhet og en følelse av å være sviktet («ikke familien, ikke vennene») for å vekke en sterk reaksjon."
        }
      ],
      snakkOm: "Hvorfor tror dere et budskap som dette treffer mange?"
    },
    {
      id: "nitti-prosent",
      fase: 2,
      intensitet: 1,
      konto: "@toppform.mindset",
      skjermtekst: "90 % av gutta gir opp før de er 25.\n\nEr du en av dem?",
      bildetekst: "Klokka tikker. Hver dag du venter, er en dag de andre går forbi deg. Start i dag – ikke i morgen.",
      hashtags: ["hustle", "mindset", "gutta"],
      likes: 26700,
      kommentarer: 940,
      utvalgteKommentarer: ["25 er snart 😬", "hvor kommer 90 % fra?"],
      bakgrunn: ["#0f172a", "#991b1b"],
      teknikker: [
        {
          id: "falsk-hast",
          hvor: "«Klokka tikker» og «start i dag – ikke i morgen» skaper et press om å handle nå."
        },
        {
          id: "sterke-folelser",
          hvor: "«Er du en av dem?» spiller på frykten for å være en taper. Tallet 90 % har ingen kilde."
        }
      ],
      snakkOm: "Hvordan føles det å bli spurt «er du en av dem?»?"
    },
    {
      id: "sigma",
      fase: 2,
      intensitet: 1,
      konto: "@sigma.memes.no",
      skjermtekst: "Han: blir dumpet\nOgså han: åpner Excel og legger en 10-årsplan 🗿",
      bildetekst: "Følelser er for de svake 😂 (bare tull da)",
      hashtags: ["sigma", "meme", "grindset"],
      likes: 41200,
      kommentarer: 1530,
      utvalgteKommentarer: ["🗿🗿🗿", "det verste er at dette er meg"],
      bakgrunn: ["#18181b", "#3f3f46"],
      teknikker: [
        {
          id: "ironi-skjold",
          hvor: "«Følelser er for de svake» pakkes inn i en vits og «bare tull da», så budskapet er vanskelig å protestere mot."
        }
      ],
      snakkOm: "Når er en meme bare en vits, og når sier den noe mer?"
    },
    {
      id: "skolen",
      fase: 3,
      intensitet: 2,
      konto: "@vaakne.gutter",
      skjermtekst: "Det skolen ALDRI kommer til å lære deg 🤫",
      bildetekst: "De vil ha deg lydig og stille. Derfor er det ingen lærer som forteller deg dette. Del 1 av 5 – følg for resten.",
      hashtags: ["sannheten", "våkne", "skolen"],
      likes: 58300,
      kommentarer: 2210,
      utvalgteKommentarer: ["hvorfor har ingen sagt dette før?", "lærerne mine er sånn fr"],
      bakgrunn: ["#0c0a09", "#57534e"],
      teknikker: [
        {
          id: "skjuler-sannheten",
          hvor: "«Det skolen aldri kommer til å lære deg» og «ingen lærer forteller deg dette» antyder at noen holder noe skjult med vilje."
        }
      ],
      snakkOm: "Hvorfor er «det ingen vil fortelle deg» så fristende å klikke på?"
    },
    {
      id: "pasta",
      fase: 3,
      intensitet: 0,
      kontroll: true,
      konto: "@studentkjokkenet",
      skjermtekst: "Pasta på 10 minutter, under 30 kr 🍝",
      bildetekst: "Hvitløk, olivenolje, chili og litt parmesan. Det er det. Oppskrift i kommentarene.",
      hashtags: ["mat", "student", "billigmat"],
      likes: 9400,
      kommentarer: 210,
      utvalgteKommentarer: ["lagde den i går, 10/10", "funker det med cheddar også?"],
      bakgrunn: ["#7c2d12", "#a16207"],
      teknikker: [],
      snakkOm: "Hvorfor tror dere et matinnlegg dukker opp midt i alt det andre?",
      notat: "Feeder blander ofte inn helt vanlig innhold. Ikke alt i feeden prøver å påvirke deg."
    },
    {
      id: "skylda",
      fase: 3,
      intensitet: 2,
      konto: "@sannhetenomgutta",
      skjermtekst: "Hvorfor sliter unge menn?\n\nSvaret er enkelt: DE har ødelagt alt for oss.",
      bildetekst: "Jobber, boliger, respekt – alt er tatt fra oss. Og de ler av deg mens det skjer. Er du ikke sint, følger du ikke med.",
      hashtags: ["ungemenn", "sannheten", "ingenbryrseg"],
      likes: 74100,
      kommentarer: 3880,
      utvalgteKommentarer: ["endelig noen som sier det", "hvem er «de» egentlig?"],
      bakgrunn: ["#1c1917", "#991b1b"],
      teknikker: [
        {
          id: "syndebukk",
          hvor: "Sammensatte problemer som jobber og boligpriser forklares med at én gruppe – «de» – har skylden."
        },
        {
          id: "sterke-folelser",
          hvor: "«De ler av deg» og «er du ikke sint, følger du ikke med» skal vekke sinne og ydmykelse."
        }
      ],
      snakkOm: "Hva skjer når et stort problem får én enkel forklaring?"
    },
    {
      id: "bussen",
      fase: 3,
      intensitet: 0,
      kontroll: true,
      konto: "@minmening.vgs",
      skjermtekst: "Mener: Bussen til skolen burde vært gratis for alle elever.",
      bildetekst:
        "Mange bruker over 1000 kr i måneden på buss. Motargumentet er at det koster kommunen mye. " +
        "Jeg mener likevel det er verdt det. Enig eller uenig?",
      hashtags: ["mening", "kollektiv", "skole"],
      likes: 2300,
      kommentarer: 410,
      utvalgteKommentarer: ["uenig, heller billigere enn gratis", "enig! spesielt for de som bor langt unna"],
      bakgrunn: ["#1e3a8a", "#155e75"],
      teknikker: [],
      snakkOm: "Hva er forskjellen på å ha en sterk mening og å manipulere?",
      notat:
        "Dette innlegget tar et tydelig standpunkt, men bruker ingen av teknikkene. " +
        "Det nevner motargumentet og inviterer til uenighet. Å mene noe er ikke manipulasjon."
    },
    {
      id: "oss-eller-dem",
      fase: 4,
      intensitet: 3,
      konto: "@frontlinja.memes",
      skjermtekst: "Det er oss eller dem.\nVelg side 🫵\n\n(det er bare en meme, chill 😂)",
      bildetekst:
        "Alt som har gått galt de siste årene? Takk til de der. " +
        "Hvis du blir sur av en meme, er du sannsynligvis en av dem.",
      hashtags: ["memes", "velgside", "ossellerdem"],
      likes: 112000,
      kommentarer: 6400,
      utvalgteKommentarer: ["😂😂 men ekte", "kjenner noen som ville blitt sure av dette"],
      bakgrunn: ["#09090b", "#7f1d1d"],
      teknikker: [
        {
          id: "oss-mot-dem",
          hvor: "«Det er oss eller dem» og «velg side» deler verden i to leirer, der den andre siden er en fiende."
        },
        {
          id: "ironi-skjold",
          hvor: "«Det er bare en meme, chill» gjør det vanskelig å kritisere – og den som reagerer, blir stemplet som «en av dem»."
        },
        {
          id: "syndebukk",
          hvor: "«Alt som har gått galt? Takk til de der» gir en vag gruppe skylden uten å si hva de har gjort."
        }
      ],
      snakkOm: "Hvorfor tror dere det er vanskelig å si imot en meme?"
    },
    {
      id: "del-for-slettet",
      fase: 4,
      intensitet: 3,
      konto: "@skjult.sannhet",
      skjermtekst: "⚠️ DEL FØR DETTE BLIR SLETTET ⚠️",
      bildetekst:
        "Mediene vil aldri vise deg dette. De vet at hvis nok av oss ser det, er det over for dem. " +
        "Du har kanskje bare timer på deg. Vi eller dem – du bestemmer.",
      hashtags: ["delnå", "sannheten", "våkneopp"],
      likes: 168000,
      kommentarer: 9900,
      utvalgteKommentarer: ["delt ✅", "hva er det egentlig som er i videoen?"],
      bakgrunn: ["#000000", "#7f1d1d"],
      teknikker: [
        {
          id: "falsk-hast",
          hvor: "«Del før dette blir slettet» og «bare timer på deg» skaper panikk og presser deg til å dele uten å sjekke."
        },
        {
          id: "skjuler-sannheten",
          hvor: "«Mediene vil aldri vise deg dette» hevder at noe holdes skjult – men innlegget sier aldri hva det er."
        },
        {
          id: "oss-mot-dem",
          hvor: "«Hvis nok av oss ser det, er det over for dem» og «vi eller dem» deler verden i to fiendtlige leirer."
        }
      ],
      snakkOm: "Hva gjør dere når noe sier at dere må dele nå?"
    }
  ],

  // Vises nederst i feedreisen, som utgangspunkt for samtalen etterpå.
  refleksjon: [
    "Kjenner du igjen en sånn utvikling fra feeder folk på din alder ser?",
    "Hvilket triks var vanskeligst å se? Hvorfor tror du det?",
    "Føltes radaren nyttig – eller som en pekefinger?"
  ]
};
