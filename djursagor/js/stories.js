// Story content. Each page: scene id (see art.js) + Swedish and French text.
// Audio files live at audio/<storyId>-<page>-<lang>.mp3 (page is 1-based).
window.STORIES = [
  {
    id: "mira",
    color: "#d8433a",
    title: { sv: "Mira letar efter solen", fr: "Mira cherche le soleil" },
    pages: [
      { scene: "mira1",
        sv: "Det var en gång en liten mus som hette Mira. Hon bodde under snön, i ett varmt bo.",
        fr: "Il était une fois une petite souris qui s'appelait Mira. Elle vivait sous la neige, dans un nid bien chaud." },
      { scene: "mira2",
        sv: "Vintern var så lång. ”Var är solen?” undrade Mira.",
        fr: "L'hiver était si long. « Où est le soleil ? » se demandait Mira." },
      { scene: "mira3",
        sv: "Mira knöt sin röda halsduk. Hon gick ut för att leta.",
        fr: "Mira noua son écharpe rouge. Elle sortit pour le chercher." },
      { scene: "mira4",
        sv: "Hon mötte en ekorre i en gran. ”Solen bor bakom berget”, sa ekorren.",
        fr: "Elle rencontra un écureuil dans un sapin. « Le soleil habite derrière la montagne », dit l'écureuil." },
      { scene: "mira5",
        sv: "Mira gick och gick. Snön var djup och benen var små.",
        fr: "Mira marcha, marcha. La neige était profonde et ses pattes étaient petites." },
      { scene: "mira6",
        sv: "Till sist kom hon upp på toppen. Hon ropade: ”Hallå, solen! Vakna!”",
        fr: "Enfin, elle arriva tout en haut. Elle cria : « Coucou, soleil ! Réveille-toi ! »" },
      { scene: "mira7",
        sv: "Långsamt, långsamt kom solen fram. Den värmde Miras kalla nos.",
        fr: "Tout doucement, le soleil se leva. Il réchauffa le petit nez froid de Mira." },
      { scene: "mira8",
        sv: "Snön smälte, och små blommor tittade upp. Våren hade kommit!",
        fr: "La neige fondit, et de petites fleurs sortirent. Le printemps était arrivé !" }
    ]
  },
  {
    id: "hugo",
    color: "#6aa553",
    title: { sv: "Hugo och den tysta skogen", fr: "Hugo et la forêt silencieuse" },
    pages: [
      { scene: "hugo1",
        sv: "Det var en gång en liten hare som hette Hugo. Han hade långa öron som hörde allt.",
        fr: "Il était une fois un petit lièvre qui s'appelait Hugo. Il avait de grandes oreilles qui entendaient tout." },
      { scene: "hugo2",
        sv: "En morgon var skogen alldeles tyst. Lilla fågeln Pip hade tappat sin sång.",
        fr: "Un matin, la forêt était toute silencieuse. Le petit oiseau Pip avait perdu sa chanson." },
      { scene: "hugo3",
        sv: "”Jag hittar den!” sa Hugo. Och så skuttade han iväg.",
        fr: "« Je vais la retrouver ! » dit Hugo. Et il partit en sautillant." },
      { scene: "hugo4",
        sv: "Han frågade hackspetten. Men hackspetten sa bara: ”Knack, knack.”",
        fr: "Il demanda au pic-vert. Mais le pic-vert dit seulement : « Toc, toc. »" },
      { scene: "hugo5",
        sv: "Han frågade humlan. Men humlan sa bara: ”Surr, surr.”",
        fr: "Il demanda au bourdon. Mais le bourdon dit seulement : « Bzz, bzz. »" },
      { scene: "hugo6",
        sv: "Hugo satte sig och nynnade en liten visa. La, la, la.",
        fr: "Hugo s'assit et fredonna une petite chanson. La, la, la." },
      { scene: "hugo7",
        sv: "Pip lyssnade. Pip nynnade med. Och sången kom tillbaka!",
        fr: "Pip écouta. Pip fredonna aussi. Et sa chanson revint !" },
      { scene: "hugo8",
        sv: "Nu sjunger de tillsammans varje morgon. Hela skogen vaknar glad.",
        fr: "Maintenant, ils chantent ensemble chaque matin. Toute la forêt se réveille joyeuse." }
    ]
  },
  {
    id: "ruben",
    color: "#3d5a8c",
    title: { sv: "Ruben räddar månen", fr: "Ruben sauve la lune" },
    pages: [
      { scene: "ruben1",
        sv: "Det var en gång en liten räv som hette Ruben. Han hade en vit tipp på svansen.",
        fr: "Il était une fois un petit renard qui s'appelait Ruben. Le bout de sa queue était tout blanc." },
      { scene: "ruben2",
        sv: "En kväll såg Ruben månen i sjön. ”Oj! Månen har ramlat i!”",
        fr: "Un soir, Ruben vit la lune dans le lac. « Oh ! La lune est tombée dans l'eau ! »" },
      { scene: "ruben3",
        sv: "”Jag måste rädda den”, sa Ruben. Han hämtade en lång pinne.",
        fr: "« Je dois la sauver », dit Ruben. Il alla chercher un long bâton." },
      { scene: "ruben4",
        sv: "Plask! Månen gick sönder i små bitar. Ruben blev rädd.",
        fr: "Plouf ! La lune se cassa en petits morceaux. Ruben eut très peur." },
      { scene: "ruben5",
        sv: "Då hoppade grodan upp på en näckros. ”Vänta”, sa hon. ”Var alldeles stilla.”",
        fr: "Alors, la grenouille sauta sur un nénuphar. « Attends », dit-elle. « Ne bouge plus. »" },
      { scene: "ruben6",
        sv: "Vattnet blev lugnt. Och där var månen igen, hel och rund.",
        fr: "L'eau devint calme. Et la lune était là, toute ronde et entière." },
      { scene: "ruben7",
        sv: "”Titta upp”, sa grodan. Där uppe lyste månen, alldeles trygg.",
        fr: "« Regarde en haut », dit la grenouille. Là-haut, la lune brillait, bien tranquille." },
      { scene: "ruben8",
        sv: "Ruben skrattade och gäspade. Månen vakade över honom hela natten.",
        fr: "Ruben rit et bâilla. La lune veilla sur lui toute la nuit." }
    ]
  }
];

window.UI = {
  sv: { pick: "Välj en saga", end: "Slut!", again: "Fler sagor", tap: "Tryck för att lyssna", scroll: "Snurra hjulet" },
  fr: { pick: "Choisis une histoire", end: "Fin !", again: "Autres histoires", tap: "Touche pour écouter", scroll: "Tourne la molette" }
};
