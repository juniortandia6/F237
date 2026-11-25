// f237-frontend/src/data/pagesLegales.js
// Textes des pages « Confidentialité » (/confidentialite) et « Conditions d'utilisation » (/conditions), FR + EN.
// Chaque section : { cle, titre, paragraphes } ; cle sert d'ancre (ex. /confidentialite#cookies).
// Dans un paragraphe : **gras** et [lien](adresse) (même syntaxe que les articles).
// ⚠️ À relire avant la mise en ligne (hébergeur, adresse de contact). Ce n'est pas un avis juridique.

export const CONTACT_LEGAL = 'juniortandia6@gmail.com';
export const MISE_A_JOUR = '2026-11-25';
export const AGE_MINIMUM = 16;

const MAIL = `[${CONTACT_LEGAL}](mailto:${CONTACT_LEGAL})`;

export const PAGES_LEGALES = {
  // ══════════════════════════ CONFIDENTIALITÉ ══════════════════════════
  confidentialite: {
    fr: {
      titre: 'Politique de confidentialité',
      chapo: "Quelles informations F237 garde sur toi, pourquoi, et comment les consulter ou les faire supprimer. En résumé : le strict nécessaire pour faire fonctionner ton compte, aucune publicité, aucune revente.",
      sections: [
        { cle: 'responsable', titre: 'Qui est responsable de tes données', paragraphes: [
          "F237 est un site indépendant consacré au football camerounais (MTN Elite One et MTN Elite Two), édité par **Cyr Junior Tandia Mouafou**, au Québec (Canada).",
          `Il est aussi la personne responsable de la protection des renseignements personnels. Pour toute question : ${MAIL}.`,
        ] },
        { cle: 'donnees', titre: 'Les informations que nous recueillons', paragraphes: [
          "**Ton compte** : prénom, nom, adresse e-mail et date d'inscription. Ton mot de passe n'est jamais enregistré en clair : nous gardons seulement une empreinte chiffrée (hachage BCrypt), impossible à relire.",
          "**Si tu utilises « Continuer avec Google »** : Google nous transmet ton identifiant Google, ton nom et ton adresse e-mail. Nous n'avons accès ni à ton mot de passe Google, ni à tes e-mails, ni à tes contacts.",
          "**Ton activité sur F237** : tes pronostics, ton solde et l'historique de tes points, et ta participation aux jeux (par exemple la fantasy).",
          "**Informations techniques** : comme tout site web, le serveur peut enregistrer l'adresse IP, la date et les pages demandées, pour la sécurité et la correction des pannes.",
          "Nous ne recueillons aucune donnée de paiement : F237 est entièrement gratuit.",
        ] },
        { cle: 'utilisation', titre: 'Pourquoi nous les utilisons', paragraphes: [
          "Créer ton compte, te connecter et protéger l'accès à ton compte.",
          "Faire fonctionner les pronostics et les jeux : calcul des points, historique, classements entre joueurs (ton nom peut y apparaître).",
          "Répondre à tes questions et assurer la sécurité du site (détection des abus, des comptes multiples ou des accès non autorisés).",
          "F237 ne fait **aucune publicité ciblée**, n'utilise **aucun outil de mesure d'audience** et **ne vend ni ne loue** tes informations.",
        ] },
        { cle: 'partage', titre: 'Avec qui elles sont partagées', paragraphes: [
          "**Hébergement** : le site et sa base de données sont hébergés chez Microsoft (Azure). Tes informations peuvent donc être stockées hors de ton pays.",
          "**Google** : seulement si tu choisis « Continuer avec Google », pour vérifier ton identité. L'utilisation de tes données par Google relève de sa propre [politique de confidentialité](https://policies.google.com/privacy).",
          "**Polices d'écriture** : les polices du site sont chargées depuis Google Fonts, qui reçoit alors ton adresse IP, comme pour tout fichier téléchargé.",
          "**Données sportives** : les scores et les calendriers proviennent de fournisseurs de données sportives (notamment API-Football). Ces fournisseurs ne reçoivent **aucune** information sur toi.",
          "En dehors de ces cas, tes informations ne sont communiquées à personne, sauf si la loi l'exige.",
        ] },
        { cle: 'cookies', titre: 'Cookies et stockage dans ton navigateur', paragraphes: [
          "F237 n'utilise **ni cookies publicitaires ni cookies de mesure d'audience**.",
          "Le site garde quelques informations dans le stockage local de ton navigateur, uniquement pour fonctionner : ton jeton de connexion (pour rester connecté), la langue choisie, et, pour les administrateurs, certains brouillons. Tu peux les effacer à tout moment en te déconnectant ou en vidant les données du site dans ton navigateur.",
          "Quand tu utilises le bouton « Continuer avec Google », Google peut déposer ses propres cookies sur ses domaines, selon sa politique.",
        ] },
        { cle: 'conservation', titre: 'Combien de temps nous les gardons', paragraphes: [
          "Tes informations sont gardées tant que ton compte existe.",
          "Si tu demandes la suppression de ton compte, tes informations personnelles sont effacées dans un délai de 30 jours. Les journaux techniques ne sont gardés que le temps nécessaire à la sécurité du site.",
        ] },
        { cle: 'securite', titre: 'Sécurité', paragraphes: [
          "Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont hachés et l'espace d'administration est réservé aux comptes autorisés.",
          "Aucun système n'est infaillible : en cas d'incident touchant tes informations et présentant un risque sérieux, nous te préviendrons, ainsi que les autorités concernées lorsque la loi l'exige.",
        ] },
        { cle: 'droits', titre: 'Tes droits', paragraphes: [
          "Tu peux demander à **consulter**, **corriger** ou **supprimer** tes informations, ou retirer ton consentement (ce qui entraîne la fermeture du compte).",
          `Écris à ${MAIL} depuis l'adresse liée à ton compte. Nous répondons dans un délai de 30 jours.`,
          "Si tu n'es pas satisfait de notre réponse, tu peux t'adresser à l'autorité de protection des données de ton pays (au Québec : la Commission d'accès à l'information).",
        ] },
        { cle: 'age', titre: 'Âge minimum', paragraphes: [
          `F237 est réservé aux personnes de **${AGE_MINIMUM} ans et plus**. Si nous apprenons qu'un compte appartient à une personne plus jeune, il sera supprimé.`,
        ] },
        { cle: 'modifications', titre: 'Modifications', paragraphes: [
          "Cette politique peut évoluer avec le site. La date de dernière mise à jour est indiquée en haut de la page ; en cas de changement important, nous l'annoncerons sur le site.",
        ] },
      ],
    },
    en: {
      titre: 'Privacy policy',
      chapo: 'What information F237 keeps about you, why, and how to see it or have it deleted. In short: only what your account needs, no advertising, no selling.',
      sections: [
        { cle: 'responsable', titre: 'Who is responsible for your data', paragraphes: [
          'F237 is an independent website about Cameroonian football (MTN Elite One and MTN Elite Two), published by **Cyr Junior Tandia Mouafou**, in Quebec (Canada).',
          `He is also the person in charge of the protection of personal information. For any question: ${MAIL}.`,
        ] },
        { cle: 'donnees', titre: 'Information we collect', paragraphes: [
          '**Your account**: first name, last name, email address and sign-up date. Your password is never stored in plain text: we only keep an encrypted fingerprint (BCrypt hash) that cannot be read back.',
          '**If you use "Continue with Google"**: Google sends us your Google ID, your name and your email address. We have no access to your Google password, your emails or your contacts.',
          '**Your activity on F237**: your predictions, your balance and points history, and your participation in games (such as fantasy).',
          '**Technical information**: like any website, the server may record the IP address, date and pages requested, for security and troubleshooting.',
          'We collect no payment data: F237 is completely free.',
        ] },
        { cle: 'utilisation', titre: 'Why we use it', paragraphes: [
          'To create your account, sign you in and protect access to your account.',
          'To run predictions and games: points calculation, history, player rankings (your name may appear there).',
          'To answer your questions and keep the site secure (detecting abuse, multiple accounts or unauthorised access).',
          'F237 runs **no targeted advertising**, uses **no audience measurement tools**, and **never sells or rents** your information.',
        ] },
        { cle: 'partage', titre: 'Who it is shared with', paragraphes: [
          '**Hosting**: the site and its database are hosted by Microsoft (Azure). Your information may therefore be stored outside your country.',
          '**Google**: only if you choose "Continue with Google", to verify your identity. Google\'s use of your data is governed by its own [privacy policy](https://policies.google.com/privacy).',
          '**Fonts**: the site\'s fonts are loaded from Google Fonts, which receives your IP address, as with any downloaded file.',
          '**Sports data**: scores and fixtures come from sports data providers (including API-Football). These providers receive **no** information about you.',
          'Apart from these cases, your information is not disclosed to anyone, unless required by law.',
        ] },
        { cle: 'cookies', titre: 'Cookies and browser storage', paragraphes: [
          'F237 uses **no advertising cookies and no audience measurement cookies**.',
          'The site keeps a few items in your browser\'s local storage, only so that it works: your sign-in token (to keep you signed in), your chosen language and, for administrators, some drafts. You can clear them at any time by signing out or clearing the site\'s data in your browser.',
          'When you use the "Continue with Google" button, Google may set its own cookies on its domains, under its own policy.',
        ] },
        { cle: 'conservation', titre: 'How long we keep it', paragraphes: [
          'Your information is kept for as long as your account exists.',
          'If you ask for your account to be deleted, your personal information is erased within 30 days. Technical logs are kept only as long as needed for the site\'s security.',
        ] },
        { cle: 'securite', titre: 'Security', paragraphes: [
          'Exchanges with the site are encrypted (HTTPS), passwords are hashed and the administration area is restricted to authorised accounts.',
          'No system is foolproof: if an incident affecting your information creates a serious risk, we will notify you, and the relevant authorities where the law requires it.',
        ] },
        { cle: 'droits', titre: 'Your rights', paragraphes: [
          'You can ask to **access**, **correct** or **delete** your information, or withdraw your consent (which closes the account).',
          `Write to ${MAIL} from the address linked to your account. We reply within 30 days.`,
          'If you are not satisfied with our answer, you can contact the data protection authority of your country (in Quebec: the Commission d\'accès à l\'information).',
        ] },
        { cle: 'age', titre: 'Minimum age', paragraphes: [
          `F237 is for people aged **${AGE_MINIMUM} and over**. If we learn that an account belongs to someone younger, it will be deleted.`,
        ] },
        { cle: 'modifications', titre: 'Changes', paragraphes: [
          'This policy may change as the site evolves. The last update date is shown at the top of the page; significant changes will be announced on the site.',
        ] },
      ],
    },
  },

  // ══════════════════════════ CONDITIONS ══════════════════════════
  conditions: {
    fr: {
      titre: "Conditions d'utilisation",
      chapo: "Les règles du jeu de F237. En créant un compte ou en utilisant le site, tu les acceptes.",
      sections: [
        { cle: 'presentation', titre: 'Présentation', paragraphes: [
          "F237 est un site gratuit et indépendant d'informations, de statistiques et de jeux de pronostics sur le football camerounais (MTN Elite One et MTN Elite Two). Il est édité par **Cyr Junior Tandia Mouafou**, au Québec (Canada).",
          "F237 n'est affilié ni à la FECAFOOT, ni à la Ligue de football professionnel du Cameroun, ni à MTN, ni aux clubs. Les noms, logos et marques cités appartiennent à leurs propriétaires respectifs.",
        ] },
        { cle: 'compte', titre: 'Ton compte', paragraphes: [
          `Il faut avoir **${AGE_MINIMUM} ans ou plus** pour créer un compte.`,
          "Tu t'engages à donner des informations exactes, à n'avoir **qu'un seul compte** et à garder ton mot de passe secret. Tu es responsable de ce qui se fait avec ton compte.",
          "Tu peux te connecter avec une adresse e-mail et un mot de passe, ou avec ton compte Google.",
        ] },
        { cle: 'points', titre: 'Points et pronostics', paragraphes: [
          "Les points F237 sont **entièrement fictifs et gratuits**. Ils n'ont **aucune valeur en argent** : ils ne peuvent être ni achetés, ni vendus, ni échangés, ni retirés, ni convertis en argent, en lots ou en cadeaux.",
          "F237 **n'est pas un service de jeux d'argent ni de paris sportifs**. Les pronostics servent uniquement au jeu et aux classements entre fans.",
          "Un bonus de bienvenue est offert à l'inscription. F237 peut corriger un solde en cas d'erreur (par exemple un score corrigé après coup) ou d'abus, et faire évoluer les règles des jeux, par exemple d'une saison à l'autre.",
        ] },
        { cle: 'donnees-sportives', titre: 'Données sportives', paragraphes: [
          "Les scores, calendriers et statistiques proviennent de fournisseurs de données (notamment API-Football) et de corrections faites à la main. Malgré notre attention, ils peuvent contenir des **erreurs ou des retards**.",
          "Ces informations sont fournies à titre indicatif. Ne t'en sers pas pour des décisions importantes, notamment des paris d'argent sur d'autres sites.",
        ] },
        { cle: 'interdits', titre: 'Ce qui est interdit', paragraphes: [
          "Créer plusieurs comptes, utiliser des robots ou des scripts pour jouer, ou exploiter une faille pour gagner des points.",
          "Copier ou extraire le contenu du site de façon massive ou automatisée.",
          "Tenter d'accéder à l'espace d'administration, aux comptes des autres ou de perturber le fonctionnement du site.",
          "Usurper l'identité d'une autre personne.",
        ] },
        { cle: 'propriete', titre: 'Contenu et propriété', paragraphes: [
          "Les textes, visuels, articles et le code de F237 sont protégés. Tu peux partager un lien vers une page ; pour réutiliser un contenu, demande-nous d'abord.",
          "Les logos des clubs et des compétitions appartiennent à leurs propriétaires. Les informations reprises d'autres médias sont citées avec leur source.",
        ] },
        { cle: 'disponibilite', titre: 'Disponibilité du service', paragraphes: [
          "F237 est fourni gratuitement, « tel quel ». Le site peut être interrompu, modifié ou arrêté, notamment pour maintenance, sans que cela donne droit à une compensation.",
        ] },
        { cle: 'suspension', titre: 'Suspension et suppression du compte', paragraphes: [
          "En cas de non-respect de ces conditions, F237 peut corriger les points concernés, suspendre ou supprimer le compte.",
          `Tu peux demander la suppression de ton compte à tout moment en écrivant à ${MAIL}.`,
        ] },
        { cle: 'responsabilite', titre: 'Responsabilité', paragraphes: [
          "Dans la mesure permise par la loi, F237 ne peut être tenu responsable des dommages liés à l'utilisation du site, à une indisponibilité ou à une erreur dans les données sportives.",
        ] },
        { cle: 'modifications', titre: 'Modifications et droit applicable', paragraphes: [
          "Ces conditions peuvent évoluer ; la date de mise à jour figure en haut de la page. Continuer à utiliser le site après une modification vaut acceptation.",
          "Ces conditions sont régies par les lois applicables au Québec et au Canada.",
          `Une question ? ${MAIL}`,
        ] },
      ],
    },
    en: {
      titre: 'Terms of use',
      chapo: 'The rules of F237. By creating an account or using the site, you accept them.',
      sections: [
        { cle: 'presentation', titre: 'About F237', paragraphes: [
          'F237 is a free, independent website for news, statistics and prediction games about Cameroonian football (MTN Elite One and MTN Elite Two). It is published by **Cyr Junior Tandia Mouafou**, in Quebec (Canada).',
          'F237 is not affiliated with FECAFOOT, the Cameroon professional football league, MTN or the clubs. Names, logos and trademarks belong to their respective owners.',
        ] },
        { cle: 'compte', titre: 'Your account', paragraphes: [
          `You must be **${AGE_MINIMUM} or older** to create an account.`,
          'You agree to provide accurate information, to have **only one account** and to keep your password secret. You are responsible for what is done with your account.',
          'You can sign in with an email address and password, or with your Google account.',
        ] },
        { cle: 'points', titre: 'Points and predictions', paragraphes: [
          'F237 points are **entirely fictitious and free**. They have **no monetary value**: they cannot be bought, sold, exchanged, withdrawn or converted into money, prizes or gifts.',
          'F237 **is not a gambling or sports betting service**. Predictions are only used for the game and for rankings between fans.',
          'A welcome bonus is given on sign-up. F237 may correct a balance in case of error (for example a score corrected afterwards) or abuse, and may change the game rules, for example from one season to the next.',
        ] },
        { cle: 'donnees-sportives', titre: 'Sports data', paragraphes: [
          'Scores, fixtures and statistics come from data providers (including API-Football) and from manual corrections. Despite our care, they may contain **errors or delays**.',
          'This information is provided for guidance only. Do not rely on it for important decisions, especially real-money bets on other sites.',
        ] },
        { cle: 'interdits', titre: 'What is not allowed', paragraphes: [
          'Creating several accounts, using bots or scripts to play, or exploiting a flaw to earn points.',
          'Copying or extracting the site\'s content in bulk or automatically.',
          'Trying to access the administration area or other people\'s accounts, or disrupting the site.',
          'Impersonating another person.',
        ] },
        { cle: 'propriete', titre: 'Content and ownership', paragraphes: [
          'F237\'s texts, visuals, articles and code are protected. You may share a link to a page; to reuse content, ask us first.',
          'Club and competition logos belong to their owners. Information taken from other media is credited to its source.',
        ] },
        { cle: 'disponibilite', titre: 'Service availability', paragraphes: [
          'F237 is provided free of charge, "as is". The site may be interrupted, changed or discontinued, including for maintenance, without any right to compensation.',
        ] },
        { cle: 'suspension', titre: 'Account suspension and deletion', paragraphes: [
          'If these terms are not respected, F237 may correct the points involved, suspend or delete the account.',
          `You can ask for your account to be deleted at any time by writing to ${MAIL}.`,
        ] },
        { cle: 'responsabilite', titre: 'Liability', paragraphes: [
          'To the extent permitted by law, F237 is not liable for damage related to the use of the site, downtime or errors in sports data.',
        ] },
        { cle: 'modifications', titre: 'Changes and governing law', paragraphes: [
          'These terms may change; the update date is shown at the top of the page. Continuing to use the site after a change means you accept it.',
          'These terms are governed by the laws applicable in Quebec and Canada.',
          `A question? ${MAIL}`,
        ] },
      ],
    },
  },
};