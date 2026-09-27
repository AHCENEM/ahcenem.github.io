// ==========================================================================
// graphiques.js : graphiques Chart.js
// 1. Prix médian au m² par arrondissement (projet Prix Paris)
// 2. Mon GitHub en données : chiffres clés et langages des projets publics
// ==========================================================================

// Graphiques déjà dessinés, gardés pour pouvoir les redessiner au changement de thème
let graphiquePrix = null;
let graphiqueLangages = null;

// Données des graphiques, gardées après le premier chargement
let donneesPrix = null;
let donneesLangages = null;

// Nombre maximum de parts dans l'anneau (au-delà, les derniers langages sont regroupés dans « Autres »)
const partsMaximum = 6;

// Lit une variable CSS (par exemple --couleur-accent) sur la balise <html>.
// Les couleurs des graphiques suivent ainsi le thème clair ou sombre du site.
const lireCouleur = (nomVariable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(nomVariable).trim();
};

// true si le visiteur a demandé moins d'animations dans son système
const animationsReduites = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Nombre au format français : 12048 devient « 12 048 »
const formaterNombre = (nombre) => nombre.toLocaleString("fr-FR");

// Nom d'un arrondissement : 1 devient « 1er », 6 devient « 6e »
const nommerArrondissement = (numero) => (numero === 1 ? "1er" : `${numero}e`);

// Réglages communs à tous les graphiques : police, couleur du texte, grille discrète
const reglagesCommuns = () => {
  Chart.defaults.font.family = lireCouleur("--police-texte");
  Chart.defaults.color = lireCouleur("--couleur-texte-doux");
  Chart.defaults.borderColor = lireCouleur("--couleur-bordure");
};

// --------------------------------------------------------------------------
// 1. Prix médian au m² par arrondissement
// --------------------------------------------------------------------------

// Transforme l'objet { "1": 12048, "2": 11038, ... } en liste triée du plus cher au moins cher
const preparerDonneesPrix = (objetPrix) => {
  const liste = Object.keys(objetPrix).map((cle) => ({
    arrondissement: Number(cle),
    prix: objetPrix[cle],
  }));

  // sort avec une fonction de comparaison : b - a range du plus grand au plus petit
  return liste.sort((a, b) => b.prix - a.prix);
};

// Phrase qui résume le graphique (lue par tous, y compris les lecteurs d'écran)
const resumerPrix = (liste) => {
  // reduce parcourt la liste et garde l'arrondissement le plus cher, puis le moins cher
  const plusCher = liste.reduce((max, ligne) => (ligne.prix > max.prix ? ligne : max));
  const moinsCher = liste.reduce((min, ligne) => (ligne.prix < min.prix ? ligne : min));
  const ecart = Math.round((plusCher.prix / moinsCher.prix - 1) * 100);

  return `Le ${nommerArrondissement(plusCher.arrondissement)} est l'arrondissement le plus cher (${formaterNombre(plusCher.prix)} € le m²), `
    + `le ${nommerArrondissement(moinsCher.arrondissement)} le moins cher (${formaterNombre(moinsCher.prix)} € le m²) : `
    + `un écart de ${ecart} %. Médianes calculées sur 48 921 ventes d'appartements (2018-2019).`;
};

// Tableau des valeurs, sous le graphique : toutes les données restent lisibles sans le graphique
const remplirTableauPrix = (liste) => {
  const corps = document.getElementById("tableau-prix-m2");
  const lignes = liste.map((ligne) => `
    <tr>
      <td>${nommerArrondissement(ligne.arrondissement)}</td>
      <td>${formaterNombre(ligne.prix)} €</td>
    </tr>`);
  corps.innerHTML = lignes.join("");
};

// Dessine le graphique en barres horizontales avec Chart.js
const dessinerGraphiquePrix = (liste) => {
  const canvas = document.querySelector("#graphique-prix-m2");

  // Si Chart.js n'a pas pu être chargé (CDN indisponible), le tableau des données suffit.
  // typeof renvoie le type d'une variable : "undefined" si elle n'existe pas.
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  reglagesCommuns();

  graphiquePrix = new Chart(canvas, {
    type: "bar",
    data: {
      labels: liste.map((ligne) => nommerArrondissement(ligne.arrondissement)),
      datasets: [{
        label: "Prix médian au m²",
        data: liste.map((ligne) => ligne.prix),
        backgroundColor: lireCouleur("--couleur-accent"),
        borderRadius: 4,          // coins arrondis au bout des barres
        borderSkipped: "start",   // pas d'arrondi du côté de l'axe
        barPercentage: 0.8,       // petit espace entre les barres
      }],
    },
    options: {
      indexAxis: "y",             // barres horizontales : les 20 noms restent lisibles
      maintainAspectRatio: false, // la hauteur vient du CSS
      animation: animationsReduites ? false : { duration: 600 },
      plugins: {
        legend: { display: false },   // une seule série : le titre suffit
        tooltip: {
          callbacks: {
            label: (contexte) => `${formaterNombre(contexte.parsed.x)} € le m²`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { callback: (valeur) => `${formaterNombre(valeur)} €` },
        },
        y: {
          grid: { display: false },
        },
      },
    },
  });
};

// Point d'entrée : appelé par projets.js une fois la carte Prix Paris affichée
const afficherGraphiquePrix = () => {
  // Données déjà chargées (nouvel affichage) : on redessine directement
  if (donneesPrix) {
    dessinerGraphiquePrix(donneesPrix);
    return;
  }

  fetch("data/prix_m2_arrondissement.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then((objetPrix) => {
      donneesPrix = preparerDonneesPrix(objetPrix);
      document.getElementById("resume-prix-m2").textContent = resumerPrix(donneesPrix);
      remplirTableauPrix(donneesPrix);
      dessinerGraphiquePrix(donneesPrix);
    })
    .catch((error) => {
      console.error("Erreur :", error);
      document.getElementById("resume-prix-m2").textContent = "Le graphique n'a pas pu être chargé.";
    });
};

