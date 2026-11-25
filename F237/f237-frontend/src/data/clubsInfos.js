
// Histoire et palmarès des clubs, que l'API-Football ne fournit pas.
//
// Sources : Wikipédia (licence CC BY-SA 4.0) et RSSSF (dates de fondation,
// finales de la Coupe du Cameroun). Les faits (dates, titres) sont repris tels
// quels ; les textes d'histoire sont des résumés rédigés pour F237.
// Les champs absents (fondation, couleurs...) étaient incertains ou
// contradictoires entre les sources : on préfère ne rien afficher que du faux.

export const CLUBS_INFOS = {
  'aigle royal de moungo': {
    nomComplet: 'Aigle Royal du Moungo',
    alias: ['aigle royal du moungo', 'aigle nkongsamba', 'aigle royal de nkongsamba', 'aigle moungo', 'aigle r. moungo'],
    ville: 'Nkongsamba',
    fondation: 1932,
    couleurs: 'Bleu et blanc',
    stade: 'Stade municipal de Nkongsamba',
    histoire: [
      "Fondé au début des années 1930 à Nkongsamba, dans le Moungo (région du Littoral), l'Aigle Royal, longtemps appelé Aigle de Nkongsamba, est l'un des clubs les plus anciens du Cameroun et la fierté de tout le département.",
      "Le club connaît son âge d'or dans les années 1970 : champion du Cameroun en 1970-1971, il devient le premier club basé hors de Douala et de Yaoundé à remporter le championnat, et dispute la Coupe d'Afrique des clubs champions l'année suivante. Il atteint aussi deux finales de Coupe du Cameroun, en 1970 et en 1975.",
      "Il ajoute un deuxième titre de champion en 1994. L'Aigle a révélé ou accueilli plusieurs grandes figures des Lions Indomptables, comme Michel Kaham, Augustine Simo ou Jean-Marie Tsébo.",
      "Relégué à l'issue de la saison 1999, le club traverse ensuite un long désert d'environ 25 ans entre la deuxième division et les championnats régionaux.",
      "Champion d'Elite Two en 2023-2024, il retrouve l'Elite One pour la saison 2024-2025 et anime de nouveau les derbys du Moungo face à son voisin, le Stade Renard de Melong.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['1970-71', 1994] },
      { competition: 'Elite Two', type: 'titre', annees: ['2023-24'] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1970, 1975] },
    ],
    grandsJoueurs: ['Jean-Marie Tsébo', 'Michel Kaham', 'Augustine Simo'],
    sources: [
      'https://fr.wikipedia.org/wiki/Aigle_Royal_du_Moungo',
      'https://rsssf.org/tablesk/kamchamp.html',
      'https://rsssf.org/tablesk/kamcuphist.html',
      'https://rsssf.org/tablesk/kam99.html',
    ],
  },

  'aigle royal': {
    nomComplet: 'Aigle Royal de la Menoua',
    alias: ['aigle royal de la menoua', 'aigle royal menoua', 'aigle royal de dschang'],
    surnom: "El Pacha, l'« Oiseau de la Menoua »",
    ville: 'Dschang',
    fondation: 1932,
    couleurs: 'Jaune et noir',
    stade: 'Stade municipal de Dschang (CENAJES)',
    histoire: [
      "Fondé en 1932 à Dschang, dans la région de l'Ouest, sous le nom d'Aigle Royal de Dschang (à l'initiative, selon le club, de l'administrateur Félix Soulier), « El Pacha » est l'un des plus anciens clubs du Cameroun et la fierté de tout le département de la Menoua.",
      "Il s'impose très tôt parmi les meilleures équipes du pays : finaliste de la coupe nationale en 1947 et en 1958, il termine aussi vice-champion du Cameroun en 1955-1956.",
      "Après des décennies entre l'élite et les divisions inférieures, le club vit un renouveau au milieu des années 2000. Champion de deuxième division en 2004, il devient vice-champion du Cameroun dès son retour, en 2004-2005, et découvre la Ligue des champions de la CAF en 2006. Finaliste de la Coupe du Cameroun en 2008, il atteint ensuite les huitièmes de finale de la Coupe de la Confédération en 2009.",
      "À partir de fin 2021, le club se restructure sous la présidence de Maître Gautier Zomissi. Relégué en Elite Two à l'issue de la saison 2023-2024, il réussit pourtant une belle épopée en Coupe du Cameroun 2024, jusqu'en finale contre la Colombe du Dja et Lobo (0-1). En 2025, il remporte l'Elite Two, retrouve l'Elite One et représente le Cameroun en Coupe de la Confédération.",
      "Au stade municipal de Dschang, ses supporters entretiennent une ambiance bouillante, surtout lors des derbys de l'Ouest face au Racing de Bafoussam ou à Fovu de Baham.",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: [2004, '2024-25'] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['1955-56', '2004-05'], libelle: 'Vice-champion' },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1947, 1958, 2008, 2024] },
    ],
    sources: [
      'https://fr.wikipedia.org/wiki/Aigle_royal_de_La_Menoua',
      'https://en.wikipedia.org/wiki/Aigle_Royal_Menoua',
      'https://rsssf.org/tablesk/kamcuphist.html',
      'https://rsssf.org/tablesk/kamchamp.html',
    ],
  },

  'canon': {
    nomComplet: 'Canon Sportif de Yaoundé',
    alias: ['canon yaounde', 'canon sportif de yaounde', 'canon de yaounde', 'canon kpakum'],
    surnom: 'Kpa-Kum (le bruit du coup de canon), Mekok Me Ngonda, les « Brésiliens d\'Afrique »',
    ville: 'Yaoundé',
    fondation: 1930,
    couleurs: 'Vert et rouge',
    stade: 'Stade Ahmadou-Ahidjo',
    histoire: [
      "Fondé le 11 novembre 1930 à Yaoundé (dans le quartier de Mvog-Mbi, selon la tradition du club), le Canon Sportif devient très tôt un symbole de fierté populaire dans la capitale. Son grand rival, le Tonnerre Kalara Club, né d'une scission avec le Canon, lui dispute le derby de Yaoundé.",
      "Ses années 1970 et 1980 sont un âge d'or : pratiquant un football spectaculaire qui lui vaut le surnom de « Brésiliens d'Afrique », le Kpa-Kum remporte trois Coupes d'Afrique des clubs champions (1971, 1978, 1980) et la Coupe d'Afrique des vainqueurs de coupe (1979), tout en dominant le championnat et la Coupe du Cameroun.",
      "À son apogée, le club fournit l'ossature des Lions Indomptables de la Coupe du monde 1982 et du premier titre à la CAN en 1984, avec des légendes comme Thomas N'Kono (Ballon d'Or africain 1979 et 1982), Jean Manga Onguéné (1980), Théophile Abega (1984), Emmanuel Kundé ou Grégoire M'Bida.",
      "Après un dixième titre de champion en 2002 et une finale de Coupe des vainqueurs de coupe en 2000, le club traverse une longue période de crises internes et de difficultés financières. Il retrouve de la stabilité au début des années 2020 et joue de nouveau le haut du classement de l'Elite One.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1970, 1974, 1977, 1979, 1980, 1982, 1985, 1986, 1991, 2002] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1957, 1967, 1973, 1975, 1976, 1977, 1978, 1983, 1986, 1993, 1995, 1999] },
      { competition: "Coupe d'Afrique des clubs champions", type: 'titre', annees: [1971, 1978, 1980], continental: true },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'titre', annees: [1979], continental: true },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'finale', annees: [1977, 1984, 2000], continental: true },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1960, 1974, 1980, 1985, 1998, 2013] },
      { competition: 'Super Coupe Roger Milla', type: 'finale', annees: [2000] },
    ],
    grandsJoueurs: ['Thomas N\'Kono', 'Théophile Abega', 'Jean Manga Onguéné', 'Emmanuel Kundé', 'Grégoire M\'Bida', 'Jean-Paul Akono'],
    sources: [
      'https://fr.wikipedia.org/wiki/Canon_Yaoundé',
      'https://en.wikipedia.org/wiki/Canon_Yaound%C3%A9',
      'https://rsssf.org/tablesk/kamcuphist.html',
    ],
  },

  'colombe': {
    nomComplet: 'Colombe Sportive du Dja-et-Lobo',
    alias: ['colombe sportive', 'colombe sportive du dja et lobo', 'colombe du dja et lobo', 'colombe du sud', 'colombe de sangmelima'],
    surnom: "L'Oiseau du Sud, les Blancs",
    ville: 'Sangmélima',
    fondation: 1953,
    couleurs: 'Violet et blanc',
    stade: 'Stade municipal de Sangmélima',
    histoire: [
      "Fondé en 1953 à Sangmélima sous le nom de Colombe de Sangmélima, le club devient au fil des années le porte-drapeau du football de la région du Sud. Rebaptisé Colombe du Dja-et-Lobo, puis Colombe du Sud, il porte aujourd'hui l'identité de toute une région.",
      "La Colombe découvre la première division en 1986-1987 et y reste jusqu'en 1993, avant de traverser une longue période dans les divisions inférieures.",
      "Après 23 ans d'absence, elle retrouve l'élite pour la saison 2017. À partir de 2020, le club se professionnalise et se restructure en profondeur, avec un quartier général installé à Yaoundé.",
      "Le 29 septembre 2024, sous la direction de l'entraîneur Richard Towa, ancien joueur du club, l'Oiseau du Sud remporte le premier trophée majeur de son histoire : la Coupe du Cameroun, 1-0 face à l'Aigle Royal de la Menoua. Il enchaîne avec la Super Coupe, gagnée 2-1 contre Victoria United.",
      "Le 8 juin 2025, 72 ans après sa création, la Colombe est sacrée championne du Cameroun pour la première fois (3-0 contre Victoria United), puis conserve son titre en 2026, saison conclue par une large victoire 7-0 contre Fauve Azur. Elle dispute aussi la Ligue des champions de la CAF.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['2024-25', 2026] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2024] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2024] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2025] },
    ],
    sources: [
      'https://en.wikipedia.org/wiki/Colombe_Sportive',
      'https://fr.wikipedia.org/wiki/Colombe_sportive_du_Dja_et_Lobo',
      'https://rsssf.org/tablesk/kamchamp.html',
      'https://cameroon-tribune.cm/article.html/78213/fr.html/details_2',
    ],
  },

  'cotonsport': {
    nomComplet: 'Coton Sport Football Club de Garoua',
    alias: ['coton sport', 'coton sport fc de garoua', 'cotonsport de garoua', 'coton sport garoua'],
    surnom: 'Les Cotonniers',
    ville: 'Garoua',
    fondation: 1986,
    couleurs: 'Vert et blanc',
    stade: 'Stade omnisports Roumdé-Adjia',
    histoire: [
      "Créé en 1986 à Garoua, dans la région du Nord, avec le soutien de la société cotonnière Sodecoton, Coton Sport gravit rapidement les échelons : il accède à l'élite en 1993 et termine vice-champion du Cameroun dès la saison suivante, en 1994, avant de remporter son premier titre en 1997.",
      "Le club met alors fin à la domination historique des clubs de Douala et de Yaoundé. Avec 18 titres de champion, dont six d'affilée de 2003 à 2007-2008 et un dernier triplé de 2021 à 2023, il détient le record du championnat camerounais. Il compte aussi sept Coupes du Cameroun.",
      "Coton Sport porte régulièrement le drapeau camerounais sur la scène africaine : finaliste de la Coupe de la CAF en 2003, puis de la Ligue des champions de la CAF en 2008 face à Al Ahly, il atteint encore les demi-finales de la Ligue des champions en 2013.",
      "Appuyé sur une organisation professionnelle et un centre de formation performant, le club a servi de tremplin à plusieurs générations de Lions Indomptables.",
      "Après son triplé, il traverse une phase de renouvellement face à l'émergence de nouveaux rivaux et aborde la saison 2026-2027 avec l'ambition de reconquérir le titre.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1997, 1998, 2001, 2003, 2004, 2005, 2006, 2007, '2007-08', '2009-10', '2010-11', 2013, 2014, 2015, 2018, '2020-21', 2022, '2022-23'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2003, 2004, 2007, 2008, 2011, 2014, 2022] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2023] },
      { competition: 'Ligue des champions de la CAF', type: 'finale', annees: [2008], continental: true },
      { competition: 'Coupe de la CAF', type: 'finale', annees: [2003], continental: true },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: [1994, 1996, 1999, 2000, 2002], libelle: 'Vice-champion' },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1999] },
    ],
    grandsJoueurs: ['Vincent Aboubakar', 'Jean II Makoun', 'Alioum Boukar', 'André-Frank Zambo Anguissa', 'Marius Mouandilmadji'],
    sources: [
      'https://fr.wikipedia.org/wiki/Coton_Sport_Football_Club_de_Garoua',
      'https://en.wikipedia.org/wiki/Coton_Sport_FC_de_Garoua',
      'https://rsssf.org/tablesk/kamchamp.html',
      'https://rsssf.org/tablesk/kam93.html',
    ],
  },

  'dynamo de douala': {
    nomComplet: 'Dynamo Football Club de Douala',
    alias: ['dynamo douala', 'dynamo fc de douala', 'dynamo club de douala', 'dynamo'],
    surnom: "Bon Ba Djob (« les enfants de Dieu » en bassa), le Peuple",
    ville: 'Douala',
    fondation: 1948,
    couleurs: 'Jaune et noir',
    stade: 'Stade de la Réunification',
    histoire: [
      "Fondé en 1948 dans le quartier de Nkongmondo, à Douala, le Dynamo naît avec une forte identité populaire et engagée, ce qui lui vaut le surnom de club du « Peuple ». Il rassemble une immense communauté de supporters dans la capitale économique.",
      "Les Bon Ba Djob connaissent leur apogée à la charnière des années 1970 et 1980. Ils remportent la Coupe du Cameroun en 1979 face au PWD de Bamenda (3-1), puis de nouveau en 1981 en battant en finale leur grand rival local, l'Union Sportive de Douala (2-0). La même année, le club termine vice-champion du Cameroun derrière le Tonnerre de Yaoundé.",
      "Un troisième trophée national arrive en 1998, avec une victoire 1-0 face au Canon de Yaoundé en finale de la Coupe du Cameroun.",
      "Club formateur, le Dynamo a notamment révélé le regretté Modeste M'Bami, champion olympique en 2000 et passé par le PSG et l'OM.",
      "Le club connaît ensuite de longues années difficiles, entre divisions inférieures et crises internes. Restructuré, il retrouve l'Elite One pour la saison 2023-2024, puis termine vice-champion du Cameroun en 2025-2026, derrière la Colombe.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1979, 1981, 1998] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: [1981, '2025-26'], libelle: 'Vice-champion' },
    ],
    grandsJoueurs: ["Modeste M'Bami"],
    sources: [
      'https://rsssf.org/tablesk/kamcuphist.html',
      'https://rsssf.org/tablesk/kam81.html',
      'https://cameroun24.net/article-amp/74736-officiel-colombe-du-sud-est-sacree-championne-du-cameroun-2026-decouvrez-le-classement-final-de-la-mtn-elite-one.html',
      'https://rsssf.org/tablesk/kamfound.html',
      'https://en.wikipedia.org/wiki/Cameroonian_Cup',
    ],
  },

  'fortuna mfou': {
    nomComplet: 'AS Fortuna de Mfou',
    alias: ['as fortuna', 'fortuna', 'as fortuna de mfou', 'fortuna de mfou'],
    ville: 'Mfou',
    fondation: 1998,
    couleurs: 'Rouge et blanc',
    histoire: [
      "Fondée en 1998 à Mfou (Mefou-et-Afamba, région du Centre) par Roger Noah, l'AS Fortuna s'est fait connaître comme un club formateur. Elle a notamment vu passer André-Frank Zambo Anguissa et Léonel Ateba. Le club compte aussi une équipe féminine.",
      "Promue en Elite One en 2018, elle termine 14e de sa première saison, puis s'installe rapidement dans le haut du tableau : 4e en 2019 et en 2020, puis 3e en 2020-2021, son meilleur classement. En Coupe du Cameroun 2024, elle est éliminée en quart de finale par Mintack FC, alors en ligue régionale (0-1).",
      "Le 3 septembre 2024, son fondateur et président Roger Noah meurt à 56 ans, une perte immense pour le club.",
      "En 2025-2026, Fortuna termine 13e de l'Elite One et doit disputer un barrage contre le 2e des play-offs d'Elite Two, son voisin de l'APEJES de Mfou. Battue 2-0 le 1er juillet 2026, elle descend en Elite Two.",
    ],
    palmares: [],
    sources: [
      'https://en.wikipedia.org/wiki/AS_Fortuna',
      'https://kick442.com/?p=19857',
      'https://yop.l-frii.com/cameroun-en-pleine-tension-avec-letat-la-fecafoot-annonce-le-deces-de/',
      'https://cameroon-tribune.cm/article.html/65413/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/78313/fr.html/details_2',
    ],
  },

  'gazelle': {
    nomComplet: 'Gazelle Football Academy de Garoua',
    alias: ['gazelle fa', 'gazelle fa de garoua', 'gazelle garoua', 'gazelle football academy'],
    ville: 'Garoua',
    fondation: 2015,
    couleurs: 'Bleu ciel et blanc',
    stade: 'Stade Roumdé-Adjia',
    siteWeb: 'https://gazellefa-officiel.com/',
    histoire: [
      "Créée en 2015 à Garoua, dans la région du Nord, Gazelle FA (Gazelle Football Academy) s'est donné pour mission de structurer et de professionnaliser la formation des jeunes talents du Nord-Cameroun. Sa devise : « Plus vite, plus haut, plus fort ».",
      "Le club monte très vite les échelons : champion départemental en 2017, champion régional du Nord en 2018, 2019 et 2021, puis vainqueur de sa poule aux interpoules nationales de 2021, qui lui ouvrent les portes de l'Elite Two.",
      "Pour sa première saison en deuxième division, il réalise un parcours exceptionnel : le 5 juillet 2022, au stade Roumdé-Adjia, les hommes de l'entraîneur Alioum Kada remportent la finale de l'Elite Two face à l'Aigle Royal de la Menoua (2-1) et montent en Elite One.",
      "Promu, Gazelle FA bouscule aussitôt la hiérarchie en se qualifiant dès sa première saison pour les play-offs du titre (2022-2023). En 2024-2025, le club termine 3e de l'Elite One, porté par son attaquant Serge Daura, meilleur buteur du championnat (15 buts) et Ballon d'Or camerounais 2025.",
      "Partageant le stade Roumdé-Adjia avec Coton Sport, Gazelle FA a donné naissance à un nouveau derby à Garoua, le « Garouassico ».",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: ['2021-22'] },
      { competition: 'Interpoules nationales', type: 'titre', annees: [2021] },
      { competition: 'Championnat régional du Nord', type: 'titre', annees: [2018, 2019, 2021] },
      { competition: 'Championnat départemental', type: 'titre', annees: [2017] },
    ],
    grandsJoueurs: ['Serge Daura'],
    sources: [
      'https://cameroon-tribune.cm/article.html/49492/fr.html/mtn-elite-two-gazelle-fa',
      'https://gazellefa-officiel.com/a-propos/',
      'https://cameroon-tribune.cm/article.html/57085/fr.html/details_2',
    ],
  },

  'panthère': {
    nomComplet: 'Panthère Sportive du Ndé',
    alias: ['panthere', 'panthere du nde', 'panthere sportive du nde', 'panthere sportive du nde fc'],
    surnom: 'Nzuimanto (« la panthère » en langue locale), le Fauve du Ndé',
    ville: 'Bangangté',
    fondation: 1952,
    couleurs: 'Vert et jaune',
    stade: 'Stade municipal de Bangangté',
    histoire: [
      "Fondée en 1952 à Bangangté, dans le département du Ndé, la Panthère Sportive s'impose vite dans la région et devient, après l'indépendance, l'un des porte-étendards du football de l'Ouest.",
      "En 1988, Nzuimanto entre dans l'histoire en remportant la Coupe du Cameroun face au grand rival régional, le Racing de Bafoussam (1-0) : c'est le premier club de l'Ouest à soulever ce trophée.",
      "Après un passage en deuxième division, le club revient au premier plan en 2009 avec une deuxième Coupe du Cameroun, gagnée 3-2 face aux Astres de Douala. Il confirme sa régularité en disputant deux finales consécutives, en 2014 et en 2015.",
      "Revenue d'Elite Two, la Panthère vit une saison 2024-2025 exceptionnelle sous l'impulsion de sa présidente d'honneur Célestine Ketcha Courtès : vice-championne d'Elite One derrière la Colombe, elle remporte le 14 décembre 2025 sa troisième Coupe du Cameroun face à cette même Colombe (1-1, 3-1 aux tirs au but). En février 2026, le Trophée des champions qui les oppose de nouveau est interrompu ; la FECAFOOT donne la victoire à la Panthère sur tapis vert (3-0).",
      "Le club a formé ou révélé de nombreux internationaux camerounais et a représenté le Cameroun en Coupe d'Afrique des vainqueurs de coupe et en Coupe de la Confédération de la CAF.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1988, 2009, 2025] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2026] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2014, 2015] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['2024-25'], libelle: 'Vice-champion' },
    ],
    grandsJoueurs: ['Guy-Noël Tapoko', 'Charley Fomen', 'Franck Kom', 'Richard Towa'],
    sources: [
      'https://en.wikipedia.org/wiki/Panth%C3%A8re_Sportive_du_Nd%C3%A9_FC',
      'https://rsssf.org/tablesk/kamcuphist.html',
      'https://www.cameroon-tribune.cm/article.html/75476/fr.html/details_2',
    ],
  },

  'pwd bamenda': {
    nomComplet: 'PWD Social Club de Bamenda',
    alias: ['pwd', 'pwd social club bamenda', 'pwd social club de bamenda', 'pwd de bamenda', 'pwd social football club'],
    surnom: 'Abakwa Boys (du nom historique de Bamenda)',
    ville: 'Bamenda',
    fondation: 1962,
    couleurs: 'Bleu et blanc',
    histoire: [
      "Créé en 1962 à Bamenda, dans le Nord-Ouest, sous le parrainage du département des Travaux publics (Public Works Department, d'où le sigle PWD), le club devient rapidement l'un des porte-étendards du Cameroun anglophone.",
      "Les Abakwa Boys atteignent la finale de la Coupe du Cameroun dès 1967 (défaite 1-0 contre le Canon de Yaoundé), puis en 1979 (revers 3-1 face au Dynamo de Douala).",
      "Après des années difficiles, le club renaît à la fin des années 2010. Arrivé en septembre 2019 en pleine crise dans les régions anglophones, l'entraîneur David Pagou mène PWD au premier titre de champion du Cameroun de son histoire en 2019-2020. Le club découvre alors la Ligue des champions de la CAF, où il est éliminé de justesse par les Sud-Africains de Kaizer Chiefs (0-1 au total).",
      "Le 13 mars 2022, au stade Ahmadou-Ahidjo de Yaoundé, PWD brise la malédiction des finales en remportant sa première Coupe du Cameroun (édition 2021), 1-0 face aux Astres de Douala, l'année de ses 60 ans.",
      "Le club confirme sa régularité en disputant une nouvelle finale de Coupe en 2023, perdue face à Fovu de Baham, et se maintient en Elite One.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['2019-20'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2021] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1967, 1979, 2023] },
    ],
    grandsJoueurs: ['Augustine Simo'],
    sources: [
      'https://en.wikipedia.org/wiki/PWD_Bamenda',
      'https://en.wikipedia.org/wiki/Augustine_Simo',
      'https://en.wikipedia.org/wiki/Cameroonian_Cup',
      'https://newframe.org/?p=21432',
      'https://www.hilltopvoices.com/2022/03/cameroon-cup-2021-pwd-defies.html',
    ],
  },

  'stade renard': {
    nomComplet: 'Stade Renard FC de Melong',
    alias: ['stade renard de melong', 'stade renard fc de melong', 'stade renard melong'],
    surnom: 'Les Renards',
    ville: 'Melong',
    couleurs: 'Vert et blanc',
    stade: 'Stade municipal de Melong',
    histoire: [
      "Club de Melong, dans le Moungo (région du Littoral), le Stade Renard existe déjà à la fin des années 1960 : en 1969, il évolue en deuxième division, et c'est chez lui qu'un jeune Michel Kaham signe sa première licence avant de briller avec l'Aigle Royal de Nkongsamba.",
      "Après une longue période discrète, le club est relancé au début des années 2010 sous l'impulsion de dirigeants locaux, dont le maire de Melong, Jean Kuete. Parti de la ligue régionale du Littoral, il grimpe les échelons en trois saisons et remporte le championnat de Ligue 2 en 2016, synonyme d'accession à l'élite. Le stade municipal de Melong est rénové pour accompagner ce retour au premier plan.",
      "2019 reste l'année la plus faste de son histoire : le Stade Renard remporte la Coupe du Cameroun (3-2 en finale face à l'AS FAP de Yaoundé, au stade Ahmadou-Ahidjo), puis la Super Coupe Roger Milla en octobre (3-1 contre l'UMS de Loum).",
      "Installé durablement en Elite One, le club joue le titre en 2023-2024 : lors de la dernière journée des play-offs, un nul 2-2 contre Victoria United offre le titre à ce dernier, et le Stade Renard termine 3e, à égalité de points avec Coton Sport.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2019] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2019] },
      { competition: 'Elite Two', type: 'titre', annees: [2016] },
    ],
    sources: [
      'https://fr.wikipedia.org/wiki/Stade_Renard_de_Melong',
      'https://rsssf.org/tablesk/kamsupcuphist.html',
      'https://en.wikipedia.org/wiki/Cameroonian_Cup',
      'https://cameroon-tribune.cm/articles/9356/fr/details_2',
    ],
  },

  'unisport bafang': {
    nomComplet: 'Unisport Football Club du Haut-Nkam',
    alias: ['unisport', 'unisport de bafang', 'unisport fc de bafang', 'unisport du haut-nkam', 'unisport fc du haut-nkam'],
    surnom: "Flambeau de l'Ouest",
    ville: 'Bafang',
    fondation: 1959,
    couleurs: 'Jaune et rouge',
    stade: 'Stade municipal de Bafang',
    histoire: [
      "Le club naît en 1958 de l'union de trois équipes du Haut-Nkam (Jupiter FC, l'Union de la Mission catholique et Tortue FC) et est officiellement déclaré le 2 octobre 1959, sous l'impulsion d'Antoine Kouenkam, ancien joueur de la première sélection camerounaise.",
      "Présent de longue date parmi l'élite, l'Unisport termine vice-champion du Cameroun en 1993, à un point du Racing de Bafoussam, avant d'entrer dans la légende en 1996 : sacré champion du Cameroun, il brise l'hégémonie des clubs de Douala et de Yaoundé et dispute la Ligue des champions de la CAF l'année suivante.",
      "Dans les années 2000, le « Flambeau de l'Ouest » devient un habitué des finales de Coupe du Cameroun. Après trois finales perdues (2000, 2005 et 2011, cette dernière aux tirs au but face à Coton Sport), il brise enfin la malédiction en 2012 en battant New Star de Douala (2-0).",
      "Relégué en Elite Two en 2019, le club y passe six saisons avant de retrouver l'élite lors des play-offs de juin 2025. Pour son retour en Elite One, en 2025-2026, il crée la sensation en occupant longtemps la tête du championnat, et termine finalement 3e.",
      "Le club est réputé pour l'ambiance de son stade à Bafang et pour ses derbys de l'Ouest face au Racing de Bafoussam ou à l'Aigle de la Menoua. Il a vu passer de nombreux talents camerounais.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1996] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2012] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: [1993], libelle: 'Vice-champion' },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2000, 2005, 2011] },
    ],
    grandsJoueurs: ['Raymond Kalla', 'Alphonse Tchami', 'Pierre Boya', 'Bonaventure Djonkep'],
    sources: [
      'https://en.wikipedia.org/wiki/Unisport_FC_de_Bafang',
      'https://rsssf.org/tablesk/kamchamp.html',
      'https://rsssf.org/tablesk/kam93.html',
      'https://rsssf.org/tablesk/kamcuphist.html',
    ],
  },

  'victoria united': {
    nomComplet: 'Victoria United Football Club',
    alias: ['victoria united fc', 'victoria united limbe', 'opopo'],
    surnom: 'OPOPO (One People, One Power)',
    ville: 'Limbé',
    fondation: 2002,
    couleurs: 'Noir et blanc',
    stade: 'Stade omnisports de Limbé',
    histoire: [
      "Basé à Limbé (l'ancienne Victoria), sur la côte du Sud-Ouest, le club puise ses racines dans le football local et prend sa forme actuelle en 2002. Son surnom, « OPOPO », signifie « One People, One Power ».",
      "Après une première expérience parmi l'élite, Victoria United est relégué en 2004 et entame une longue traversée de près de vingt ans dans les divisions inférieures.",
      "Sous l'impulsion de son président Valentine Nkwain, dit « Bobdidy », le club renaît au début des années 2020 : champion régional du Sud-Ouest, il monte en Elite Two, puis la survole en 2022-2023 et retrouve l'élite.",
      "Pour son retour, OPOPO déjoue tous les pronostics : le 18 avril 2024, un nul 2-2 face au Stade Renard de Melong, lors des play-offs à Douala, lui offre le premier titre de champion du Cameroun de son histoire.",
      "La même saison, le jeune milieu de terrain du club Wilfried Nathan Douala est appelé par les Lions Indomptables pour la CAN 2023 en Côte d'Ivoire.",
      "Ce sacre lui ouvre les portes de la Ligue des champions de la CAF 2024-2025, où il dispute les tours préliminaires. Le club s'est depuis installé en Elite One.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['2023-24'] },
      { competition: 'Elite Two', type: 'titre', annees: ['2022-23'] },
      { competition: 'Super Coupe Roger Milla', type: 'finale', annees: [2024] },
    ],
    grandsJoueurs: ['Wilfried Nathan Douala'],
    sources: [
      'https://en.wikipedia.org/wiki/Victoria_United_FC_(Cameroon)',
      'https://en.wikipedia.org/wiki/Wilfried_Nathan_Douala',
      'https://cameroon-tribune.cm/articles/9344/en/details_2',
    ],
  },
  // ═══════════════════════════ MTN ELITE TWO ═══════════════════════════

  'tonnerre': {
    nomComplet: 'Tonnerre Kalara Club de Yaoundé',
    alias: ['tonnerre yaounde', 'tonnerre kalara club', 'tonnerre kalara club de yaounde', 'tkc'],
    surnom: 'Les Kalara Boys',
    ville: 'Yaoundé (Mvog-Ada)',
    fondation: 1934,
    couleurs: 'Noir et blanc',
    stade: 'Stade Ahmadou-Ahidjo',
    histoire: [
      "Le Tonnerre Kalara Club est fondé en 1934 à Yaoundé par Martin Omgba Zing, l'un des fondateurs du Canon, parti après des désaccords internes. « Kalara » signifie « le livre » en ewondo : le nouveau club devait être le livre qui apprendrait le football au Canon. De cette scission naît le derby de la capitale, l'un des plus passionnés du pays.",
      "Le club du quartier Mvog-Ada entre dans l'histoire en 1975 en remportant la toute première Coupe d'Afrique des vainqueurs de coupe, face au Stella Club d'Adjamé (1-0 à Abidjan, 4-1 à Yaoundé). Il retrouve la finale dès l'année suivante, perdue contre les Shooting Stars du Nigeria.",
      "Les années 1980 sont son âge d'or : cinq titres de champion entre 1981 et 1988, et des Coupes du Cameroun en 1987, 1989 et 1991. En 1989, il atteint les demi-finales de la Coupe d'Afrique des clubs champions, éliminé par le Raja de Casablanca.",
      "Le TKC a vu passer de grands noms : Roger Milla (1974-1977, puis 1990-1994), Stephen Tataw, Rigobert Song, Jean II Makoun, le Tchadien Japhet N'Doram et le Libérien George Weah (1987-1988), futur Ballon d'or, que Claude Le Roy recommande ensuite à l'AS Monaco.",
      "En 2002, il dispute encore une finale continentale, celle de la Coupe de la CAF. Il traverse ensuite de longues crises de direction et de finances. Aujourd'hui en Elite Two, il assure son maintien lors des play-offs de maintien de la saison 2025-2026.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1981, '1982-83', '1983-84', '1986-87', '1987-88'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1958, 1974, 1987, 1989, 1991] },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'titre', annees: [1975], continental: true },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'finale', annees: [1976], continental: true },
      { competition: 'Coupe de la CAF', type: 'finale', annees: [2002], continental: true },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1963, 1990, 1994] },
    ],
    grandsJoueurs: ['Roger Milla', 'George Weah', 'Rigobert Song', 'Stephen Tataw', 'Jean II Makoun', "Japhet N'Doram"],
    sources: [
      'https://en.wikipedia.org/wiki/Tonnerre_Yaound%C3%A9',
      'https://www.cameroon-tribune.cm/articles/11068/en/details_2',
      'https://www.the-star.co.ke/sports/football/2022-01-12-the-captivating-names-of-cameroons-football-clubs/',
      'https://rsssf.org/tablesa/afcup75.html',
      'https://rsssf.org/tablesa/afcup89.html',
      'https://rsssf.org/tablesk/kamchamp.html',
      'https://cameroon-tribune.cm/article.html/78013/fr.html/details_2',
    ],
  },

  'union douala': {
    nomComplet: 'Union Sportive de Douala',
    alias: ['union sportive de douala', 'us douala', 'union sportive douala'],
    surnom: 'Les Nassaras Kamakaï',
    ville: 'Douala',
    stade: 'Stade de la Réunification',
    histoire: [
      "Né sous le nom de Jeunesse Bamiléké, l'Union Sportive de Douala est l'un des clubs les plus prestigieux du pays.",
      "Il est l'un des rares clubs camerounais à avoir remporté deux compétitions africaines : la Coupe d'Afrique des clubs champions en 1979, face à Hearts of Oak, puis la Coupe d'Afrique des vainqueurs de coupe en 1981.",
      "Cinq fois champion du Cameroun, de 1969 à 2012, l'Union a aussi soulevé six Coupes du Cameroun depuis l'indépendance.",
      "Le 9 juin 2025, le club connaît la première relégation de son histoire en Elite Two (15e). La saison suivante, il passe par les play-offs de maintien, puis doit disputer les Interpoules 2026 pour tenter d'éviter une nouvelle descente.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1969, '1975-76', '1977-78', '1989-90', '2011-12'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1961, 1969, 1980, 1985, 1997, 2006] },
      { competition: "Coupe d'Afrique des clubs champions", type: 'titre', annees: [1979], continental: true },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'titre', annees: [1981], continental: true },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1962, 1978, 1981, 1983, 1984, 2004] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Union_Douala', 'https://en.wikipedia.org/wiki/1979_African_Cup_of_Champions_Clubs', 'https://rsssf.org/tablesk/kamchamp.html', 'https://rsssf.org/tablesk/kamcuphist.html', 'https://cameroon-tribune.cm/article.html/79123/fr.html/details_2'],
  },

  'racing': {
    nomComplet: 'Racing Club de Bafoussam',
    alias: ['racing fc', 'racing bafoussam', 'racing club de bafoussam', 'rc bafoussam', 'racing fc bafoussam'],
    ville: 'Bafoussam',
    stade: 'Stade municipal de Bamendzi',
    histoire: [
      "Le Racing Club de Bafoussam est le grand club de la région de l'Ouest à la fin des années 1980 et dans les années 1990.",
      "Il remporte quatre titres de champion du Cameroun (1989, 1992, 1993 et 1995), dispute cinq fois la Ligue des champions de la CAF et gagne la Coupe du Cameroun en 1996, après trois finales perdues.",
      "Le club a notamment formé Geremi Njitap, futur joueur du Real Madrid et de Chelsea. Après des années difficiles, il remporte l'Elite Two en 2020-2021. En mai 2026, dernier de sa poule d'Elite Two, il est relégué en ligue régionale.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['1988-89', 1992, 1993, 1995] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1996] },
      { competition: 'Elite Two', type: 'titre', annees: ['2020-21'] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1976, 1988, 1991] },
    ],
    grandsJoueurs: ['Geremi Njitap'],
    sources: ['https://en.wikipedia.org/wiki/RC_Bafoussam', 'https://rsssf.org/tablesk/kamchamp.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'les astres': {
    nomComplet: 'Les Astres Football Club de Douala',
    alias: ['les astres fc', 'astres', 'astres de douala', 'les astres de douala'],
    surnom: 'Les Brésiliens de Bépanda',
    ville: 'Douala',
    fondation: 2002,
    stade: 'Stade de la Réunification',
    histoire: [
      "Fondé en 2002 dans le quartier de Bépanda, à Douala, le club est surnommé « les Brésiliens de Bépanda » pour son jeu tourné vers l'attaque.",
      "Il s'installe vite parmi les meilleurs clubs du pays : trois fois vice-champion du Cameroun (2009-2010, 2010-2011 et 2013) et quatre fois finaliste de la Coupe du Cameroun (2007 contre Coton Sport, 2009 contre la Panthère du Ndé, puis 2010 et 2021), sans jamais soulever le trophée.",
      "Ces résultats lui ouvrent les compétitions africaines à six reprises : la Coupe de la Confédération en 2006, 2007 (jusqu'à la phase de groupes) et 2008, puis la Ligue des champions en 2011, 2012 et 2014. Le club a aussi vu passer de futurs internationaux, comme le latéral Ernest Mabouka.",
      "Champion d'Elite Two en 2019-2020, il retrouve l'élite, puis redescend à l'issue de la saison 2024-2025. En 2025-2026, il se qualifie pour les play-offs d'accession, remportés par l'Union sportive d'Abong-Mbang.",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: ['2019-20'] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['2009-10', '2010-11', 2013], libelle: '3 fois vice-champion' },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2007, 2009, 2010, 2021] },
    ],
    sources: [
      'https://en.wikipedia.org/wiki/Les_Astres_FC',
      'https://en.wikipedia.org/wiki/Cameroonian_Cup',
      'https://cameroon-tribune.cm/article.html/46603/fr.html/details_2',
      'https://rsssf.org/tablesa/afcup2011.html',
      'https://rsssf.org/tablesa/afcup2012.html',
      'https://au.soccerway.com/cameroon/elite-two-2020-2021/archive',
      'https://cameroon-tribune.cm/article.html/77916/fr.html/details_2',
    ],
  },

  'bamboutos': {
    nomComplet: 'Bamboutos FC de Mbouda',
    alias: ['bamboutos fc', 'bamboutos de mbouda', 'bamboutos fc de mbouda', 'bamboutos football club de mbouda'],
    surnom: "Les Mangwa Boys, le Fer de l'Ouest",
    ville: 'Mbouda',
    fondation: 1966,
    couleurs: 'Rouge et bleu',
    stade: 'Stade de Mbouda',
    histoire: [
      "Fondé en 1966 à Mbouda, chef-lieu du département des Bamboutos (région de l'Ouest), le club porte le nom des monts qui dominent la région. Surnommé les « Mangwa Boys » ou le « Fer de l'Ouest », il est l'un des clubs les plus populaires du Cameroun.",
      "Présent en première division au début des années 2000, il termine 3e du championnat en 2002. En 2004, il remporte la toute première Coupe UNIFFAC des clubs (Afrique centrale) face au FC 105 de Libreville : battu 2-1 à l'aller, il s'impose 2-1 au retour à Douala, puis 6-5 aux tirs au but.",
      "En Coupe du Cameroun, il dispute deux finales sans parvenir à la gagner : en 2016 contre l'APEJES de Mfou (0-2), puis le 2 octobre 2022 contre Coton Sport (0-1). Trois semaines plus tard, le 22 octobre 2022 à Bafoussam, il prend sa revanche en battant Coton Sport 1-0 lors de la première édition du Trophée des champions (Super Coupe). En 2023, il termine vice-champion du Cameroun.",
      "La saison 2024-2025 est agitée : en avril 2025, en conflit avec la FECAFOOT, le club annonce son retrait du championnat. Il termine finalement 13e et descend en Elite Two avec les Astres, l'Union de Douala et Yong Sports Academy.",
      "En Elite Two, il dispute les play-offs de maintien en 2025-2026, puis lance la saison 2026-2027 avec deux victoires à domicile : 2-0 contre Fauve Azur et 3-0 contre le Tonnerre Kalara Club.",
    ],
    palmares: [
      { competition: 'Coupe UNIFFAC des clubs', type: 'titre', annees: [2004], continental: true },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2022] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['2022-23'], libelle: 'Vice-champion' },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2016, 2022] },
    ],
    sources: [
      'https://rsssf.org/tablesu/uniffac04.html',
      'https://rsssf.org/tablesk/kamcuphist.html',
      'https://rsssf.org/tablesk/kam02.html',
      'https://en.wikipedia.org/wiki/Super_Coupe_Roger_Milla',
      'https://cameroon-tribune.cm/article.html/52033/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/71318/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/82257/fr.html/details_2',
    ],
  },

  'eding sport': {
    nomComplet: 'Eding Sport FC de la Lékié',
    alias: ['eding sport fc', 'eding sport de la lekie', 'eding'],
    ville: 'Yaoundé (Lékié)',
    fondation: 2012,
    histoire: [
      "Créé en 2012 et attaché au département de la Lékié, Eding Sport est l'une des belles réussites récentes du football camerounais.",
      "Quelques années seulement après sa création, il devient champion du Cameroun en 2017, puis enchaîne avec la Coupe du Cameroun en 2018, face au Lion Blessé de Fotouni.",
      "En mai 2026, dernier de sa poule d'Elite Two, le club est relégué en ligue régionale du Centre.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [2017] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2018] },
    ],
    sources: ['https://rsssf.org/tablesk/kamchamp.html', 'https://rsssf.org/tablesk/kamfound.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'sable': {
    nomComplet: 'Sable FC de Batié',
    alias: ['sable fc', 'sable de batie', 'sable fc de batie', 'sable batie'],
    surnom: 'Les San San Boys',
    ville: 'Batié',
    fondation: 1995,
    couleurs: 'Jaune et bleu',
    stade: 'Stade de Bamendzi (Bafoussam)',
    histoire: [
      "Fondé en 1995 à Batié, dans le département des Hauts-Plateaux (région de l'Ouest), le Sable FC, surnommé les « San San Boys », connaît une ascension fulgurante : quatre ans seulement après sa création, il est sacré champion du Cameroun en 1999, devant Coton Sport. Il remporte aussi la Super Coupe Roger Milla de cette saison, 1-0 contre le Canon de Yaoundé, le 12 janvier 2000.",
      "Ce titre lui ouvre la Ligue des champions de la CAF 2000, où il atteint la phase de groupes. En Coupe du Cameroun, il dispute deux finales d'affilée sans les gagner : en 2002 contre Mount Cameroon (1-2 après prolongation), puis en 2003 contre Coton Sport (1-2). En 2004, il atteint la phase de groupes de la Coupe de la Confédération de la CAF.",
      "Le club finit par quitter l'élite et redescend jusqu'en ligue régionale de l'Ouest. En 2025, il remporte la finale des barrages de l'Ouest contre le Piment de Bayangam (3-1), puis obtient aux Interpoules sa remontée en Elite Two, avant de perdre la finale face à Kumba City (3-4 après prolongation).",
      "Pour son retour en Elite Two, le club confie son banc à l'expérimenté Alexandre Belinga et reçoit ses adversaires au stade de Bamendzi, à Bafoussam.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1999] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [1999] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2002, 2003] },
      { competition: 'Interpoules nationales', type: 'finale', annees: [2025] },
    ],
    sources: [
      'https://rsssf.org/tablesk/kam99.html',
      'https://rsssf.org/tablesk/kamsupcuphist.html',
      'https://rsssf.org/tablesk/kamcuphist.html',
      'https://en.wikipedia.org/wiki/Sable_FC_(Cameroon)',
      'https://cameroun24.net/article/70685-interpoules-2025-kumba-city-sacr-champion-au-bout-du-suspense-sable-de-bati-aussi-promu.html',
      'https://kick442.com/?p=24903',
    ],
  },

  'apejes academy': {
    nomComplet: 'APEJES Football Académie de Mfou',
    alias: ['apejes', 'apejes fa', 'apejes football academie', 'apejes de mfou', 'apejes academy mfou'],
    surnom: 'Les Académiciens',
    ville: 'Mfou',
    fondation: 2006,
    couleurs: 'Bleu et blanc',
    histoire: [
      "Créée en 2006 à Mfou, près de Yaoundé, l'APEJES est d'abord une académie de formation. Elle gravit rapidement les échelons du football camerounais jusqu'à l'Elite One.",
      "En 2016, les Académiciens remportent le premier trophée majeur de leur histoire : la Coupe du Cameroun, gagnée 2-0 en finale face aux Bamboutos de Mbouda, synonyme de qualification pour la Coupe de la Confédération de la CAF.",
      "Lors de la saison 2020-2021, l'APEJES passe tout près d'un premier titre de champion : qualifiée pour la finale des play-offs, elle s'incline face à Coton Sport et termine vice-championne du Cameroun.",
      "Reléguée en Elite Two à l'issue de la saison 2023-2024, elle y passe deux saisons avant de retrouver l'Elite One le 1er juillet 2026, grâce à une victoire 2-0 en barrage contre son voisin, l'AS Fortuna de Mfou.",
      "Fidèle à sa vocation, le club reste l'un des meilleurs centres de formation du pays.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2016] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['2020-21'], libelle: 'Vice-champion' },
    ],
    sources: [
      'https://rsssf.org/tablesk/kamfound.html',
      'https://en.wikipedia.org/wiki/Cameroonian_Cup',
      'https://fecafoot-officiel.com/?p=19966',
      'https://cameroon-tribune.cm/article.html/78313/fr.html/details_2',
    ],
  },

  'fap': {
    nomComplet: 'AS Forces armées et police de Yaoundé (AS FAP)',
    alias: ['as fap', 'as fap yaounde', 'fap yaounde', 'forces armees et police'],
    ville: 'Yaoundé',
    couleurs: 'Vert, rouge et jaune',
    histoire: [
      "L'AS FAP est la section football des Forces armées et police (FAP), l'institution sportive des militaires et des policiers camerounais créée en 1972 à Yaoundé. Les FAP sont présentes dans de nombreux sports, où elles comptent parmi les références du pays, en basket-ball, handball ou athlétisme. Leur équipe féminine de football, les Amazones FAP, est l'une des meilleures du Cameroun.",
      "Le 30 juin 2019, l'AS FAP dispute la première finale de Coupe du Cameroun de son histoire, au stade Ahmadou-Ahidjo de Yaoundé. Sous une pluie battante, elle s'incline 3-2 face au Stade Renard de Melong.",
      "Le club évolue ensuite en Elite Two. En 2025-2026, il passe par les play-offs de maintien et conserve sa place dans le championnat.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2019] },
    ],
    sources: [
      'https://rsssf.org/tablesk/kamcuphist.html',
      'https://africtelegraph.com/coupe-du-cameroun-de-football',
      'https://fr.journalducameroun.com/coupe-du-cameroun-le-premier-ministre-preside-la-finale-ce-dimanche-cameroun/',
      'https://bal.nba.com/teams/f-a-p-cameroon?view=team',
      'https://cameroon-tribune.cm/article.html/33804/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/78013/fr.html/details_2',
    ],
  },

  'avion academy': {
    nomComplet: 'Avion Academy FC du Nkam',
    alias: ['avion academy fc', 'avion', 'avion du nkam', 'avion fc nkam', 'avion academy du nkam'],
    ville: 'Douala',
    fondation: 2012,
    histoire: [
      "Fondé en 2012 et rattaché au département du Nkam (région du Littoral), Avion Academy FC est présidé depuis sa création par Pierre Batamack, figure bien connue du football à Douala.",
      "Champion d'Elite Two en 2018, le club découvre l'Elite One en 2019, où il termine 11e de sa première saison. Il reste dans l'élite jusqu'en 2024, puis redescend à l'issue des play-offs de maintien de la saison 2023-2024.",
      "De retour en Elite Two, il fait partie des prétendants à la montée : leader de son groupe en début de saison 2024-2025, il dispute ensuite les play-offs d'accession, sans monter. Il les retrouve en 2025-2026 et signe notamment une large victoire contre Kumba City (6-1), mais termine derrière l'Union sportive d'Abong-Mbang, sacrée championne.",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: [2018] },
    ],
    sources: [
      'https://www.cameroon-tribune.cm/article.html/23791/fr.html/details_2',
      'https://ca.soccerway.com/cameroon/elite-two-2019/archive',
      'https://www.national-football-teams.com/club/22540/2019_2/Avion_Fc_Nkam.html',
      'https://cameroon-tribune.cm/article.html/64735/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/68578/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/77916/fr.html/details_2',
      'https://rsssf.org/tablesk/kamfound.html',
    ],
  },

  'union abong-mbang': {
    nomComplet: "Union Sportive d'Abong-Mbang",
    alias: ['union abong mbang', 'us abong mbang', 'union sportive abong mbang', "union sportive d'abong-mbang", 'usa abong-mbang'],
    surnom: 'USA',
    ville: 'Abong-Mbang',
    fondation: 1954,
    couleurs: 'Jaune et noir',
    histoire: [
      "Fondée en 1954 à Abong-Mbang, chef-lieu du Haut-Nyong, l'Union Sportive (USA) est le club emblématique de la région de l'Est.",
      "Après avoir représenté l'Est parmi l'élite, le club quitte la première division à la fin des années 1990 et entame une longue traversée de 27 ans entre la deuxième division et les championnats régionaux.",
      "Double champion régional de l'Est, il remonte en Elite Two grâce aux interpoules nationales.",
      "En 2025-2026, sous la direction de l'entraîneur Basile Anyam, l'USA réalise une saison remarquable : le 17 juin 2026, une victoire 1-0 sur le terrain d'Atlantic de Kribi lui assure la montée en Elite One, puis elle est sacrée championne d'Elite Two trois jours plus tard, après un nul 1-1 contre Les Astres de Douala.",
      "Pour son retour parmi l'élite, 27 ans après, le club ouvre la saison 2026-2027 de l'Elite One à Bertoua par un match nul spectaculaire face au Stade Renard de Melong (2-2).",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: ['2025-26'] },
    ],
    sources: [
      'https://rsssf.org/tablesk/kamfound.html',
      'https://cameroon-tribune.cm/article.html/77916/fr.html/details_2',
      'https://kick442.com/?p=18325',
    ],
  },

  'yafoot': {
    nomComplet: 'Yafoot FC (Yaoundé FC II)',
    alias: ['yafoot fc', 'yaounde fc ii', 'fc yaounde ii'],
    ville: 'Yaoundé',
    histoire: [
      "Yafoot, aussi appelé Yaoundé FC II, est un club de la capitale. Après plusieurs saisons en Elite Two, il termine 7e des play-offs de maintien en juin 2026 et descend en Super Ligue régionale.",
    ],
    palmares: [],
    sources: ['https://cameroon-tribune.cm/article.html/71249/fr.html/details_2', 'https://cameroon-tribune.cm/article.html/78013/fr.html/details_2'],
  },

  'foncha st': {
    nomComplet: 'Foncha Street FC',
    alias: ['foncha street', 'foncha street fc'],
    ville: 'Bamenda',
    histoire: [
      "Club de Bamenda, dans le Nord-Ouest, Foncha Street a été sacré champion régional du Nord-Ouest, ce qui lui a ouvert les portes de l'Elite Two.",
    ],
    palmares: [],
    sources: ['https://fecafoot-officiel.com/?p=12019', 'https://www.hilltopvoices.com/2022/02/elite-two-championship-resurrected.html'],
  },

  'bafmeng united': {
    nomComplet: 'Bafmeng United FA',
    alias: ['bafmeng united fa', 'bafmeng'],
    ville: 'Bafmeng',
    histoire: [
      "Club du Nord-Ouest, Bafmeng United termine deuxième des Interpoules nationales 2023, derrière l'ISOSHA, et décroche ainsi sa montée en Elite Two.",
    ],
    palmares: [],
    sources: ['https://www.hilltopvoices.com/search/label/National%20Interpools'],
  },


  // ── Clubs ajoutés avec les saisons 2022 à 2026-27 ─────────────────────

  'fovu club': {
    nomComplet: 'Fovu Club de Baham',
    alias: ['fovu', 'fovu de baham', 'fovu club de baham', 'racing fovu'],
    ville: 'Baham',
    fondation: 1978,
    stade: 'Stade de Baham',
    histoire: [
      "Fondé le 17 novembre 1978 à Baham, dans l'Ouest, le Fovu Club tire son nom d'une grotte sacrée de la région.",
      "Champion du Cameroun en 2000, il découvre la Ligue des champions de la CAF en 2001, puis la Coupe des vainqueurs de coupe en 2002 et la Coupe de la Confédération en 2011.",
      "Le Fovu est surtout un spécialiste de la Coupe du Cameroun : vainqueur en 2001, 2010 et 2023, finaliste en 2006.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [2000] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2001, 2010, 2023] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2006] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Fovu_Club', 'https://en.wikipedia.org/wiki/Cameroonian_Cup', 'https://rsssf.org/tablesk/kamchamp.html'],
  },

  'ums de loum': {
    nomComplet: 'Union des Mouvements Sportifs de Loum',
    alias: ['ums', 'ums loum', 'union des mouvements sportifs de loum'],
    surnom: 'UMS',
    ville: 'Loum',
    fondation: 2011,
    stade: 'Stade de Njombé',
    histoire: [
      "Créée en 2011 à Loum, dans le Moungo, l'UMS a connu une ascension express jusqu'au sommet du football camerounais.",
      "Le club remporte la Coupe du Cameroun en 2015 en battant Panthère du Ndé (2-0), puis devient champion du Cameroun en 2016 et en 2019. Il dispute une nouvelle finale de Coupe en 2017.",
      "Ces titres lui ouvrent les portes des compétitions africaines : Ligue des champions et Coupe de la Confédération de la CAF.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [2016, 2019] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2015] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2017] },
    ],
    sources: ['https://en.wikipedia.org/wiki/UMS_de_Loum', 'https://en.wikipedia.org/wiki/Cameroonian_Cup', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'young sport academy': {
    nomComplet: 'Yong Sports Academy',
    alias: ['yong sports academy', 'young sports academy', 'yosa', 'yosa bamenda', 'yosa fc'],
    surnom: 'YOSA',
    ville: 'Bamenda',
    fondation: 2004,
    stade: 'Stade municipal de Bamenda',
    histoire: [
      "Fondée en 2004 à Bamenda par Yong Francis, ancien arbitre, la Yong Sports Academy a longtemps été le seul club de première division du Nord-Ouest.",
      "Son plus grand exploit : la Coupe du Cameroun 2013, remportée aux tirs au but face au Canon de Yaoundé (0-0, 4 t.a.b. à 1).",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2013] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Yong_Sports_Academy', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'jeunes fauves': {
    nomComplet: 'Fauve Azur Elite FC de Yaoundé',
    alias: ['fauve azur elite', 'fauve azur', 'fauve azur elite fc', 'fauve azur de yaounde'],
    ville: 'Yaoundé',
    couleurs: 'Jaune et vert',
    stade: 'Stade Ahmadou-Ahidjo',
    histoire: [
      "Fauve Azur Elite est la section professionnelle d'un projet sportif mené à Yaoundé par Norbert Nya Nkamenjo, ancien directeur général de la Panthère du Ndé. En septembre 2019, il rachète l'AS Etoa-Meki, club de Ligue 2 fondé par l'ancien Lion indomptable Jean II Makoun. Cette licence donne naissance à Fauve Azur Elite, tandis que l'équipe Fauve Azur FC continue en ligue régionale du Centre.",
      "Troisième de l'Elite Two en 2021, il accède à la MTN Elite One et s'y installe : en 2024, il prépare déjà sa quatrième saison dans l'élite, avec l'expérimenté Gabriel Haman sur le banc. Le club n'a en revanche jamais remporté de titre.",
      "La saison 2025-2026 est la plus difficile. Battu 4-2 par l'AS Fortuna lors de la 25e journée, Fauve Azur est officiellement relégué. Il termine dernier du championnat et dispute l'Elite Two en 2026-2027.",
    ],
    palmares: [],
    sources: [
      'https://www.camer.be/77252/7:1/sport',
      'https://camer.be/actualites/sport/cameroun-norbert-nkamenjonos-joueurs-doivent-avoir-un-statut-special-si-nous-voulons-gagner-le-chan-2020-cameroon.html',
      'https://www.national-football-teams.com/club/25895/2021/Fauve_Azur_Yaounde.html',
      'https://kick442.com/?p=18926',
      'https://www.livefoot.fr/equipe/fauve-azur-elite/actualite/',
      'https://cameroon-tribune.cm/articles/11385/fr/details_2',
    ],
  },

  'renaissance': {
    nomComplet: 'Renaissance Football Club de Ngoumou',
    alias: ['renaissance fc', 'renaissance de ngoumou', 'renaissance fc de ngoumou', 'rfc'],
    surnom: 'RFC',
    ville: 'Ngoumou',
    fondation: 2000,
    stade: 'Stade municipal de Ngoumou',
    histoire: [
      "Fondé le 2 janvier 2000 par le comité de développement de Nkong-Abok, un village à une soixantaine de kilomètres de Yaoundé, le Renaissance FC a commencé dans le championnat départemental de la Méfou-et-Akono.",
      "Huitième de finaliste puis quart de finaliste de la Coupe du Cameroun en 2001 et 2002, il représente le Centre aux Interpoules de 2002 avant de gravir les divisions jusqu'à l'Elite One.",
    ],
    palmares: [],
    sources: ['https://en.wikipedia.org/wiki/Renaissance_FC_de_Ngoumou', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'dragon de yaounde': {
    nomComplet: 'Dragon Club de Yaoundé',
    alias: ['dragon', 'dragon club', 'dragon club de yaounde', 'dragon fc'],
    ville: 'Yaoundé',
    fondation: 1928,
    stade: 'Stade municipal de Mbalmayo',
    histoire: [
      "Fondé en 1928 sous le nom d'Allico Maritime, le Dragon Club de Yaoundé est l'un des plus anciens clubs du pays.",
      "Il évolue en Elite Two, où il termine huitième en 2023-2024, avant d'être relégué en division régionale à l'issue de la saison 2024-2025.",
    ],
    palmares: [],
    sources: ['https://en.wikipedia.org/wiki/Dragon_Club_(Yaound%C3%A9)', 'https://rsssf.org/tablesk/kamfound.html', 'https://cameroon-tribune.cm/article.html/71249/fr.html/details_2'],
  },

  'feutcheu': {
    nomComplet: 'Djiko FC de Bandjoun',
    alias: ['feutcheu fc', 'djiko', 'djiko fc', 'djiko fc de bandjoun', 'djiko bandjoun'],
    ville: 'Bandjoun',
    fondation: 2011,
    stade: 'Stade omnisports de Bafoussam',
    histoire: [
      "Fondé en 2011 à Bandjoun, dans l'Ouest, le Djiko FC est présidé par l'homme d'affaires Joseph Feutcheu, d'où le nom « Feutcheu » sous lequel le club apparaît parfois. Il dispute l'Elite One jusqu'en 2022-2023, puis redescend en Elite Two.",
      "Le 7 avril 2025, Joseph Feutcheu annonce son retrait de toutes les activités du football, dénonçant notamment l'arbitrage et la gestion du championnat. Le club ne se présente plus à ses matchs et quitte l'Elite Two à l'issue de la saison 2024-2025, reversé en division régionale.",
    ],
    palmares: [],
    sources: [
      'https://cameroon-tribune.cm/article.html/70068/fr.html/details_2',
      'https://national-football-teams.com/club/28741/2024_1/Djiko_Bandjoun.html',
      'https://cameroon-tribune.cm/article.html/71249/fr.html/details_2',
      'https://rsssf.org/tablesk/kamfound.html',
    ],
  },

  'leopard de douala': {
    nomComplet: 'Léopard Sportif de Douala',
    alias: ['leopard', 'leopards douala', 'leopard douala', 'leopard sportif de douala'],
    ville: 'Douala',
    fondation: 1940,
    stade: 'Stade de la Réunification',
    histoire: [
      "Fondé en 1940 sous le nom de Diables Noirs de Deido, le Léopard de Douala est un club historique de la capitale économique.",
      "Avec un jeune Roger Milla dans ses rangs, il devient champion du Cameroun en 1972, puis conserve son titre en 1973.",
      "Le club a aussi disputé quatre finales de Coupe du Cameroun (1942, 1956, 1957 et 1993), sans jamais la remporter.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1972, 1973] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1942, 1956, 1957, 1993] },
    ],
    grandsJoueurs: ['Roger Milla'],
    sources: ['https://en.wikipedia.org/wiki/L%C3%A9opard_Douala', 'https://en.wikipedia.org/wiki/Elite_One', 'https://en.wikipedia.org/wiki/Cameroonian_Cup', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'fc rangers': {
    nomComplet: 'Rangers FC de Bafut',
    alias: ['rangers', 'rangers fc', 'rangers bafut', 'rangers fc bafut', 'bafut rangers'],
    ville: 'Bafut',
    fondation: 2012,
    histoire: [
      "Club de Bafut, dans le Nord-Ouest, fondé en 2012, Rangers FC décroche sa place en Elite Two lors des Interpoules nationales 2020-2021, grâce à un nul face à Best Stars de Limbé.",
    ],
    palmares: [],
    sources: ['https://www.hilltopvoices.com/2021/09/national-interpools-20202021-rangers-fc_25.html', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'isohsa': {
    nomComplet: 'Isle of Hope Sports Academy',
    alias: ['isosha', 'isohsa fc', 'isohsa limbe', 'isle of hope sports academy'],
    ville: 'Limbé',
    fondation: 2015,
    histoire: [
      "Fondée en 2015 à Limbé par Karl Njomo Mokake, l'Isle of Hope Sports Academy monte en championnat régional dès 2017.",
      "En 2023, elle remporte le championnat régional du Sud-Ouest puis les Interpoules nationales (2-0 contre Bafmeng United), ce qui lui ouvre les portes de l'Elite Two.",
    ],
    palmares: [
      { competition: 'Interpoules nationales', type: 'titre', annees: [2023] },
    ],
    sources: ['https://cameroon-tribune.cm/article.html/59474/fr.html/isohsa-limbe-road'],
  },

  'atlantic': {
    nomComplet: 'Atlantic Sports Academy de Kribi',
    alias: ['atlantic sa', 'atlantic s.a', 'atlantic de kribi', 'atlantic sports academy', 'atlantic kribi', 'atlantic fc de kribi'],
    surnom: 'ASA',
    ville: 'Kribi',
    histoire: [
      "Jeune club de la cité balnéaire de Kribi, dans le département de l'Océan (région du Sud), l'Atlantic Sports Academy s'est donné pour mission de former les talents de la côte et de leur offrir une vitrine.",
      "2024 marque le grand tournant de son histoire. En juillet, Atlantic devient champion régional du Sud en battant Dja Sports de Meyomessala 3-0 en finale. Aux interpoules nationales d'août, à Yaoundé, il élimine Mintack FC aux tirs au but pour décrocher sa montée en Elite Two, puis remporte le tournoi le 18 août en battant l'Union Sportive d'Abong-Mbang en finale (1-0, but de Laurent Nkoa), au stade de Ngoa-Ekellé.",
      "Dès ses débuts en deuxième division, le club se fait remarquer : il atteint les demi-finales de la Coupe du Cameroun 2025, où il s'incline face à la Colombe du Dja-et-Lobo (2-1).",
      "En 2025-2026, Atlantic se qualifie pour les play-offs d'accession à l'Elite One, mais s'incline 1-0 contre le futur champion, l'US Abong-Mbang, le 17 juin 2026. Il reste l'un des prétendants à la montée.",
    ],
    palmares: [
      { competition: 'Interpoules nationales', type: 'titre', annees: [2024] },
      { competition: 'Championnat régional du Sud', type: 'titre', annees: [2024] },
    ],
    sources: [
      'https://cameroon-tribune.cm/article.html/66594/fr.html/details_2',
      'https://kick442.com/?p=19484',
      'https://kick442.com/?p=18390',
      'https://cameroon-tribune.cm/article.html/71763/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/77091/fr.html/details_2',
    ],
  },

  'kumba': {
    nomComplet: 'Kumba City FC',
    alias: ['kumba city', 'kumba city fc'],
    surnom: 'Les K-Town Citizens',
    ville: 'Kumba',
    couleurs: 'Bleu et bleu ciel',
    stade: 'GPS School Field (Kumba)',
    histoire: [
      "Club de Kumba, dans le département de la Meme (région du Sud-Ouest), Kumba City FC est surnommé les « K-Town Citizens ».",
      "En 2025, il remporte la finale régionale du Sud-Ouest contre ses voisins de Legend FA (3-0) et se qualifie pour la première fois de son histoire pour les Interpoules nationales. À Odza, il bat Titanic FC Samar en demi-finale (4-0), ce qui lui assure la montée en Elite Two, puis s'offre le titre le 20 septembre 2025 face au Sable de Batié, 4-3 après prolongation.",
      "Pour sa première saison en Elite Two (2025-2026), sous la direction de l'entraîneur Mbaboh Moses, il démarre par deux victoires à domicile, occupe longtemps la tête de son groupe et se qualifie pour les play-offs d'accession à l'Elite One.",
    ],
    palmares: [
      { competition: 'Interpoules nationales', type: 'titre', annees: [2025] },
      { competition: 'Championnat régional du Sud-Ouest', type: 'titre', annees: [2025] },
    ],
    sources: [
      'https://www.cameroon-tribune.cm/article.html/72740/fr.html/details_2',
      'https://cameroun24.net/article/70685-interpoules-2025-kumba-city-sacr-champion-au-bout-du-suspense-sable-de-bati-aussi-promu.html',
      'https://cameroun24.net/article/70664-interpoules-2025-kumba-city-fc-ecrase-titanic-4-0-et-decroche-son-ticket-pour-l-elite-two.html',
      'https://kick442.com/?p=22600',
      'https://kick442.com/?p=27437',
      'https://cameroon-tribune.cm/article.html/77091/fr.html/details_2',
    ],
  },

  'ofta': {
    nomComplet: 'OFTA de Kribi',
    alias: ['ofta fc', 'ofta de kribi', 'ofta kribi'],
    ville: 'Kribi',
    histoire: [
      "Club de Kribi soutenu par le Port Autonome de Kribi, l'OFTA est monté en quelques saisons du championnat régional jusqu'à l'Elite One, qu'il a disputée en 2022.",
      "Il évolue ensuite en Elite Two, avec l'ambition de retrouver l'élite.",
    ],
    palmares: [],
    sources: ['https://cameroon-tribune.cm/article.html/46801/fr.html/interview-ofta-ne-jouera-pas', 'https://pak.cm/en/pak-renews-its-support-to-ofta/'],
  },

  'stade de bertoua': {
    nomComplet: 'Stade FC de Bertoua',
    alias: ['stade bertoua', 'stade fc de bertoua', 'stade'],
    ville: 'Bertoua',
    fondation: 1983,
    stade: 'Stade municipal de Bertoua',
    histoire: [
      "Fondé en 1983, le Stade FC de Bertoua est un club de la région de l'Est.",
      "En mai 2023, après des violences contre les arbitres lors d'un match d'Elite Two face à Victoria United, la Fécafoot le relègue en division inférieure et le suspend un an.",
    ],
    palmares: [],
    sources: ['https://cameroon-tribune.cm/article.html/57098/fr.html/details_2', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'lausanne': {
    nomComplet: 'AS Lausanne de Yaoundé',
    alias: ['as lausanne', 'lausanne de yaounde', 'as lausanne de yaounde'],
    ville: 'Yaoundé',
    stade: 'Stade Ahmadou-Ahidjo',
    histoire: [
      "Club de Yaoundé, l'AS Lausanne remporte l'Elite Two en 2009-2010 et monte en Elite One pour la saison 2010-2011.",
      "Redescendu par la suite, il retrouve l'Elite Two grâce aux Interpoules nationales 2020-2021.",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: ['2009-10'] },
    ],
    sources: ['https://en.wikipedia.org/wiki/AS_Lausanne_de_Yaound%C3%A9', 'https://www.hilltopvoices.com/2021/09/national-interpools-20202021-rangers-fc_25.html'],
  },

  'new star': {
    nomComplet: 'New Star de Douala',
    alias: ['new star fc', 'new stars', 'new stars de douala', 'new star de douala'],
    ville: 'Douala',
    stade: 'Stade de la Réunification',
    histoire: [
      "Club de Douala, New Star dispute la finale de la Coupe du Cameroun en 2012, perdue face à Unisport de Bafang (2-0).",
      "Il prend sa revanche en 2017 en remportant le trophée face à l'UMS de Loum (1-0).",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2017] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2012] },
    ],
    sources: ['https://en.wikipedia.org/wiki/New_Star_de_Douala', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'mintack': {
    nomComplet: 'Mintack FC de la Haute-Sanaga',
    alias: ['mintack fc', 'mintack de la haute sanaga', 'mintack fc de haute-sanaga', 'mintack haute sanaga'],
    surnom: 'Les Lions de la Haute-Sanaga',
    ville: 'Nanga-Eboko',
    fondation: 2015,
    couleurs: 'Or et bordeaux',
    histoire: [
      "Fondé en 2015 à Nanga-Eboko, dans la Haute-Sanaga (région du Centre), Mintack FC se révèle au grand public en 2024. Champion régional du Centre après une finale gagnée 2-0 contre la Foudre d'Akonolinga, il réalise surtout un parcours remarqué en Coupe du Cameroun. Club de ligue régionale, il élimine l'AS Fortuna, pensionnaire d'Elite One, en quart de finale (1-0), avant de tomber en demi-finale contre l'Aigle Royal de la Menoua (0-1, but à la 85e minute).",
      "La même année, aux Interpoules, il est battu en demi-finale par Atlantic de Kribi, puis remporte le match pour la troisième place contre Volcan du Noun (5-1). En 2025, il conserve son titre régional en battant de nouveau la Foudre d'Akonolinga (3-0), mais ne passe pas la phase de groupes des Interpoules.",
      "La troisième tentative est la bonne. Aux Interpoules 2026, il termine en tête de sa poule, bat Mintack FC du Septentrion en demi-finale le 31 juillet (2-1), ce qui lui assure la première montée de son histoire en Elite Two, puis remporte le titre le 2 août face à Elecsport de Limbé (1-0).",
      "Pour ses débuts en Elite Two, il ouvre la saison 2026-2027 par un match nul à Limbé contre Elecsport (1-1).",
    ],
    palmares: [
      { competition: 'Interpoules nationales', type: 'titre', annees: [2026] },
      { competition: 'Championnat régional du Centre', type: 'titre', annees: [2024, 2025] },
    ],
    sources: [
      'https://cameroon-tribune.cm/article.html/79371/fr.html/details_2',
      'https://www.237online.com/interpoules-2026-mintack-fc-yaounde/',
      'https://cameroon-tribune.cm/article.html/65413/fr.html/details_2',
      'https://cameroon-tribune.cm/articles/9529/en/details_2',
      'https://kick442.com/?p=18968',
      'https://crtv.cm/?p=279331',
      'https://cameroun24.net/article/70384-mintack-fc-la-foudre-ne-frappe-pas-deux-fois-les-lions-de-la-haute-sanaga-conservent-leur-couronne-en-balayant-akonolinga-3-0.html',
      'https://cameroon-tribune.cm/article.html/81971/fr.html/details_2',
      'https://rsssf.org/tablesk/kamfound.html',
    ],
  },

  'elecsport': {
    nomComplet: 'Elecsport Football and Sports Academy de Limbé',
    alias: ['electsport', 'elecsport de limbe', 'elecsport fc', 'elecsport fsa', 'elecsport football sa'],
    ville: 'Limbé',
    fondation: 1983,
    couleurs: 'Jaune et vert',
    stade: 'Limbe Centenary Stadium',
    histoire: [
      "Club de Limbé (département du Fako, région du Sud-Ouest) fondé en 1983, Elecsport a déjà goûté à l'élite : il dispute le championnat de première division en 1990, mais termine 16e et dernier et redescend aussitôt.",
      "Après une longue absence du football professionnel, le club, devenu Elecsport Football and Sports Academy, remporte en 2026 le championnat régional du Sud-Ouest, avec une large victoire 5-0 contre Cinyodev Football Academy au stade de Middle Farms, à Limbé.",
      "Aux Interpoules 2026, il termine en tête de sa poule, bat Mankon United en demi-finale (2-1) et obtient ainsi sa montée en Elite Two. Il perd ensuite la finale contre Mintack FC (0-1).",
      "Pour son retour au niveau national, il confie son banc au vétéran Emmanuel Ndoumbe Bosso et ouvre la saison 2026-2027 de l'Elite Two au Centenary Stadium de Limbé par un nul 1-1 contre Mintack FC, l'autre promu.",
    ],
    palmares: [
      { competition: 'Championnat régional du Sud-Ouest', type: 'titre', annees: [2026] },
      { competition: 'Interpoules nationales', type: 'finale', annees: [2026] },
    ],
    sources: [
      'https://en.wikipedia.org/wiki/1990_Cameroonian_Premier_League',
      'https://kick442.com/?p=29020',
      'https://www.237online.com/interpoules-2026-mintack-fc-yaounde/',
      'https://cameroon-tribune.cm/article.html/79371/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/81869/fr.html/details_2',
      'https://cameroon-tribune.cm/article.html/81971/fr.html/details_2',
      'https://rsssf.org/tablesk/kamfound.html',
    ],
  },

};

// "Panthère Sportive du Ndé" -> "panthere sportive du nde"
const normaliser = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const INDEX = new Map();
for (const [cle, infos] of Object.entries(CLUBS_INFOS)) {
  INDEX.set(normaliser(cle), { cle, infos });
  for (const a of infos.alias ?? []) INDEX.set(normaliser(a), { cle, infos });
}

// ── Version anglaise ─────────────────────────────────────────────────────
// Textes traduits par club (même clé que CLUBS_INFOS). Les noms propres
// (stades, villes, grands joueurs) ne changent pas.
const CLUBS_INFOS_EN = {
  "bamboutos": {
    "surnom": "The Mangwa Boys, the Iron of the West",
    "couleurs": "Red and blue",
    "histoire": [
      "Founded in 1966 in Mbouda, capital of the Bamboutos department (West region), the club is named after the mountains that overlook the area. Nicknamed the \"Mangwa Boys\" or the \"Iron of the West\", it is one of the most popular clubs in Cameroon.",
      "A top-flight club in the early 2000s, it finished 3rd in the league in 2002. In 2004 it won the very first UNIFFAC Clubs Cup (Central Africa) against FC 105 of Libreville: beaten 2-1 in the first leg, it won 2-1 in the return leg in Douala, then 6-5 on penalties.",
      "It reached two Cameroon Cup finals without winning one: in 2016 against APEJES of Mfou (0-2), then on 2 October 2022 against Coton Sport (0-1). Three weeks later, on 22 October 2022 in Bafoussam, it took its revenge by beating Coton Sport 1-0 in the first edition of the Champions' Trophy (Super Cup). In 2023 it finished runner-up in the league.",
      "The 2024-2025 season was turbulent: in April 2025, in a dispute with FECAFOOT, the club announced it was withdrawing from the league. It eventually finished 13th and went down to Elite Two with Les Astres, Union de Douala and Yong Sports Academy.",
      "In Elite Two, it played the relegation play-offs in 2025-2026, then opened the 2026-2027 season with two home wins: 2-0 against Fauve Azur and 3-0 against Tonnerre Kalara Club."
    ]
  },
  "aigle royal de moungo": {
    "couleurs": "Blue and white",
    "histoire": [
      "Founded in the early 1930s in Nkongsamba, in the Moungo department (Littoral region), Aigle Royal, long known as Aigle de Nkongsamba, is one of the oldest clubs in Cameroon and the pride of the whole department.",
      "The club enjoyed its golden age in the 1970s: Cameroonian champion in 1970-1971, it became the first club based outside Douala and Yaoundé to win the league, and played in the African Cup of Champions Clubs the following year. It also reached two Cameroon Cup finals, in 1970 and 1975.",
      "It added a second league title in 1994. Aigle has revealed or welcomed several great figures of the Indomitable Lions, such as Michel Kaham, Augustine Simo and Jean-Marie Tsébo.",
      "Relegated at the end of the 1999 season, the club then went through a long spell of around 25 years between the second division and the regional leagues.",
      "Elite Two champion in 2023-2024, it returned to Elite One for the 2024-2025 season and once again contests the Moungo derbies against its neighbour, Stade Renard de Melong."
    ]
  },
  "aigle royal": {
    "surnom": "El Pacha, the \"Bird of the Menoua\"",
    "couleurs": "Yellow and black",
    "histoire": [
      "Founded in 1932 in Dschang, in the West region, as Aigle Royal de Dschang (on the initiative, according to the club, of the administrator Félix Soulier), \"El Pacha\" is one of the oldest clubs in Cameroon and the pride of the whole Menoua department.",
      "It quickly became one of the country's best teams: national cup finalist in 1947 and 1958, it also finished runner-up in the Cameroonian championship in 1955-1956.",
      "After decades between the top flight and the lower divisions, the club enjoyed a revival in the mid-2000s. Second-division champion in 2004, it finished runner-up in the league straight after its return, in 2004-2005, and made its CAF Champions League debut in 2006. Cameroon Cup finalist in 2008, it then reached the round of 16 of the Confederation Cup in 2009.",
      "From late 2021, the club was restructured under the presidency of Gautier Zomissi. Relegated to Elite Two at the end of the 2023-2024 season, it still enjoyed a fine run in the 2024 Cameroon Cup, all the way to the final against Colombe du Dja et Lobo (0-1). In 2025, it won Elite Two, returned to Elite One and represented Cameroon in the Confederation Cup.",
      "At the Dschang municipal stadium, its fans create a fiery atmosphere, especially in the West derbies against Racing de Bafoussam or Fovu de Baham."
    ]
  },
  "canon": {
    "surnom": "Kpa-Kum (the sound of a cannon shot), Mekok Me Ngonda, the \"Brazilians of Africa\"",
    "couleurs": "Green and red",
    "histoire": [
      "Founded on 11 November 1930 in Yaoundé (in the Mvog-Mbi district, according to club tradition), Canon Sportif quickly became a symbol of popular pride in the capital. Its great rival, Tonnerre Kalara Club, born from a split with Canon, contests the Yaoundé derby.",
      "Its 1970s and 1980s were a golden age: playing a spectacular style that earned it the nickname \"Brazilians of Africa\", Kpa-Kum won three African Cups of Champions Clubs (1971, 1978, 1980) and the African Cup Winners' Cup (1979), while dominating the league and the Cameroon Cup.",
      "At its peak, the club provided the backbone of the Indomitable Lions at the 1982 World Cup and for their first Africa Cup of Nations title in 1984, with legends such as Thomas N'Kono (African Ballon d'Or 1979 and 1982), Jean Manga Onguéné (1980), Théophile Abega (1984), Emmanuel Kundé and Grégoire M'Bida.",
      "After a tenth league title in 2002 and a Cup Winners' Cup final in 2000, the club went through a long period of internal crises and financial difficulties. It regained stability in the early 2020s and is again competing near the top of Elite One."
    ]
  },
  "colombe": {
    "surnom": "The Bird of the South, the Whites",
    "couleurs": "Purple and white",
    "histoire": [
      "Founded in 1953 in Sangmélima as Colombe de Sangmélima, the club gradually became the flag-bearer of football in the South region. Renamed Colombe du Dja-et-Lobo, then Colombe du Sud, it now carries the identity of a whole region.",
      "Colombe first reached the top division in 1986-1987 and stayed there until 1993, before a long spell in the lower divisions.",
      "After 23 years away, it returned to the top flight for the 2017 season. From 2020, the club professionalised and underwent a deep restructuring, setting up its headquarters in Yaoundé.",
      "On 29 September 2024, under coach Richard Towa, a former player of the club, the Bird of the South won the first major trophy in its history: the Cameroon Cup, 1-0 against Aigle Royal de la Menoua. It followed up with the Super Cup, won 2-1 against Victoria United.",
      "On 8 June 2025, 72 years after its creation, Colombe was crowned Cameroonian champion for the first time (3-0 against Victoria United), then retained its title in 2026, a season wrapped up with a 7-0 win over Fauve Azur. It also competes in the CAF Champions League."
    ]
  },
  "cotonsport": {
    "surnom": "Les Cotonniers (The Cottoners)",
    "couleurs": "Green and white",
    "histoire": [
      "Created in 1986 in Garoua, in the North region, with the backing of the cotton company Sodecoton, Coton Sport rose quickly through the divisions: it reached the top flight in 1993 and finished league runner-up the very next season, in 1994, before winning its first title in 1997.",
      "The club then ended the historic dominance of the Douala and Yaoundé clubs. With 18 league titles, including six in a row from 2003 to 2007-2008 and a final hat-trick from 2021 to 2023, it holds the Cameroonian championship record. It has also won seven Cameroon Cups.",
      "Coton Sport regularly flies the Cameroonian flag on the African stage: CAF Cup finalist in 2003, then CAF Champions League finalist in 2008 against Al Ahly, it reached the Champions League semi-finals again in 2013.",
      "Built on a professional structure and an effective academy, the club has been a springboard for several generations of Indomitable Lions.",
      "After its hat-trick, it went through a rebuilding phase as new rivals emerged and starts the 2026-2027 season aiming to win back the title."
    ]
  },
  "dynamo de douala": {
    "surnom": "Bon Ba Djob (\"the children of God\" in Bassa), the People",
    "couleurs": "Yellow and black",
    "histoire": [
      "Founded in 1948 in the Nkongmondo district of Douala, Dynamo was born with a strong popular and committed identity, earning it the nickname of the \"People's\" club. It gathers a huge community of supporters in the economic capital.",
      "The Bon Ba Djob reached their peak at the turn of the 1970s and 1980s. They won the Cameroon Cup in 1979 against PWD Bamenda (3-1), then again in 1981 by beating their great local rival, Union Sportive de Douala, in the final (2-0). That same year, the club finished league runner-up behind Tonnerre Yaoundé.",
      "A third national trophy came in 1998, with a 1-0 win over Canon Yaoundé in the Cameroon Cup final.",
      "A club known for developing players, Dynamo notably revealed the late Modeste M'Bami, Olympic champion in 2000, who went on to play for PSG and Marseille.",
      "The club then went through long, difficult years between the lower divisions and internal crises. After a restructuring, it returned to Elite One for the 2023-2024 season, then finished league runner-up in 2025-2026, behind Colombe."
    ]
  },
  "fortuna mfou": {
    "couleurs": "Red and white",
    "histoire": [
      "Founded in 1998 in Mfou (Mefou-et-Afamba, Centre region) by Roger Noah, AS Fortuna made its name as a player-development club, producing notably André-Frank Zambo Anguissa and Léonel Ateba. The club also has a women's team.",
      "Promoted to Elite One in 2018, it finished 14th in its first season, then quickly settled in the top half of the table: 4th in 2019 and 2020, then 3rd in 2020-2021, its best finish. In the 2024 Cameroon Cup it was knocked out in the quarter-final by Mintack FC, then a regional-league side (0-1).",
      "On 3 September 2024, its founder and president Roger Noah died aged 56, a huge loss for the club.",
      "In 2025-2026 Fortuna finished 13th in Elite One and had to play a play-off against the runner-up of the Elite Two play-offs, its Mfou neighbour APEJES. Beaten 2-0 on 1 July 2026, it went down to Elite Two."
    ]
  },

  "gazelle": {
    "couleurs": "Sky blue and white",
    "histoire": [
      "Created in 2015 in Garoua, in the North region, Gazelle FA (Gazelle Football Academy) set itself the mission of structuring and professionalising the training of young talent in northern Cameroon. Its motto: \"Faster, higher, stronger\".",
      "The club climbed the ladder very quickly: departmental champion in 2017, North regional champion in 2018, 2019 and 2021, then winner of its group at the 2021 national inter-pools, which opened the doors of Elite Two.",
      "In its first second-division season, it had an outstanding run: on 5 July 2022, at the Roumdé-Adjia stadium, coach Alioum Kada's side won the Elite Two final against Aigle Royal de la Menoua (2-1) and moved up to Elite One.",
      "As a newly promoted side, Gazelle FA immediately shook up the order by qualifying for the title play-offs in its very first season (2022-2023). In 2024-2025, the club finished 3rd in Elite One, driven by striker Serge Daura, the league's top scorer (15 goals) and 2025 Cameroonian Ballon d'Or.",
      "Sharing the Roumdé-Adjia stadium with Coton Sport, Gazelle FA has given Garoua a new derby, the \"Garouassico\"."
    ]
  },
  "panthère": {
    "surnom": "Nzuimanto (\"the panther\" in the local language), the Ndé Wildcat",
    "couleurs": "Green and yellow",
    "histoire": [
      "Founded in 1952 in Bangangté, in the Ndé department, Panthère Sportive quickly made its mark in the region and, after independence, became one of the flag-bearers of football in the West.",
      "In 1988, Nzuimanto made history by winning the Cameroon Cup against its great regional rival, Racing de Bafoussam (1-0): it was the first club from the West to lift the trophy.",
      "After a spell in the second division, the club returned to the forefront in 2009 with a second Cameroon Cup, won 3-2 against Les Astres de Douala. It confirmed its consistency by reaching two consecutive finals, in 2014 and 2015.",
      "Back from Elite Two, Panthère enjoyed an exceptional 2024-2025 season driven by its honorary president Célestine Ketcha Courtès: Elite One runner-up behind Colombe, it won its third Cameroon Cup on 14 December 2025 against the same Colombe (1-1, 3-1 on penalties). In February 2026, the Champions Trophy between the two sides was abandoned; FECAFOOT awarded Panthère a 3-0 win by default.",
      "The club has trained or revealed many Cameroon internationals and has represented Cameroon in the African Cup Winners' Cup and the CAF Confederation Cup."
    ]
  },
  "pwd bamenda": {
    "surnom": "Abakwa Boys (from the historic name of Bamenda)",
    "couleurs": "Blue and white",
    "histoire": [
      "Created in 1962 in Bamenda, in the North-West, under the sponsorship of the Public Works Department (hence the initials PWD), the club quickly became one of the flag-bearers of English-speaking Cameroon.",
      "The Abakwa Boys reached the Cameroon Cup final as early as 1967 (a 1-0 defeat to Canon Yaoundé), then again in 1979 (a 3-1 loss to Dynamo Douala).",
      "After difficult years, the club was reborn in the late 2010s. Arriving in September 2019 at the height of the crisis in the English-speaking regions, coach David Pagou led PWD to the first league title in its history in 2019-2020. The club then made its CAF Champions League debut, narrowly knocked out by South Africa's Kaizer Chiefs (0-1 on aggregate).",
      "On 13 March 2022, at the Ahmadou-Ahidjo stadium in Yaoundé, PWD broke its finals curse by winning its first Cameroon Cup (2021 edition), 1-0 against Les Astres de Douala, in the year of its 60th anniversary.",
      "The club confirmed its consistency by reaching another Cup final in 2023, lost to Fovu de Baham, and has stayed in Elite One."
    ]
  },
  "stade renard": {
    "surnom": "Les Renards (The Foxes)",
    "couleurs": "Green and white",
    "histoire": [
      "A club from Melong, in the Moungo department (Littoral region), Stade Renard already existed in the late 1960s: in 1969 it played in the second division, and it was there that a young Michel Kaham signed his first licence before shining with Aigle Royal de Nkongsamba.",
      "After a long quiet spell, the club was revived in the early 2010s by local leaders, including Melong's mayor, Jean Kuete. Starting from the Littoral regional league, it climbed the ladder in three seasons and won the Ligue 2 title in 2016, earning promotion to the top flight. The Melong municipal stadium was renovated to mark the comeback.",
      "2019 remains the greatest year in its history: Stade Renard won the Cameroon Cup (3-2 in the final against AS FAP of Yaoundé, at the Ahmadou-Ahidjo stadium), then the Roger Milla Super Cup in October (3-1 against UMS de Loum).",
      "Now an established Elite One side, the club challenged for the title in 2023-2024: on the last day of the play-offs, a 2-2 draw against Victoria United handed the title to Victoria, and Stade Renard finished 3rd, level on points with Coton Sport."
    ]
  },
  "unisport bafang": {
    "surnom": "Flambeau de l'Ouest (Torch of the West)",
    "couleurs": "Yellow and red",
    "histoire": [
      "The club was born in 1958 from the merger of three teams from the Haut-Nkam (Jupiter FC, Union de la Mission catholique and Tortue FC) and was officially registered on 2 October 1959, driven by Antoine Kouenkam, a former player in Cameroon's first national team.",
      "A long-time top-flight side, Unisport finished league runner-up in 1993, one point behind Racing de Bafoussam, before entering legend in 1996: crowned Cameroonian champion, it broke the dominance of the Douala and Yaoundé clubs and played in the CAF Champions League the following year.",
      "In the 2000s, the \"Torch of the West\" became a Cameroon Cup final regular. After three lost finals (2000, 2005 and 2011, the last one on penalties against Coton Sport), it finally broke the curse in 2012 by beating New Star de Douala (2-0).",
      "Relegated to Elite Two in 2019, the club spent six seasons there before returning to the top flight through the June 2025 play-offs. On its return to Elite One, in 2025-2026, it caused a stir by leading the league for a long time, and eventually finished 3rd.",
      "The club is known for the atmosphere at its stadium in Bafang and for its West derbies against Racing de Bafoussam and Aigle de la Menoua. Many Cameroonian talents have passed through it."
    ]
  },
  "victoria united": {
    "surnom": "OPOPO (One People, One Power)",
    "couleurs": "Black and white",
    "histoire": [
      "Based in Limbe (formerly Victoria), on the South-West coast, the club has its roots in local football and took its current form in 2002. Its nickname, \"OPOPO\", stands for \"One People, One Power\".",
      "After a first spell in the top flight, Victoria United was relegated in 2004 and began a long journey of nearly twenty years in the lower divisions.",
      "Driven by its president Valentine Nkwain, known as \"Bobdidy\", the club was reborn in the early 2020s: South-West regional champion, it moved up to Elite Two, then dominated it in 2022-2023 to return to the top flight.",
      "On its return, OPOPO defied all predictions: on 18 April 2024, a 2-2 draw against Stade Renard de Melong in the play-offs in Douala gave it the first Cameroonian league title in its history.",
      "That same season, the club's young midfielder Wilfried Nathan Douala was called up by the Indomitable Lions for the 2023 Africa Cup of Nations in Ivory Coast.",
      "That title opened the doors of the 2024-2025 CAF Champions League, where it played in the preliminary rounds. The club has since established itself in Elite One."
    ]
  },
  "tonnerre": {
    "surnom": "The Kalara Boys",
    "couleurs": "Black and white",
    "histoire": [
      "Tonnerre Kalara Club was founded in 1934 in Yaoundé by Martin Omgba Zing, one of the founders of Canon, who left after internal disagreements. \"Kalara\" means \"the book\" in Ewondo: the new club was meant to be the book that would teach Canon how to play football. This split gave birth to the capital's derby, one of the most passionate in the country.",
      "The Mvog-Ada club made history in 1975 by winning the very first African Cup Winners' Cup, against Stella Club d'Adjamé (1-0 in Abidjan, 4-1 in Yaoundé). It reached the final again the following year, losing to Nigeria's Shooting Stars.",
      "The 1980s were its golden age: five league titles between 1981 and 1988, and Cameroon Cups in 1987, 1989 and 1991. In 1989 it reached the semi-finals of the African Cup of Champions Clubs, knocked out by Raja Casablanca.",
      "Big names have played for TKC: Roger Milla (1974-1977, then 1990-1994), Stephen Tataw, Rigobert Song, Jean II Makoun, Chad's Japhet N'Doram and Liberia's George Weah (1987-1988), a future Ballon d'Or winner whom Claude Le Roy then recommended to AS Monaco.",
      "In 2002 it played one more continental final, in the CAF Cup. It then went through long leadership and financial crises. Now in Elite Two, it secured its survival in the relegation play-offs of the 2025-2026 season."
    ]
  },
  "union douala": {
    "surnom": "The Nassaras Kamakaï",
    "histoire": [
      "Founded as Jeunesse Bamiléké, Union Sportive de Douala is one of the most prestigious clubs in the country.",
      "It is one of the few Cameroonian clubs to have won two African competitions: the African Cup of Champions Clubs in 1979, against Hearts of Oak, then the African Cup Winners' Cup in 1981.",
      "Five-time Cameroonian champion, from 1969 to 2012, Union has also lifted six Cameroon Cups since independence.",
      "On 9 June 2025, the club suffered the first relegation in its history, to Elite Two (15th). The following season it went through the relegation play-offs, then had to play the 2026 Inter-pools to try to avoid another drop."
    ]
  },
  "racing": {
    "histoire": [
      "Racing Club de Bafoussam was the leading club of the West region in the late 1980s and the 1990s.",
      "It won four Cameroonian league titles (1989, 1992, 1993 and 1995), played in the CAF Champions League five times and won the Cameroon Cup in 1996, after losing three finals.",
      "The club notably developed Geremi Njitap, who went on to play for Real Madrid and Chelsea. After some difficult years, it won Elite Two in 2020-2021. In May 2026, bottom of its Elite Two group, it was relegated to the regional league."
    ]
  },
  "les astres": {
    "surnom": "The Brazilians of Bépanda",
    "histoire": [
      "Founded in 2002 in the Bépanda district of Douala, the club is nicknamed \"the Brazilians of Bépanda\" for its attacking style of play.",
      "It quickly established itself among the country's best clubs: three-time league runner-up (2009-2010, 2010-2011 and 2013) and four-time Cameroon Cup finalist (2007 against Coton Sport, 2009 against Panthère du Ndé, then 2010 and 2021), without ever lifting the trophy.",
      "These results took it to African competitions six times: the Confederation Cup in 2006, 2007 (reaching the group stage) and 2008, then the Champions League in 2011, 2012 and 2014. The club has also launched future internationals, such as full-back Ernest Mabouka.",
      "Elite Two champion in 2019-2020, it returned to the top flight, then went down again at the end of the 2024-2025 season. In 2025-2026 it qualified for the promotion play-offs, won by Union Sportive d'Abong-Mbang."
    ]
  },

  "eding sport": {
    "histoire": [
      "Created in 2012 and attached to the Lékié department, Eding Sport is one of the great recent success stories of Cameroonian football.",
      "Only a few years after its creation, it became Cameroonian champion in 2017, then followed up with the Cameroon Cup in 2018, against Lion Blessé de Fotouni.",
      "In May 2026, bottom of its Elite Two group, the club was relegated to the Centre regional league."
    ]
  },
  "sable": {
    "surnom": "The San San Boys",
    "couleurs": "Yellow and blue",
    "histoire": [
      "Founded in 1995 in Batié, in the Hauts-Plateaux department (West region), Sable FC, nicknamed the \"San San Boys\", enjoyed a meteoric rise: only four years after its creation, it was crowned Cameroonian champion in 1999, ahead of Coton Sport. It also won that season's Roger Milla Super Cup, 1-0 against Canon Yaoundé, on 12 January 2000.",
      "This title took it to the 2000 CAF Champions League, where it reached the group stage. In the Cameroon Cup it played two consecutive finals without winning: in 2002 against Mount Cameroon (1-2 after extra time), then in 2003 against Coton Sport (1-2). In 2004 it reached the group stage of the CAF Confederation Cup.",
      "The club eventually left the top flight and dropped down to the West regional league. In 2025 it won the West play-off final against Piment de Bayangam (3-1), then earned its return to Elite Two at the Inter-pools, before losing the final to Kumba City (3-4 after extra time).",
      "For its return to Elite Two, the club handed the bench to the experienced Alexandre Belinga and hosts its opponents at the Bamendzi stadium in Bafoussam."
    ]
  },
  "apejes academy": {
    "surnom": "Les Académiciens (The Academicians)",
    "couleurs": "Blue and white",
    "histoire": [
      "Created in 2006 in Mfou, near Yaoundé, APEJES started out as a training academy. It climbed quickly through Cameroonian football all the way to Elite One.",
      "In 2016, the Academicians won the first major trophy in their history: the Cameroon Cup, won 2-0 in the final against Bamboutos de Mbouda, which qualified them for the CAF Confederation Cup.",
      "In the 2020-2021 season, APEJES came close to a first league title: having reached the play-off final, it lost to Coton Sport and finished league runner-up.",
      "Relegated to Elite Two at the end of the 2023-2024 season, it spent two seasons there before returning to Elite One on 1 July 2026, thanks to a 2-0 play-off win over its neighbour, AS Fortuna de Mfou.",
      "True to its purpose, the club remains one of the best academies in the country."
    ]
  },
  "fap": {
    "couleurs": "Green, red and yellow",
    "histoire": [
      "AS FAP is the football section of the Forces Armées et Police (FAP), the sports institution of Cameroon's military and police, created in 1972 in Yaoundé. FAP is present in many sports, where it ranks among the country's leading clubs, in basketball, handball and athletics. Its women's football team, Amazones FAP, is one of the best in Cameroon.",
      "On 30 June 2019, AS FAP played the first Cameroon Cup final in its history, at the Ahmadou-Ahidjo stadium in Yaoundé. In pouring rain, it lost 3-2 to Stade Renard de Melong.",
      "The club then played in Elite Two. In 2025-2026, it went through the relegation play-offs and kept its place in the league."
    ]
  },

  "avion academy": {
    "histoire": [
      "Founded in 2012 and attached to the Nkam department (Littoral region), Avion Academy FC has been chaired since its creation by Pierre Batamack, a well-known figure in Douala football.",
      "Elite Two champion in 2018, the club reached Elite One in 2019, finishing 11th in its first season. It stayed in the top flight until 2024, then went down after the relegation play-offs of the 2023-2024 season.",
      "Back in Elite Two, it has been among the promotion contenders: group leader early in the 2024-2025 season, it then played the promotion play-offs without going up. It returned to them in 2025-2026, notably thrashing Kumba City (6-1), but finished behind Union Sportive d'Abong-Mbang, who were crowned champions."
    ]
  },
  "union abong-mbang": {
    "couleurs": "Yellow and black",
    "histoire": [
      "Founded in 1954 in Abong-Mbang, the capital of the Haut-Nyong department, Union Sportive (USA) is the flagship club of the East region.",
      "After representing the East in the top flight, the club left the first division in the late 1990s and began a long 27-year spell between the second division and the regional leagues.",
      "Two-time East regional champion, it moved back up to Elite Two through the national inter-pools.",
      "In 2025-2026, under coach Basile Anyam, USA had a remarkable season: on 17 June 2026, a 1-0 away win at Atlantic de Kribi secured promotion to Elite One, and three days later it was crowned Elite Two champion after a 1-1 draw with Les Astres de Douala.",
      "Back in the top flight 27 years later, the club opened the 2026-2027 Elite One season in Bertoua with a thrilling draw against Stade Renard de Melong (2-2)."
    ]
  },
  "yafoot": {
    "histoire": [
      "Yafoot, also known as Yaoundé FC II, is a club from the capital. After several seasons in Elite Two, it finished 7th in the relegation play-offs in June 2026 and went down to the regional Super League."
    ]
  },
  "foncha st": {
    "histoire": [
      "A club from Bamenda, in the North-West, Foncha Street was crowned North-West regional champion, which opened the door to Elite Two."
    ]
  },
  "bafmeng united": {
    "histoire": [
      "A club from the North-West, Bafmeng United finished second in the 2023 National Inter-pools, behind ISOSHA, and thus earned promotion to Elite Two."
    ]
  },
  "fovu club": {
    "histoire": [
      "Founded on 17 November 1978 in Baham, in the West, Fovu Club takes its name from a sacred cave in the region.",
      "Cameroonian champion in 2000, it made its CAF Champions League debut in 2001, then played in the Cup Winners' Cup in 2002 and the Confederation Cup in 2011.",
      "Above all, Fovu is a Cameroon Cup specialist: winner in 2001, 2010 and 2023, runner-up in 2006."
    ]
  },
  "ums de loum": {
    "surnom": "UMS",
    "histoire": [
      "Created in 2011 in Loum, in the Moungo department, UMS made a lightning rise to the top of Cameroonian football.",
      "The club won the Cameroon Cup in 2015 by beating Panthère du Ndé (2-0), then became Cameroonian champion in 2016 and 2019. It played in another Cup final in 2017.",
      "These titles opened the door to African competitions: the CAF Champions League and the CAF Confederation Cup."
    ]
  },
  "young sport academy": {
    "surnom": "YOSA",
    "histoire": [
      "Founded in 2004 in Bamenda by Yong Francis, a former referee, Yong Sports Academy was for a long time the only top-division club in the North-West.",
      "Its greatest achievement: the 2013 Cameroon Cup, won on penalties against Canon de Yaoundé (0-0, 4-1 on penalties)."
    ]
  },
  "jeunes fauves": {
    "couleurs": "Yellow and green",
    "histoire": [
      "Fauve Azur Elite is the professional section of a sports project led in Yaoundé by Norbert Nya Nkamenjo, former general manager of Panthère du Ndé. In September 2019 he bought AS Etoa-Meki, a second-division club founded by former Indomitable Lion Jean II Makoun. That licence gave birth to Fauve Azur Elite, while the Fauve Azur FC team carried on in the Centre regional league.",
      "Third in Elite Two in 2021, it was promoted to MTN Elite One and settled there: in 2024 it was already preparing its fourth top-flight season, with the experienced Gabriel Haman on the bench. The club has, however, never won a title.",
      "The 2025-2026 season was the toughest. Beaten 4-2 by AS Fortuna on matchday 25, Fauve Azur was officially relegated. It finished bottom of the league and plays in Elite Two in 2026-2027."
    ]
  },

  "renaissance": {
    "surnom": "RFC",
    "histoire": [
      "Founded on 2 January 2000 by the development committee of Nkong-Abok, a village about sixty kilometres from Yaoundé, Renaissance FC started out in the Méfou-et-Akono departmental championship.",
      "A Cameroon Cup round-of-16 and then quarter-finalist in 2001 and 2002, it represented the Centre region at the 2002 Inter-pools before climbing the divisions all the way to Elite One."
    ]
  },
  "dragon de yaounde": {
    "histoire": [
      "Founded in 1928 as Allico Maritime, Dragon Club de Yaoundé is one of the oldest clubs in the country.",
      "It played in Elite Two, finishing eighth in 2023-2024, before being relegated to the regional division at the end of the 2024-2025 season."
    ]
  },
  "feutcheu": {
    "histoire": [
      "Founded in 2011 in Bandjoun, in the West, Djiko FC is chaired by businessman Joseph Feutcheu, hence the name \"Feutcheu\" under which the club sometimes appears. It played in Elite One until 2022-2023, then dropped to Elite Two.",
      "On 7 April 2025, Joseph Feutcheu announced his withdrawal from all football activities, criticising refereeing and the running of the league in particular. The club stopped turning up for its matches and left Elite Two at the end of the 2024-2025 season, sent down to the regional division."
    ]
  },
  "leopard de douala": {
    "histoire": [
      "Founded in 1940 as Diables Noirs de Deido, Léopard de Douala is a historic club of the economic capital.",
      "With a young Roger Milla in its ranks, it became Cameroonian champion in 1972, then retained its title in 1973.",
      "The club also played in four Cameroon Cup finals (1942, 1956, 1957 and 1993) without ever winning it."
    ]
  },
  "fc rangers": {
    "histoire": [
      "A club from Bafut, in the North-West, founded in 2012, Rangers FC earned its place in Elite Two at the 2020-2021 National Inter-pools, thanks to a draw against Best Stars de Limbé."
    ]
  },
  "isohsa": {
    "histoire": [
      "Founded in 2015 in Limbé by Karl Njomo Mokake, Isle of Hope Sports Academy reached the regional championship as early as 2017.",
      "In 2023, it won the South-West regional championship and then the National Inter-pools (2-0 against Bafmeng United), which opened the door to Elite Two."
    ]
  },
  "atlantic": {
    "histoire": [
      "A young club from the seaside town of Kribi, in the Océan department (South region), Atlantic Sports Academy has set itself the mission of training talent from the coast and giving it a showcase.",
      "2024 was the big turning point in its history. In July, Atlantic became South regional champion by beating Dja Sports de Meyomessala 3-0 in the final. At the national inter-pools in August, in Yaoundé, it knocked out Mintack FC on penalties to earn promotion to Elite Two, then won the tournament on 18 August by beating Union Sportive d'Abong-Mbang in the final (1-0, goal by Laurent Nkoa) at the Ngoa-Ekellé stadium.",
      "From its first second-division seasons, the club made its mark: it reached the semi-finals of the 2025 Cameroon Cup, losing to Colombe du Dja-et-Lobo (2-1).",
      "In 2025-2026, Atlantic qualified for the Elite One promotion play-offs, but lost 1-0 to the eventual champions, US Abong-Mbang, on 17 June 2026. It remains one of the contenders for promotion."
    ]
  },
  "kumba": {
    "surnom": "The K-Town Citizens",
    "couleurs": "Blue and sky blue",
    "histoire": [
      "A club from Kumba, in the Meme department (South-West region), Kumba City FC is nicknamed the \"K-Town Citizens\".",
      "In 2025 it won the South-West regional final against its neighbours Legend FA (3-0) and qualified for the National Inter-pools for the first time in its history. In Odza it beat Titanic FC Samar in the semi-final (4-0), securing promotion to Elite Two, then won the title on 20 September 2025 against Sable de Batié, 4-3 after extra time.",
      "In its first Elite Two season (2025-2026), under coach Mbaboh Moses, it started with two home wins, led its group for a long time and qualified for the Elite One promotion play-offs."
    ]
  },
  "ofta": {
    "histoire": [
      "A club from Kribi backed by the Port Autonome de Kribi, OFTA climbed in just a few seasons from the regional championship to Elite One, where it played in 2022.",
      "It then moved to Elite Two, with the ambition of returning to the top flight."
    ]
  },
  "stade de bertoua": {
    "histoire": [
      "Founded in 1983, Stade FC de Bertoua is a club from the East region.",
      "In May 2023, after violence against referees during an Elite Two match against Victoria United, Fécafoot relegated it to the lower division and suspended it for a year."
    ]
  },
  "lausanne": {
    "histoire": [
      "A club from Yaoundé, AS Lausanne won Elite Two in 2009-2010 and was promoted to Elite One for the 2010-2011 season.",
      "Relegated later on, it returned to Elite Two through the 2020-2021 National Inter-pools."
    ]
  },
  "new star": {
    "histoire": [
      "A club from Douala, New Star played in the 2012 Cameroon Cup final, losing to Unisport de Bafang (2-0).",
      "It took its revenge in 2017 by winning the trophy against UMS de Loum (1-0)."
    ]
  },
  "mintack": {
    "surnom": "The Lions of Haute-Sanaga",
    "couleurs": "Gold and burgundy",
    "histoire": [
      "Founded in 2015 in Nanga-Eboko, in the Haute-Sanaga department (Centre region), Mintack FC broke through in 2024. Centre regional champion after a 2-0 final win over Foudre d'Akonolinga, it above all made a remarkable Cameroon Cup run. As a regional-league club, it knocked out Elite One side AS Fortuna in the quarter-final (1-0), before falling in the semi-final to Aigle Royal de la Menoua (0-1, 85th-minute goal).",
      "That same year, at the Inter-pools, it lost in the semi-final to Atlantic de Kribi, then won the third-place match against Volcan du Noun (5-1). In 2025 it retained its regional title by beating Foudre d'Akonolinga again (3-0), but did not get past the Inter-pools group stage.",
      "The third attempt was the right one. At the 2026 Inter-pools it topped its group, beat Mintack FC du Septentrion in the semi-final on 31 July (2-1), securing the first promotion in its history to Elite Two, then won the title on 2 August against Elecsport de Limbé (1-0).",
      "For its Elite Two debut, it opened the 2026-2027 season with a draw in Limbé against Elecsport (1-1)."
    ]
  },

  "elecsport": {
    "couleurs": "Yellow and green",
    "histoire": [
      "A club from Limbé (Fako department, South-West region) founded in 1983, Elecsport has already had a taste of the top flight: it played in the first division in 1990, but finished 16th and last and went straight back down.",
      "After a long absence from professional football, the club, now Elecsport Football and Sports Academy, won the 2026 South-West regional championship, with a resounding 5-0 win over Cinyodev Football Academy at the Middle Farms stadium in Limbé.",
      "At the 2026 Inter-pools it topped its group, beat Mankon United in the semi-final (2-1) and thus earned promotion to Elite Two. It then lost the final to Mintack FC (0-1).",
      "For its return to the national level, it handed the bench to veteran coach Emmanuel Ndoumbe Bosso and opened the 2026-2027 Elite Two season at Limbe's Centenary Stadium with a 1-1 draw against Mintack FC, the other promoted side."
    ]
  }
};

// Noms des compétitions et libellés du palmarès
const COMPETITIONS_EN = {
  'Championnat du Cameroun': 'Cameroonian Championship',
  'Coupe du Cameroun': 'Cameroon Cup',
  'Super Coupe Roger Milla': 'Roger Milla Super Cup',
  'Elite Two': 'Elite Two',
  'Interpoules nationales': 'National Inter-pools',
  'Championnat régional du Nord': 'North Regional Championship',
  'Championnat régional du Sud': 'South Regional Championship',
  'Championnat régional du Sud-Ouest': 'South-West Regional Championship',
  'Championnat régional du Centre': 'Centre Regional Championship',
  'Championnat départemental': 'Departmental Championship',
  "Coupe d'Afrique des clubs champions": 'African Cup of Champions Clubs',
  "Coupe d'Afrique des vainqueurs de coupe": "African Cup Winners' Cup",
  'Ligue des champions de la CAF': 'CAF Champions League',
  'Coupe de la CAF': 'CAF Cup',
  'Coupe UNIFFAC des clubs': 'UNIFFAC Clubs Cup',
  "Supercoupe d'Afrique": 'CAF Super Cup',
};
const LIBELLES_EN = {
  'Vice-champion': 'Runner-up',
  '3 fois vice-champion': '3-time runner-up',
};

// Copie des infos dans la langue voulue (le français reste la référence)
function traduire(infos, cle, langue) {
  if (!infos || !String(langue ?? '').toLowerCase().startsWith('en')) return infos;
  const en = CLUBS_INFOS_EN[cle] ?? {};
  return {
    ...infos,
    histoire: en.histoire ?? infos.histoire,
    surnom: en.surnom ?? infos.surnom,
    couleurs: en.couleurs ?? infos.couleurs,
    palmares: (infos.palmares ?? []).map(p => ({
      ...p,
      competition: COMPETITIONS_EN[p.competition] ?? p.competition,
      ...(p.libelle && { libelle: LIBELLES_EN[p.libelle] ?? p.libelle }),
    })),
  };
}

/** Infos d'un club à partir de son nom dans F237 (null si inconnu), dans la langue du site. */
export function getInfosClub(nom, langue = 'fr') {
  const trouve = INDEX.get(normaliser(nom));
  return trouve ? traduire(trouve.infos, trouve.cle, langue) : null;
}