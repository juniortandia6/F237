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
    nomComplet: 'Fauve Azur Elite',
    alias: ['fauve azur elite', 'fauve azur', 'fauve azur elite fc', 'fauve azur de yaounde'],
    ville: 'Yaoundé',
    histoire: [
      "Club de Yaoundé, Fauve Azur Elite fait son grand retour en MTN Elite One pour la saison 2023-2024, sous la présidence de Norbert Nya.",
      "Pour cette saison disputée en deux phases, il termine dans la poule de maintien.",
    ],
    palmares: [],
    sources: ['https://cameroon-tribune.cm/article.html/60447/fr.html/details_2'],
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
      "Il évolue en Elite Two, où il a terminé huitième en 2023-2024.",
    ],
    palmares: [],
    sources: ['https://en.wikipedia.org/wiki/Dragon_Club_(Yaound%C3%A9)', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'feutcheu': {
    nomComplet: 'Feutcheu FC',
    alias: ['feutcheu fc', 'djiko', 'djiko fc', 'djiko fc de bandjoun'],
    ville: 'Bandjoun',
    fondation: 2011,
    couleurs: 'Rouge et blanc',
    stade: 'Stade de Kouekong (Bafoussam)',
    histoire: [
      "Fondé en 2011 à Bandjoun sous le nom de Djiko FC, le club a disputé l'Elite One à la fin des années 2010.",
      "En 2020, après sa reprise par Joseph Feutcheu, il est rebaptisé Feutcheu FC. Il joue ses matchs à domicile au stade de Kouekong, à Bafoussam.",
    ],
    palmares: [],
    sources: ['https://en.wikipedia.org/wiki/Djiko_FC_de_Bandjoun', 'https://rsssf.org/tablesk/kamfound.html'],
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
    alias: ['atlantic sa', 'atlantic s.a', 'atlantic de kribi', 'atlantic sports academy'],
    ville: 'Kribi',
    histoire: [
      "Club de Kribi, dans le Sud, Atlantic Sports Academy remporte les Interpoules nationales en août 2024 en battant l'Union Sportive d'Abong-Mbang (1-0) en finale. Les deux clubs montent ensemble en Elite Two.",
      "En 2026, il se qualifie pour les play-offs d'accession à l'Elite One.",
    ],
    palmares: [
      { competition: 'Interpoules nationales', type: 'titre', annees: [2024] },
    ],
    sources: ['https://cameroon-tribune.cm/article.html/66594/fr.html/details_2', 'https://cameroon-tribune.cm/article.html/77091/fr.html/details_2'],
  },

  'kumba': {
    nomComplet: 'Kumba City FC',
    alias: ['kumba city', 'kumba city fc'],
    ville: 'Kumba',
    histoire: [
      "Représentant du Sud-Ouest, Kumba City FC remporte les Interpoules nationales en septembre 2025 au bout du suspense, face au Sable de Batié (4-3 après prolongation). Il découvre l'Elite Two dans la foulée.",
      "Pour sa première saison, il se qualifie pour les play-offs d'accession à l'Elite One.",
    ],
    palmares: [
      { competition: 'Interpoules nationales', type: 'titre', annees: [2025] },
    ],
    sources: ['https://www.cameroon-tribune.cm/article.html/72740/fr.html/details_2', 'https://cameroun24.net/article/70685-interpoules-2025-kumba-city-sacr-champion-au-bout-du-suspense-sable-de-bati-aussi-promu.html', 'https://cameroon-tribune.cm/article.html/77091/fr.html/details_2'],
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
      "Il prend sa revanche en 2017 en remportant le trophée face à l'UMS de Loum (1-0), après avoir découvert les compétitions africaines avec la Coupe de la Confédération 2016.",
    ],
    palmares: [
      { competition: 'Coupe du Cameroun', type: 'titre', annees: [2017] },
      { competition: 'Coupe du Cameroun', type: 'finale', annees: [2012] },
    ],
    sources: ['https://en.wikipedia.org/wiki/New_Star_de_Douala', 'https://en.wikipedia.org/wiki/Cameroonian_Cup'],
  },

  'mintack': {
    nomComplet: 'Mintack FC de la Haute-Sanaga',
    alias: ['mintack fc', 'mintack de la haute sanaga', 'mintack fc de haute-sanaga'],
    ville: 'Nanga-Eboko',
    fondation: 2015,
    histoire: [
      "Fondé en 2015 à Nanga-Eboko, dans la Haute-Sanaga, Mintack FC remporte les Interpoules nationales en 2026 en battant Elecsport de Limbé en finale (1-0), à Yaoundé.",
      "Il découvre l'Elite Two lors de la saison 2026-2027.",
    ],
    palmares: [
      { competition: 'Interpoules nationales', type: 'titre', annees: [2026] },
    ],
    sources: ['https://cameroon-tribune.cm/article.html/79371/fr.html/details_2', 'https://rsssf.org/tablesk/kamfound.html'],
  },

  'elecsport': {
    nomComplet: 'Elecsport de Limbé',
    alias: ['electsport', 'elecsport de limbe', 'elecsport fc'],
    ville: 'Limbé',
    fondation: 1983,
    histoire: [
      "Club de Limbé fondé en 1983, Elecsport atteint la finale des Interpoules nationales en 2026, perdue face à Mintack FC (1-0). Les deux finalistes montent en Elite Two pour la saison 2026-2027.",
    ],
    palmares: [],
    sources: ['https://cameroon-tribune.cm/article.html/79371/fr.html/details_2', 'https://rsssf.org/tablesk/kamfound.html'],
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
  "aigle royal de moungo": {
    "couleurs": "Blue and white",
    "histoire": [
      "Founded in the 1930s in Nkongsamba, in the Moungo department, Aigle Royal is one of the historic clubs of Cameroonian football.",
      "The club enjoyed its golden age in the 1970s: Cameroonian champion in 1971, it played in the African Cup of Champions Clubs the following year and reached two Cameroon Cup finals (1970 and 1975). It added a second league title in 1994.",
      "After a long spell in the lower divisions, Aigle Royal won Elite Two in the 2023-2024 season and returned to Elite One for 2024-2025."
    ]
  },
  "aigle royal": {
    "surnom": "El Pacha, the \"Rapide de la Menoua\"",
    "histoire": [
      "Founded in June 1932 in Dschang, in the West region, Aigle Royal de la Menoua is one of the oldest clubs in the country.",
      "Runner-up in the Cameroonian league in 2005, it made its CAF Champions League debut in 2006, then reached the round of 16 of the Confederation Cup in 2009. It has played in two Cameroon Cup finals, in 2008 and 2024.",
      "Elite Two champion in 2024-2025, the club returned to the top flight for the 2025-2026 season."
    ]
  },
  "canon": {
    "surnom": "Kpa-Kum, Mekok Me Ngonda",
    "histoire": [
      "Founded on 11 November 1930, Canon Sportif de Yaoundé is one of the most decorated clubs in Africa. Tonnerre Kalara Club was born from a split with Canon, and the two contest the Yaoundé derby.",
      "Its 1970s and 1980s were exceptional: around ten league titles, many Cameroon Cups and three African Cups of Champions Clubs, led in particular by captain Théophile Abega.",
      "After years of administrative instability, the club returned to the top of Elite One in the early 2020s."
    ]
  },
  "colombe": {
    "surnom": "Les Blancs (The Whites)",
    "histoire": [
      "A club from Sangmélima, in the Dja-et-Lobo department, Colombe first reached the top division in 1986-1987 before dropping out in 1993.",
      "After 23 years away, it returned to the top flight in 2016. It established itself there and then enjoyed the best period in its history: the Cameroon Cup and the Roger Milla Super Cup in 2024, then a first Cameroonian league title in 2024-2025, retained in the 2026 season."
    ]
  },
  "cotonsport": {
    "surnom": "Les Cotonniers (The Cotton Growers)",
    "histoire": [
      "Founded in 1986 in Garoua, in the North, Coton Sport reached the top division in 1992 and, from the late 1990s, became the dominant club in Cameroonian football.",
      "The club has also made its mark on the African stage: runner-up in the CAF Cup in 2003, then in the CAF Champions League in 2008 against Al Ahly, it reached the Champions League semi-finals again in 2013.",
      "With 18 league titles, including seven in a row from 2003 to 2008, Coton Sport is by far the most successful club in the Cameroonian championship."
    ]
  },
  "dynamo de douala": {
    "surnom": "Bon Ba Djob",
    "histoire": [
      "Founded in 1948, Dynamo is one of the historic clubs of Douala, nicknamed \"Bon Ba Djob\".",
      "It has won the Cameroon Cup three times, in 1979, 1981 and 1998. After a difficult period marked by internal disputes and a spell in the second division, the club returned to Elite One."
    ]
  },
  "fortuna mfou": {
    "histoire": [
      "Founded in 1998 in Mfou, near Yaoundé, AS Fortuna was promoted to Elite One in 2018.",
      "After a difficult first season (14th), the club quickly settled in the top half of the table: 4th in 2019 and 2020, then 3rd in 2020-2021, its best finish."
    ]
  },
  "gazelle": {
    "histoire": [
      "A young club created in 2015 in Garoua, Gazelle FA climbed the divisions very quickly.",
      "In July 2022, it won Elite Two by beating Aigle Royal de la Menoua 2-1 in the final, with a decisive goal in the last seconds of extra time. It then joined Coton Sport in Elite One, giving Garoua a second top-flight club."
    ]
  },
  "panthère": {
    "surnom": "Nzuimanto",
    "histoire": [
      "A club from Bangangté, in the Ndé department, Panthère Sportive is nicknamed \"Nzuimanto\".",
      "It has made the Cameroon Cup its speciality: winner in 1988, 2009 and 2025, and runner-up two years in a row, in 2014 and 2015.",
      "Elite One runner-up in 2024-2025, it won the Cameroon Cup and the Roger Milla Super Cup in the same year."
    ]
  },
  "pwd bamenda": {
    "surnom": "Abakwa Boys",
    "histoire": [
      "A club from Bamenda, in the North-West, PWD played in the Cameroon Cup final as early as 1967, and again in 1979.",
      "The club has enjoyed its best years despite the crisis affecting the English-speaking regions: Elite One champion in 2019-2020, it won the Cameroon Cup the following year against Les Astres de Douala."
    ]
  },
  "stade renard": {
    "histoire": [
      "A club from Melong, in the Moungo department, Stade Renard rose from Ligue 2 to the top flight after its promotion to the first division.",
      "Its greatest success remains the 2019 Cameroon Cup, won 3-2 in the final against AS FAP of Yaoundé."
    ]
  },
  "unisport bafang": {
    "surnom": "Flambeau de l'Ouest (Torch of the West)",
    "couleurs": "Yellow and red",
    "histoire": [
      "Nicknamed the \"Torch of the West\", Unisport is the club of Bafang, in the Haut-Nkam department.",
      "Cameroonian champion in 1996, the club played in the CAF Champions League the following year and reached the second round.",
      "A regular in end-of-season cup runs, Unisport lost three Cameroon Cup finals (2000, 2005 and 2011) before finally lifting the trophy in 2012, against New Star de Douala."
    ]
  },
  "victoria united": {
    "surnom": "OPOPO (One People, One Power)",
    "histoire": [
      "Based in Limbé, on the South-West coast, Victoria United goes by the nickname \"OPOPO\": One People, One Power.",
      "Relegated from the top flight in 2004, the club bounced back: South-West regional champion in 2021-2022, then Elite Two champion in 2022-2023. On its return to the top flight, it pulled off the feat of winning the Cameroonian league title in 2023-2024."
    ]
  },
  "tonnerre": {
    "surnom": "The Kalara Boys",
    "histoire": [
      "Founded in 1934, Tonnerre Kalara Club is one of the two giants of Yaoundé. It was born from a split with Canon, its eternal rival in the capital's derby.",
      "Its 1980s were glorious: five league titles between 1981 and 1988, plus many Cameroon Cups. On the continent, TKC won the African Cup Winners' Cup as early as 1975, then reached the final again the following year.",
      "Big names have worn its shirt, such as Roger Milla, Rigobert Song, Stephen Tataw and the Liberian George Weah, a future Ballon d'Or winner, who made his debut in Central Africa there."
    ]
  },
  "union douala": {
    "surnom": "Kpa kum",
    "histoire": [
      "Founded as Jeunesse Bamiléké, Union Sportive de Douala is one of the most prestigious clubs in the country.",
      "It is one of the few Cameroonian clubs to have won two African competitions: the African Cup of Champions Clubs in 1979, against Hearts of Oak, then the African Cup Winners' Cup in 1981.",
      "Five-time Cameroonian champion, from 1969 to 2012, Union has also lifted many Cameroon Cups."
    ]
  },
  "racing": {
    "histoire": [
      "Racing Club de Bafoussam was the leading club of the West region in the late 1980s and the 1990s.",
      "It won four Cameroonian league titles (1989, 1992, 1993 and 1995), played in the CAF Champions League five times and won the Cameroon Cup in 1996, after losing three finals.",
      "The club notably developed Geremi Njitap, who went on to play for Real Madrid and Chelsea. After some difficult years, it won Elite Two in 2020-2021."
    ]
  },
  "les astres": {
    "surnom": "The Brazilians of Bépanda",
    "histoire": [
      "Founded in 2002 in the Bépanda district of Douala, the club is nicknamed \"the Brazilians of Bépanda\" for its attacking style of play.",
      "A regular among the leading places, it finished runner-up in the Cameroonian league three times (2010, 2011 and 2013) and played in four Cameroon Cup finals without managing to win one. It has also taken part in African competitions several times."
    ]
  },
  "bamboutos": {
    "histoire": [
      "Founded in 1966 in Mbouda, in the Bamboutos department, the club is named after the mountains that dominate the region.",
      "It has reached the Cameroon Cup final twice, in 2016 against APEJES and in 2022 against Coton Sport."
    ]
  },
  "eding sport": {
    "histoire": [
      "Created in 2012 and attached to the Lékié department, Eding Sport is one of the great recent success stories of Cameroonian football.",
      "Only a few years after its creation, it became Cameroonian champion in 2017, then followed up with the Cameroon Cup in 2018, against Lion Blessé de Fotouni."
    ]
  },
  "sable": {
    "histoire": [
      "Founded in 1995 in Batié, in the West, Sable FC enjoyed a meteoric rise: four years later, it was Cameroonian champion (1999).",
      "The club then played in two consecutive Cameroon Cup finals, in 2002 and 2003, without managing to win them."
    ]
  },
  "apejes academy": {
    "histoire": [
      "A training academy created in 2006 in Mfou, near Yaoundé, APEJES focuses on young players.",
      "Its finest success is the 2016 Cameroon Cup, won 2-0 in the final against Bamboutos de Mbouda."
    ]
  },
  "fap": {
    "histoire": [
      "AS FAP is the club of the Armed Forces and Police, based in Yaoundé.",
      "It reached the Cameroon Cup final in 2019, losing 3-2 to Stade Renard de Melong."
    ]
  },
  "avion academy": {
    "histoire": [
      "Avion Academy is a football academy founded in 2012 in Douala, focused on developing young players."
    ]
  },
  "union abong-mbang": {
    "histoire": [
      "Founded in 1954, Union Sportive d'Abong-Mbang is the flagship club of this town in the East region."
    ]
  },
  "yafoot": {
    "histoire": [
      "Yafoot, also known as Yaoundé FC II, is a club from the capital that plays in Elite Two."
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
    "histoire": [
      "A club from Yaoundé, Fauve Azur Elite made its big comeback in MTN Elite One for the 2023-2024 season, under the presidency of Norbert Nya.",
      "In that season, played in two phases, it finished in the relegation pool."
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
      "It plays in Elite Two, where it finished eighth in 2023-2024."
    ]
  },
  "feutcheu": {
    "couleurs": "Red and white",
    "histoire": [
      "Founded in 2011 in Bandjoun as Djiko FC, the club played in Elite One in the late 2010s.",
      "In 2020, after being taken over by Joseph Feutcheu, it was renamed Feutcheu FC. It plays its home games at the Kouekong stadium in Bafoussam."
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
      "A club from Kribi, in the South, Atlantic Sports Academy won the National Inter-pools in August 2024 by beating Union Sportive d'Abong-Mbang (1-0) in the final. Both clubs were promoted to Elite Two together.",
      "In 2026, it qualified for the Elite One promotion play-offs."
    ]
  },
  "kumba": {
    "histoire": [
      "Representing the South-West, Kumba City FC won the National Inter-pools in September 2025 after a thrilling final against Sable de Batié (4-3 after extra time). It went straight into Elite Two.",
      "In its first season, it qualified for the Elite One promotion play-offs."
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
      "It took its revenge in 2017 by winning the trophy against UMS de Loum (1-0), after making its African debut in the 2016 Confederation Cup."
    ]
  },
  "mintack": {
    "histoire": [
      "Founded in 2015 in Nanga-Eboko, in the Haute-Sanaga department, Mintack FC won the 2026 National Inter-pools by beating Elecsport de Limbé in the final (1-0), in Yaoundé.",
      "It makes its Elite Two debut in the 2026-2027 season."
    ]
  },
  "elecsport": {
    "histoire": [
      "A club from Limbé founded in 1983, Elecsport reached the 2026 National Inter-pools final, losing to Mintack FC (1-0). Both finalists were promoted to Elite Two for the 2026-2027 season."
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
  "Coupe d'Afrique des clubs champions": 'African Cup of Champions Clubs',
  "Coupe d'Afrique des vainqueurs de coupe": "African Cup Winners' Cup",
  'Ligue des champions de la CAF': 'CAF Champions League',
  'Coupe de la CAF': 'CAF Cup',
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