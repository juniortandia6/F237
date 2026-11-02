// f237-frontend/src/data/clubsInfos.js
// Histoire et palmarès des clubs, que l'API-Football ne fournit pas.
//
// Sources : Wikipédia (licence CC BY-SA 4.0) et RSSSF (dates de fondation,
// finales de la Coupe du Cameroun). Les faits (dates, titres) sont repris tels
// quels ; les textes d'histoire sont des résumés rédigés pour F237.
// Les champs absents (fondation, couleurs...) étaient incertains ou
// contradictoires entre les sources : on préfère ne rien afficher que du faux.
//
// Pour ajouter un club : une entrée de plus, avec son nom tel qu'il apparaît
// dans F237 (ou ajoute un alias).

// type : 'titre' = vainqueur, 'finale' = finaliste
export const CLUBS_INFOS = {
  'aigle royal de moungo': {
    nomComplet: 'Aigle Royal du Moungo',
    alias: ['aigle royal du moungo', 'aigle nkongsamba', 'aigle royal de nkongsamba'],
    ville: 'Nkongsamba',
    fondation: 1932,
    couleurs: 'Bleu et blanc',
    stade: 'Stade municipal de Nkongsamba',
    histoire: [
      "Fondé dans les années 1930 à Nkongsamba, dans le Moungo, l'Aigle Royal fait partie des clubs historiques du football camerounais.",
      "Le club connaît son âge d'or dans les années 1970 : champion du Cameroun en 1971, il dispute la Coupe d'Afrique des clubs champions l'année suivante et atteint deux finales de Coupe du Cameroun (1970 et 1975). Il ajoute un deuxième titre de champion en 1994.",
      "Après un long passage dans les divisions inférieures, l'Aigle Royal remporte l'Elite Two lors de la saison 2023-2024 et retrouve l'Elite One pour 2024-2025.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1971, 1994] },
      { competition: 'Elite Two', type: 'titre', annees: ['2023-24'] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1970, 1975] },
    ],
    grandsJoueurs: ['Jean-Marie Tsébo', 'Michel Kaham', 'Augustine Simo'],
    sources: ['https://fr.wikipedia.org/wiki/Aigle_Royal_du_Moungo'],
  },

  'aigle royal': {
    nomComplet: 'Aigle Royal de la Menoua',
    alias: ['aigle royal de la menoua', 'aigle royal menoua', 'aigle royal de dschang'],
    surnom: 'El Pacha, le « Rapide de la Menoua »',
    ville: 'Dschang',
    fondation: 1932,
    stade: 'Stade de Dschang',
    histoire: [
      "Né en juin 1932 à Dschang, dans la région de l'Ouest, l'Aigle Royal de la Menoua est l'un des plus anciens clubs du pays.",
      "Vice-champion du Cameroun en 2005, il découvre la Ligue des champions de la CAF en 2006, puis atteint les huitièmes de finale de la Coupe de la Confédération en 2009. Il dispute deux finales de Coupe du Cameroun, en 2008 et en 2024.",
      "Champion d'Elite Two en 2024-2025, le club retrouve l'élite pour la saison 2025-2026.",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: ['2024-25'] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['2004-05'], libelle: 'Vice-champion' },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2008, 2024] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Aigle_Royal_Menoua'],
  },

  'canon': {
    nomComplet: 'Canon Sportif de Yaoundé',
    alias: ['canon yaounde', 'canon sportif de yaounde', 'canon de yaounde'],
    surnom: 'Kpa-Kum, Mekok Me Ngonda',
    ville: 'Yaoundé',
    fondation: 1930,
    stade: 'Stade Ahmadou-Ahidjo',
    histoire: [
      "Fondé le 11 novembre 1930, le Canon Sportif de Yaoundé est l'un des clubs les plus titrés d'Afrique. Le Tonnerre Kalara Club est né d'une scission avec le Canon, et les deux se disputent le derby de Yaoundé.",
      "Ses années 1970 et 1980 sont exceptionnelles : une dizaine de titres de champion, de nombreuses Coupes du Cameroun et trois Coupes d'Afrique des clubs champions, emmenés notamment par le capitaine Théophile Abega.",
      "Après des années d'instabilité administrative, le club est revenu jouer les premiers rôles en Elite One au début des années 2020.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1970, 1974, 1977, 1979, 1980, 1982, 1985, 1986, 1991, 2002] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1957, 1967, 1973, 1975, 1976, 1977, 1978, 1983, 1986, 1993, 1995, 1999] },
      { competition: "Coupe d'Afrique des clubs champions", type: 'titre', annees: [1971, 1978, 1980], continental: true },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'titre', annees: [1979], continental: true },
    ],
    grandsJoueurs: ['Théophile Abega', 'Jean-Paul Akono'],
    sources: ['https://fr.wikipedia.org/wiki/Canon_Yaoundé', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'colombe': {
    nomComplet: 'Colombe Sportive du Dja-et-Lobo',
    alias: ['colombe sportive', 'colombe sportive du dja et lobo', 'colombe du dja et lobo'],
    surnom: 'Les Blancs',
    ville: 'Sangmélima',
    fondation: 1958,
    stade: 'Stade municipal de Sangmélima',
    histoire: [
      "Club de Sangmélima, dans le département du Dja-et-Lobo, la Colombe découvre la première division en 1986-1987 avant de la quitter en 1993.",
      "Après 23 ans d'absence, elle retrouve l'élite en 2016. Elle s'y installe durablement et vit ensuite la plus belle période de son histoire : Coupe du Cameroun et Super Coupe Roger Milla en 2024, puis un premier titre de champion du Cameroun en 2024-2025, conservé dès la saison 2026.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['2024-25', 2026] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2024] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2024] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2025] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Colombe_Sportive', 'https://rsssf.org/tablesk/kamchamp.html', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'cotonsport': {
    nomComplet: 'Coton Sport Football Club de Garoua',
    alias: ['coton sport', 'coton sport fc de garoua', 'cotonsport de garoua', 'coton sport garoua'],
    surnom: 'Les Cotonniers',
    ville: 'Garoua',
    fondation: 1986,
    stade: 'Stade Roumdé-Adjia',
    histoire: [
      "Fondé en 1986 à Garoua, dans le Nord, Coton Sport accède à la première division en 1992 et devient à partir de la fin des années 1990 le club dominant du football camerounais.",
      "Le club s'impose aussi sur la scène africaine : finaliste de la Coupe de la CAF en 2003, puis de la Ligue des champions de la CAF en 2008 face à Al Ahly, il atteint encore les demi-finales de la Ligue des champions en 2013.",
      "Avec 18 titres de champion, dont sept d'affilée de 2003 à 2008, Coton Sport est de loin le club le plus titré du championnat camerounais.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1997, 1998, 2001, 2003, 2004, 2005, 2006, 2007, '2007-08', '2009-10', '2010-11', 2013, 2014, 2015, 2018, '2020-21', 2022, '2022-23'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2003, 2004, 2007, 2008, 2011, 2014, 2022] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2023] },
      { competition: 'Ligue des champions de la CAF', type: 'finale', annees: [2008], continental: true },
      { competition: 'Coupe de la CAF', type: 'finale', annees: [2003], continental: true },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1999] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Coton_Sport_FC_de_Garoua', 'https://en.wikipedia.org/wiki/Cameroonian_Cup', 'https://rsssf.org/tablesk/kamchamp.html'],
  },

  'dynamo de douala': {
    nomComplet: 'Dynamo Football Club de Douala',
    alias: ['dynamo douala', 'dynamo fc de douala', 'dynamo club de douala'],
    surnom: 'Bon Ba Djob',
    ville: 'Douala',
    fondation: 1948,
    histoire: [
      "Fondé en 1948, le Dynamo est l'un des clubs historiques de Douala, surnommé « Bon Ba Djob ».",
      "Il a remporté trois fois la Coupe du Cameroun, en 1979, 1981 et 1998. Après une période difficile, marquée par des querelles internes et un passage en deuxième division, le club a retrouvé l'Elite One.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1979, 1981, 1998] },
    ],
    sources: ['https://rsssf.org/tablesk/kamfound.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'fortuna mfou': {
    nomComplet: 'AS Fortuna de Mfou',
    alias: ['as fortuna', 'fortuna', 'as fortuna de mfou'],
    ville: 'Mfou',
    fondation: 1998,
    histoire: [
      "Fondée en 1998 à Mfou, près de Yaoundé, l'AS Fortuna monte en Elite One en 2018.",
      "Après une première saison difficile (14e), le club s'installe rapidement dans le haut du tableau : 4e en 2019 et en 2020, puis 3e en 2020-2021, son meilleur classement.",
    ],
    palmares: [],
    sources: ['https://en.wikipedia.org/wiki/AS_Fortuna'],
  },

  'gazelle': {
    nomComplet: 'Gazelle FA de Garoua',
    alias: ['gazelle fa', 'gazelle fa de garoua', 'gazelle garoua'],
    ville: 'Garoua',
    fondation: 2015,
    stade: 'Stade Roumdé-Adjia',
    histoire: [
      "Jeune club créé en 2015 à Garoua, Gazelle FA monte très vite les échelons.",
      "En juillet 2022, il remporte l'Elite Two en battant l'Aigle Royal de la Menoua 2-1 en finale, avec un but décisif dans les dernières secondes des prolongations. Il rejoint alors Coton Sport en Elite One et donne à Garoua un deuxième club parmi l'élite.",
    ],
    palmares: [
      { competition: 'Elite Two', type: 'titre', annees: ['2021-22'] },
    ],
    sources: ['https://cameroon-tribune.cm/article.html/49492/fr.html/mtn-elite-two-gazelle-fa'],
  },

  'panthère': {
    nomComplet: 'Panthère Sportive du Ndé',
    alias: ['panthere', 'panthere du nde', 'panthere sportive du nde', 'panthere sportive du nde fc'],
    surnom: 'Nzuimanto',
    ville: 'Bangangté',
    stade: 'Stade municipal de Bangangté',
    histoire: [
      "Club de Bangangté, dans le département du Ndé, la Panthère Sportive est surnommée « Nzuimanto ».",
      "Elle s'est fait une spécialité de la Coupe du Cameroun : victorieuse en 1988, en 2009 et en 2025, et finaliste deux années de suite, en 2014 et en 2015.",
      "Vice-championne d'Elite One en 2024-2025, elle remporte la même année la Coupe du Cameroun et la Super Coupe Roger Milla.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1988, 2009, 2025] },
      { competition: 'Super Coupe Roger Milla', type: 'titre', annees: [2025] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2014, 2015] },
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['2024-25'], libelle: 'Vice-champion' },
    ],
    sources: ['https://en.wikipedia.org/wiki/Panth%C3%A8re_Sportive_du_Nd%C3%A9_FC', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'pwd bamenda': {
    nomComplet: 'PWD Bamenda',
    alias: ['pwd', 'pwd social club bamenda'],
    surnom: 'Abakwa Boys',
    ville: 'Bamenda',
    histoire: [
      "Club de Bamenda, dans le Nord-Ouest, PWD dispute la finale de la Coupe du Cameroun dès 1967, puis de nouveau en 1979.",
      "Le club vit ses plus belles années malgré la crise que traversent les régions anglophones : champion d'Elite One en 2019-2020, il remporte la Coupe du Cameroun l'année suivante face aux Astres de Douala.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['2019-20'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2021] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1967, 1979, 2023] },
    ],
    sources: ['https://en.wikipedia.org/wiki/PWD_Bamenda', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'stade renard': {
    nomComplet: 'Stade Renard de Melong',
    alias: ['stade renard de melong'],
    ville: 'Melong',
    histoire: [
      "Club de Melong, dans le Moungo, le Stade Renard est monté de Ligue 2 vers l'élite après sa promotion en première division.",
      "Son plus grand succès reste la Coupe du Cameroun 2019, remportée 3-2 en finale face à l'AS FAP de Yaoundé.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2019] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'unisport bafang': {
    nomComplet: 'Unisport Football Club de Bafang',
    alias: ['unisport', 'unisport de bafang', 'unisport fc de bafang', 'unisport du haut-nkam'],
    surnom: "Flambeau de l'Ouest",
    ville: 'Bafang',
    couleurs: 'Jaune et rouge',
    stade: 'Stade municipal de Bafang',
    histoire: [
      "Surnommé le « Flambeau de l'Ouest », Unisport est le club de Bafang, dans le Haut-Nkam.",
      "Champion du Cameroun en 1996, le club dispute la Ligue des champions de la CAF l'année suivante et y atteint le deuxième tour.",
      "Habitué des fins de saison en coupe, Unisport perd trois finales de la Coupe du Cameroun (2000, 2005 et 2011) avant de remporter enfin le trophée en 2012, face à New Star de Douala.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1996] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2012] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2000, 2005, 2011] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Unisport_FC_de_Bafang', 'https://en.wikipedia.org/wiki/Cameroonian_Cup', 'https://rsssf.org/tablesk/kamchamp.html'],
  },

  'victoria united': {
    nomComplet: 'Victoria United Football Club',
    alias: ['victoria united fc', 'victoria united limbe'],
    surnom: 'OPOPO (One People, One Power)',
    ville: 'Limbé',
    stade: 'Stade omnisports de Limbé',
    histoire: [
      "Basé à Limbé, sur la côte du Sud-Ouest, Victoria United porte le surnom « OPOPO » : One People, One Power.",
      "Relégué de l'élite en 2004, le club remonte la pente : champion régional du Sud-Ouest en 2021-2022, puis champion d'Elite Two en 2022-2023. Pour son retour parmi l'élite, il réalise l'exploit de remporter le titre de champion du Cameroun en 2023-2024.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: ['2023-24'] },
      { competition: 'Elite Two', type: 'titre', annees: ['2022-23'] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Victoria_United_FC_(Cameroon)'],
  },
  // ═══════════════════════════ MTN ELITE TWO ═══════════════════════════

  'tonnerre': {
    nomComplet: 'Tonnerre Kalara Club de Yaoundé',
    alias: ['tonnerre yaounde', 'tonnerre kalara club', 'tonnerre kalara club de yaounde', 'tkc'],
    surnom: 'Les Kalara Boys',
    ville: 'Yaoundé',
    fondation: 1934,
    stade: 'Stade Ahmadou-Ahidjo',
    histoire: [
      "Fondé en 1934, le Tonnerre Kalara Club est l'un des deux géants de Yaoundé. Il est né d'une scission avec le Canon, son éternel rival du derby de la capitale.",
      "Ses années 1980 sont glorieuses : cinq titres de champion entre 1981 et 1988, en plus de nombreuses Coupes du Cameroun. Sur le continent, le TKC remporte dès 1975 la Coupe d'Afrique des vainqueurs de coupe, puis atteint de nouveau la finale l'année suivante.",
      "De grands noms ont porté son maillot, comme Roger Milla, Rigobert Song, Stephen Tataw ou le Libérien George Weah, futur Ballon d'or, qui y a fait ses débuts en Afrique centrale.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1981, '1982-83', '1983-84', '1986-87', '1987-88'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1958, 1974, 1987, 1989, 1991] },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'titre', annees: [1975], continental: true },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'finale', annees: [1976], continental: true },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1963, 1990, 1994] },
    ],
    grandsJoueurs: ['Roger Milla', 'Rigobert Song', 'Stephen Tataw', 'George Weah', 'Jean II Makoun'],
    sources: ['https://en.wikipedia.org/wiki/Tonnerre_Yaound%C3%A9', 'https://rsssf.org/tablesk/kamchamp.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup', 'https://en.wikipedia.org/wiki/List_of_African_Cup_Winners%27_Cup_finals'],
  },

  'union douala': {
    nomComplet: 'Union Sportive de Douala',
    alias: ['union sportive de douala', 'us douala', 'union sportive douala'],
    surnom: 'Kpa kum',
    ville: 'Douala',
    stade: 'Stade de la Réunification',
    histoire: [
      "Né sous le nom de Jeunesse Bamiléké, l'Union Sportive de Douala est l'un des clubs les plus prestigieux du pays.",
      "Il est l'un des rares clubs camerounais à avoir remporté deux compétitions africaines : la Coupe d'Afrique des clubs champions en 1979, face à Hearts of Oak, puis la Coupe d'Afrique des vainqueurs de coupe en 1981.",
      "Cinq fois champion du Cameroun, de 1969 à 2012, l'Union a aussi soulevé de nombreuses Coupes du Cameroun.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1969, '1975-76', '1977-78', '1989-90', '2011-12'] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [1961, 1969, 1980, 1985, 1997, 2006] },
      { competition: "Coupe d'Afrique des clubs champions", type: 'titre', annees: [1979], continental: true },
      { competition: "Coupe d'Afrique des vainqueurs de coupe", type: 'titre', annees: [1981], continental: true },
      { competition: "Supercoupe d'Afrique", type: 'finale', annees: [1982], continental: true },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [1962, 1978, 1981, 1983, 1984, 2004] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Union_Douala', 'https://en.wikipedia.org/wiki/1979_African_Cup_of_Champions_Clubs', 'https://rsssf.org/tablesk/kamchamp.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'racing': {
    nomComplet: 'Racing Club de Bafoussam',
    alias: ['racing fc', 'racing bafoussam', 'racing club de bafoussam', 'rc bafoussam', 'racing fc bafoussam'],
    ville: 'Bafoussam',
    stade: 'Stade municipal de Bamendzi',
    histoire: [
      "Le Racing Club de Bafoussam est le grand club de la région de l'Ouest à la fin des années 1980 et dans les années 1990.",
      "Il remporte quatre titres de champion du Cameroun (1989, 1992, 1993 et 1995), dispute cinq fois la Ligue des champions de la CAF et gagne la Coupe du Cameroun en 1996, après trois finales perdues.",
      "Le club a notamment formé Geremi Njitap, futur joueur du Real Madrid et de Chelsea. Après des années difficiles, il remporte l'Elite Two en 2020-2021.",
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
      "Habitué des places d'honneur, il termine trois fois vice-champion du Cameroun (2010, 2011 et 2013) et dispute quatre finales de Coupe du Cameroun, sans parvenir à les gagner. Il a aussi participé plusieurs fois aux compétitions africaines.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'finale', annees: ['2009-10', '2010-11', 2013], libelle: '3 fois vice-champion' },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2007, 2009, 2010, 2021] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Les_Astres_FC', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'bamboutos': {
    nomComplet: 'Bamboutos FC de Mbouda',
    alias: ['bamboutos fc', 'bamboutos de mbouda', 'bamboutos fc de mbouda'],
    ville: 'Mbouda',
    fondation: 1966,
    histoire: [
      "Fondé en 1966 à Mbouda, dans le département des Bamboutos, le club porte le nom des monts qui dominent la région.",
      "Il a atteint deux fois la finale de la Coupe du Cameroun, en 2016 face à l'APEJES puis en 2022 face à Coton Sport.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2016, 2022] },
    ],
    sources: ['https://rsssf.org/tablesk/kamfound.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'eding sport': {
    nomComplet: 'Eding Sport FC de la Lékié',
    alias: ['eding sport fc', 'eding sport de la lekie', 'eding'],
    ville: 'Yaoundé (Lékié)',
    fondation: 2012,
    histoire: [
      "Créé en 2012 et attaché au département de la Lékié, Eding Sport est l'une des belles réussites récentes du football camerounais.",
      "Quelques années seulement après sa création, il devient champion du Cameroun en 2017, puis enchaîne avec la Coupe du Cameroun en 2018, face au Lion Blessé de Fotouni.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [2017] },
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2018] },
    ],
    sources: ['https://rsssf.org/tablesk/kamchamp.html', 'https://rsssf.org/tablesk/kamfound.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'sable': {
    nomComplet: 'Sable FC de Batié',
    alias: ['sable fc', 'sable de batie', 'sable fc de batie'],
    ville: 'Batié',
    fondation: 1995,
    histoire: [
      "Fondé en 1995 à Batié, dans l'Ouest, le Sable FC connaît une ascension fulgurante : quatre ans plus tard, il est champion du Cameroun (1999).",
      "Le club dispute ensuite deux finales de Coupe du Cameroun d'affilée, en 2002 et 2003, sans parvenir à les remporter.",
    ],
    palmares: [
      { competition: 'Championnat du Cameroun', type: 'titre', annees: [1999] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2002, 2003] },
    ],
    sources: ['https://rsssf.org/tablesk/kamchamp.html', 'https://rsssf.org/tablesk/kamfound.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'apejes academy': {
    nomComplet: 'APEJES Football Académie de Mfou',
    alias: ['apejes', 'apejes fa', 'apejes football academie', 'apejes de mfou'],
    ville: 'Mfou',
    fondation: 2006,
    histoire: [
      "Académie de formation créée en 2006 à Mfou, près de Yaoundé, l'APEJES mise sur les jeunes joueurs.",
      "Son plus beau succès est la Coupe du Cameroun 2016, remportée 2-0 en finale face aux Bamboutos de Mbouda.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2016] },
    ],
    sources: ['https://rsssf.org/tablesk/kamfound.html', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'fap': {
    nomComplet: 'AS FAP de Yaoundé',
    alias: ['as fap', 'as fap yaounde', 'fap yaounde'],
    ville: 'Yaoundé',
    histoire: [
      "L'AS FAP est le club des Forces armées et de la police, basé à Yaoundé.",
      "Il a atteint la finale de la Coupe du Cameroun en 2019, perdue 3-2 face au Stade Renard de Melong.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2019] },
    ],
    sources: ['https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'avion academy': {
    nomComplet: 'Avion Academy FC',
    alias: ['avion academy fc', 'avion'],
    ville: 'Douala',
    fondation: 2012,
    histoire: [
      "Avion Academy est une académie de football fondée en 2012 à Douala, tournée vers la formation des jeunes joueurs.",
    ],
    palmares: [],
    sources: ['https://rsssf.org/tablesk/kamfound.html'],
  },

  'union abong-mbang': {
    nomComplet: "Union Sportive d'Abong-Mbang",
    alias: ['union abong mbang', 'us abong mbang', 'union sportive abong mbang'],
    ville: 'Abong-Mbang',
    fondation: 1954,
    histoire: [
      "Fondée en 1954, l'Union Sportive d'Abong-Mbang est le club phare de cette ville de la région de l'Est.",
    ],
    palmares: [],
    sources: ['https://rsssf.org/tablesk/kamfound.html'],
  },

  'yafoot': {
    nomComplet: 'Yafoot FC (Yaoundé FC II)',
    alias: ['yafoot fc', 'yaounde fc ii', 'fc yaounde ii'],
    ville: 'Yaoundé',
    histoire: [
      "Yafoot, aussi appelé Yaoundé FC II, est un club de la capitale qui évolue en Elite Two.",
    ],
    palmares: [],
    sources: ['https://cameroon-tribune.cm/article.html/71249/fr.html/details_2'],
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

};

// "Panthère Sportive du Ndé" -> "panthere sportive du nde"
const normaliser = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const INDEX = new Map();
for (const [cle, infos] of Object.entries(CLUBS_INFOS)) {
  INDEX.set(normaliser(cle), infos);
  for (const a of infos.alias ?? []) INDEX.set(normaliser(a), infos);
}

/** Infos d'un club à partir de son nom dans F237 (null si inconnu). */
export function getInfosClub(nom) {
  return INDEX.get(normaliser(nom)) ?? null;
}