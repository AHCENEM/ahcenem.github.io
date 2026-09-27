// ==========================================================================
// projets.js : chargement des projets et création des cartes
// Règle : le site n'affiche que les dépôts publics GitHub.
// Les études de cas de data/projects.json enrichissent ces dépôts.
// ==========================================================================

// Éléments de la page
const grilleProjets = document.getElementById("grille-projets");
const chiffreProjets = document.getElementById("chiffre-projets");

// Dépôts à ne jamais afficher : le README de profil et le dépôt du site
const depotsExclus = ["ahcenem", "ahcenem.github.io"];

// Langages qui classent un dépôt dans la catégorie Data ou Web
const langagesData = ["Jupyter Notebook", "Python", "R", "SQL", "TSQL", "PLpgSQL"];
const langagesWeb = ["PHP", "HTML", "JavaScript", "CSS", "TypeScript"];

// Lignes possibles d'une étude de cas, dans l'ordre d'affichage
const lignesEtude = [
  { cle: "question", intitule: "Question métier" },
  { cle: "besoin", intitule: "Besoin" },
  { cle: "donnees", intitule: "Données" },
  { cle: "demarche", intitule: "Démarche" },
  { cle: "realisation", intitule: "Réalisation" },
  { cle: "securite", intitule: "Sécurité" },
  { cle: "role", intitule: "Mon rôle" },
];

// Protection contre la faille XSS (fonction du cours) :
// le texte est placé dans une balise avec textContent, puis relu en HTML inoffensif
const sanitizeHtml = (text) => {
  const tempHtml = document.createElement("div");
  tempHtml.textContent = text;
  return tempHtml.innerHTML;
};

// --------------------------------------------------------------------------
// Préparation des données
// --------------------------------------------------------------------------

// true si le dépôt doit être affiché (tous les dépôts publics sauf les exclus)
const estAffiche = (depot) => !depotsExclus.includes(depot.name.toLowerCase());

// Catégorie d'un dépôt : d'abord les topics, sinon le langage
const trouverCategorie = (depot) => {
  if (depot.topics.includes("data")) {
    return "data";
  }
  if (depot.topics.includes("web")) {
    return "web";
  }
  if (langagesData.includes(depot.language)) {
    return "data";
  }
  if (langagesWeb.includes(depot.language)) {
    return "web";
  }
  // Langage inconnu (par exemple un dépôt Power BI) : Data, le métier principal
  return "data";
};

// Titre lisible à partir du nom du dépôt : « mon-projet » devient « Mon projet »
const creerTitre = (nomDepot) => {
  const texte = nomDepot.replaceAll("-", " ");
  return texte.charAt(0).toUpperCase() + texte.slice(1);
};

// Transforme un dépôt GitHub en projet, complété par son étude de cas si elle existe
const creerProjet = (depot, etudes) => {
  const etude = etudes.find((etudeCas) => etudeCas.depot === depot.name);

  const projet = {
    titre: creerTitre(depot.name),
    description: depot.description,
    categorie: trouverCategorie(depot),
    langage: depot.language,
    url: depot.html_url,
    date: depot.pushed_at,
  };

  // « ... » (décomposition) : copie les champs de projet, puis ceux de l'étude de cas.
  // Un champ présent dans les deux (le titre par exemple) prend la valeur de l'étude.
  return { ...projet, ...etude };
};

// Ordre d'affichage : carte vedette, puis projets data, puis projets web
const ordonnerProjets = (projets) => {
  const vedettes = projets.filter((projet) => projet.vedette);
  const data = projets.filter((projet) => !projet.vedette && projet.categorie === "data");
  const web = projets.filter((projet) => !projet.vedette && projet.categorie === "web");
  return vedettes.concat(data, web);
};

// --------------------------------------------------------------------------
// Création des cartes
// --------------------------------------------------------------------------

