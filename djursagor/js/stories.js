// Story content. Each page: scene id (see art.js) + Swedish and French text.
// Audio files live at audio/<storyId>-<page>-<lang>.mp3 (page is 1-based).
window.STORIES = [
  {
    id: "pim",
    color: "#e8734a",
    title: { sv: "Pim är hungrig", fr: "Pim a faim" },
    pages: [
      { scene: "pim1",
        sv: "Det här är Pim. Pim är en liten igelkott.",
        fr: "Voici Pim. Pim est un petit hérisson." },
      { scene: "pim2",
        sv: "Pim är hungrig. Mums, mums! Var finns maten?",
        fr: "Pim a faim. Miam, miam ! Où est le goûter ?" },
      { scene: "pim3",
        sv: "Pim tittar under ett blad. Inget där!",
        fr: "Pim regarde sous une feuille. Rien du tout !" },
      { scene: "pim4",
        sv: "Pim tittar bakom en sten. Där! Ett rött äpple!",
        fr: "Pim regarde derrière une pierre. Là ! Une pomme rouge !" },
      { scene: "pim5",
        sv: "Pim äter och äter. Nu är Pim mätt och glad.",
        fr: "Pim mange, mange, mange. Maintenant, Pim est content." }
    ]
  },
  {
    id: "ella",
    color: "#3fa7d6",
    title: { sv: "Ella simmar", fr: "Ella nage" },
    pages: [
      { scene: "ella1",
        sv: "Här är Ella. Ella är en liten anka. Kvack!",
        fr: "Voici Ella. Ella est une petite cane. Coin-coin !" },
      { scene: "ella2",
        sv: "Mamma anka simmar i dammen. Plask, plask!",
        fr: "Maman cane nage dans la mare. Plouf, plouf !" },
      { scene: "ella3",
        sv: "Ella står vid vattnet. Hon är lite rädd.",
        fr: "Ella est au bord de l'eau. Elle a un peu peur." },
      { scene: "ella4",
        sv: "Ett, två, tre... Hopp! Ella hoppar i!",
        fr: "Un, deux, trois… Hop ! Ella saute dans l'eau !" },
      { scene: "ella5",
        sv: "Ella simmar! Plask, kvack! Ella är så stolt.",
        fr: "Ella nage ! Plouf, coin-coin ! Ella est très fière." }
    ]
  },
  {
    id: "bo",
    color: "#7b5ea7",
    title: { sv: "Bo ska sova", fr: "Bo va dormir" },
    pages: [
      { scene: "bo1",
        sv: "Det här är Bo. Bo är en liten björn.",
        fr: "Voici Bo. Bo est un petit ours." },
      { scene: "bo2",
        sv: "Solen går ner. Himlen blir rosa.",
        fr: "Le soleil se couche. Le ciel devient rose." },
      { scene: "bo3",
        sv: "Bo gäspar. Aaah! Bo är så trött.",
        fr: "Bo bâille. Aaah ! Bo est très fatigué." },
      { scene: "bo4",
        sv: "Bo kryper in i sin grotta. Där är det varmt och mjukt.",
        fr: "Bo se blottit dans sa grotte. C'est tout doux et tout chaud." },
      { scene: "bo5",
        sv: "Månen lyser. Stjärnorna blinkar. Sov gott, Bo!",
        fr: "La lune brille. Les étoiles scintillent. Dors bien, Bo !" }
    ]
  }
];

window.UI = {
  sv: { pick: "Välj en saga", end: "Slut!", again: "Fler sagor", tap: "Tryck för att lyssna", scroll: "Snurra hjulet" },
  fr: { pick: "Choisis une histoire", end: "Fin !", again: "Autres histoires", tap: "Touche pour écouter", scroll: "Tourne la molette" }
};