// --------------------------------------------------------------------------
// 2. Mon GitHub en données
// --------------------------------------------------------------------------

// Compte les projets par langage avec reduce : { "PHP": 1, "Jupyter Notebook": 1 },
// puis transforme le résultat en liste triée du plus utilisé au moins utilisé
const compterLangages = (projets) => {
  const compteur = projets.reduce((total, projet) => {
    const langage = projet.langage || "Non précisé";
    total[langage] = (total[langage] || 0) + 1;
    return total;
  }, {});

  const liste = Object.keys(compteur).map((langage) => ({
    langage: langage,
    nombre: compteur[langage],
  }));

  return liste.sort((a, b) => b.nombre - a.nombre);
};

// Au-delà de 6 langages, les derniers sont regroupés dans « Autres » (l'anneau reste lisible)
const regrouperAutres = (liste) => {
  if (liste.length <= partsMaximum) {
    return liste;
  }

  const premiers = liste.slice(0, partsMaximum - 1);
  const nombreAutres = liste.slice(partsMaximum - 1).reduce((somme, ligne) => somme + ligne.nombre, 0);
  return premiers.concat([{ langage: "Autres", nombre: nombreAutres }]);
};

// Couleur de chaque part : --graphique-1, --graphique-2... dans l'ordre de la liste
const couleursLangages = (liste) => liste.map((ligne, index) => lireCouleur(`--graphique-${index + 1}`));

// Date de dernière activité : la plus récente des dates de mise à jour (reduce garde la plus grande)
const trouverDerniereActivite = (projets) => {
  const plusRecente = projets.reduce((max, projet) => (projet.date > max ? projet.date : max), "");
  const date = new Date(plusRecente);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

// Liste des langages, sous l'anneau : pastille de couleur, nom et nombre de projets.
// Les noms viennent de l'API GitHub : on les insère avec textContent (protection XSS).
const remplirListeLangages = (liste) => {
  const listeHtml = document.getElementById("liste-langages");
  const couleurs = couleursLangages(liste);
  listeHtml.innerHTML = "";

  liste.forEach((ligne, index) => {
    const element = document.createElement("li");

    const pastille = document.createElement("span");
    pastille.className = "liste-langages__pastille";
    pastille.style.backgroundColor = couleurs[index];

    const texte = document.createElement("span");
    const mot = ligne.nombre > 1 ? "projets" : "projet";
    texte.textContent = `${ligne.langage} : ${ligne.nombre} ${mot}`;

    element.appendChild(pastille);
    element.appendChild(texte);
    listeHtml.appendChild(element);
  });
};

// Dessine l'anneau des langages avec Chart.js (seulement à partir de 3 langages :
// avec 1 ou 2 parts, la liste chiffrée se lit mieux qu'un graphique)
const dessinerGraphiqueLangages = (liste) => {
  const zone = document.getElementById("zone-langages");
  const canvas = document.querySelector("#graphique-langages");

  if (liste.length < 3 || typeof Chart === "undefined") {
    zone.hidden = true;
    return;
  }

  zone.hidden = false;
  reglagesCommuns();

  graphiqueLangages = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: liste.map((ligne) => ligne.langage),
      datasets: [{
        data: liste.map((ligne) => ligne.nombre),
        backgroundColor: couleursLangages(liste),
        borderColor: lireCouleur("--couleur-surface"),   // fin espace entre les parts
        borderWidth: 2,
      }],
    },
    options: {
      cutout: "60%",
      maintainAspectRatio: false,
      animation: animationsReduites ? false : { duration: 600 },
      plugins: {
        legend: { display: false },   // la liste sous l'anneau sert de légende
        tooltip: {
          callbacks: {
            label: (contexte) => ` ${contexte.label} : ${contexte.parsed} projet(s)`,
          },
        },
      },
    },
  });
};

// Point d'entrée : appelé par projets.js avec la liste des projets publics affichés
const afficherGithubEnDonnees = (projets) => {
  const liste = regrouperAutres(compterLangages(projets));
  donneesLangages = liste;

  document.getElementById("github-projets").textContent = projets.length;
  document.getElementById("github-activite").textContent = trouverDerniereActivite(projets);
  document.getElementById("github-langages").textContent = compterLangages(projets).length;

  remplirListeLangages(liste);

  const detail = liste.map((ligne) => `${ligne.langage} (${ligne.nombre})`).join(", ");
  const motProjets = projets.length > 1 ? "projets publics" : "projet public";
  const motLangages = liste.length > 1 ? "langages" : "langage";
  document.getElementById("resume-langages").textContent =
    `${projets.length} ${motProjets}, ${liste.length} ${motLangages} : ${detail}.`;

  dessinerGraphiqueLangages(liste);
};

// --------------------------------------------------------------------------
// Changement de thème : on redessine les graphiques avec les nouvelles couleurs
// (main.js a déjà changé le thème : son écouteur est enregistré avant celui-ci)
// --------------------------------------------------------------------------

document.getElementById("bouton-theme").addEventListener("click", () => {
  if (graphiquePrix) {
    graphiquePrix.destroy();
    dessinerGraphiquePrix(donneesPrix);
  }

  if (graphiqueLangages) {
    graphiqueLangages.destroy();
    dessinerGraphiqueLangages(donneesLangages);
  }

  // Les pastilles de la liste changent aussi de couleur
  if (donneesLangages) {
    remplirListeLangages(donneesLangages);
  }
});