// Date lisible en français : « 27 septembre 2026 »
const formaterDate = (dateIso) => {
  const date = new Date(dateIso);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

// Étiquettes en haut de la carte : catégorie et, si besoin, type de projet
const creerEtiquettes = (projet) => {
  const nomCategorie = projet.categorie === "web" ? "Web" : "Data";
  let etiquettes = `<span class="etiquette etiquette--${projet.categorie}">${nomCategorie}</span>`;

  if (projet.equipe) {
    etiquettes += `<span class="etiquette etiquette--neutre">${sanitizeHtml(projet.equipe)}</span>`;
  }

  return `<div class="carte-projet__etiquettes">${etiquettes}</div>`;
};

// Une ligne de l'étude de cas (intitulé + texte). Rien si le texte est vide.
const creerLigneEtude = (intitule, texte) => {
  if (!texte) {
    return "";
  }

  return `
    <div class="etude__ligne">
      <dt>${intitule}</dt>
      <dd>${sanitizeHtml(texte)}</dd>
    </div>`;
};

// Les chiffres clés du résultat, affichés comme dans un tableau de bord
const creerChiffres = (chiffres) => {
  if (chiffres.length === 0) {
    return "";
  }

  const elements = chiffres.map((chiffre) => `
    <li class="etude__chiffre">
      <span class="etude__chiffre-valeur">${sanitizeHtml(chiffre.valeur)}</span>
      <span class="etude__chiffre-legende">${sanitizeHtml(chiffre.legende)}</span>
    </li>`);

  return `<ul class="etude__chiffres">${elements.join("")}</ul>`;
};

// La ligne « Résultat » : chiffres clés et phrase de résultat. Rien si les deux sont vides.
const creerLigneResultat = (projet) => {
  // « || [] » : si le projet n'a pas de chiffres, on prend une liste vide
  const chiffres = projet.chiffres || [];

  if (chiffres.length === 0 && !projet.resultat) {
    return "";
  }

  const phrase = projet.resultat ? `<p>${sanitizeHtml(projet.resultat)}</p>` : "";

  return `
    <div class="etude__ligne etude__ligne--resultat">
      <dt>Résultat</dt>
      <dd>${creerChiffres(chiffres)}${phrase}</dd>
    </div>`;
};

// Le contenu principal : l'étude de cas si elle existe, sinon la description GitHub
const creerContenu = (projet) => {
  const lignes = lignesEtude.map((ligne) => creerLigneEtude(ligne.intitule, projet[ligne.cle]));
  const etude = lignes.join("") + creerLigneResultat(projet) + creerLigneEtude("Recommandation", projet.recommandation);

  if (etude.trim() !== "") {
    return `<dl class="etude">${etude}</dl>`;
  }

  const description = projet.description || "Description à venir.";
  return `<p class="carte-projet__description">${sanitizeHtml(description)}</p>`;
};

// La liste des outils : ceux de l'étude de cas, sinon le langage du dépôt
const creerListeOutils = (projet) => {
  let outils = [];

  if (projet.outils) {
    outils = projet.outils;
  } else if (projet.langage) {
    outils = [projet.langage];
  }

  if (outils.length === 0) {
    return "";
  }

  const elements = outils.map((outil) => `<li>${sanitizeHtml(outil)}</li>`);
  return `<ul class="liste-outils">${elements.join("")}</ul>`;
};

// Les liens : le dépôt GitHub, puis ceux de l'étude (notebook, démo). Adresses https uniquement.
const creerLiens = (projet) => {
  const liens = [{ libelle: "Code sur GitHub", url: projet.url }].concat(projet.liens || []);
  const liensValides = liens.filter((lien) => lien.url && lien.url.startsWith("https://"));

  const boutons = liensValides.map((lien) => `
    <a class="bouton bouton--secondaire bouton--petit" href="${sanitizeHtml(lien.url)}">${sanitizeHtml(lien.libelle)}</a>`);

  return `<div class="carte-projet__liens">${boutons.join("")}</div>`;
};

// Une carte complète : étiquettes, titre, étude de cas, outils, date, liens
const creerCarteProjet = (projet) => {
  const classeVedette = projet.vedette ? " carte-projet--vedette" : "";

  return `
    <article class="carte carte-projet${classeVedette}" data-categorie="${projet.categorie}">
      ${creerEtiquettes(projet)}
      <h3 class="carte-projet__titre">${sanitizeHtml(projet.titre)}</h3>
      ${creerContenu(projet)}
      ${creerListeOutils(projet)}
      <p class="carte-projet__date">Mis à jour le ${formaterDate(projet.date)}</p>
      ${creerLiens(projet)}
    </article>`;
};

// --------------------------------------------------------------------------
// Affichage
// --------------------------------------------------------------------------

// Affiche les cartes et met à jour le chiffre clé de l'accueil
const afficherProjets = (projets) => {
  const cartes = projets.map((projet) => creerCarteProjet(projet));
  grilleProjets.innerHTML = cartes.join("");
  chiffreProjets.textContent = projets.length;
};

// Affichage de secours si rien ne peut être chargé : la section n'est jamais vide
const afficherErreurProjets = () => {
  grilleProjets.innerHTML = `
    <p class="message-erreur">
      Les projets n'ont pas pu être chargés. Vous pouvez les consulter sur
      <a href="https://github.com/AHCENEM">mon GitHub</a>.
    </p>`;
};

// Prépare la liste des projets à partir des dépôts et des études de cas
const preparerProjets = (depots, etudes) => {
  const projets = depots
    .filter((depot) => estAffiche(depot))
    .map((depot) => creerProjet(depot, etudes));
  return ordonnerProjets(projets);
};

// Charge data/projects.json (études de cas + dépôts de secours), puis affiche les projets
const chargerProjets = () => {
  fetch("data/projects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then((fichier) => afficherProjets(preparerProjets(fichier.depots, fichier.etudes)))
    .catch((error) => {
      console.error("Erreur :", error);
      afficherErreurProjets();
    });
};

chargerProjets();
