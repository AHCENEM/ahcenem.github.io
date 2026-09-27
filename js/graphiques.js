// ==========================================================================
// graphiques.js : graphiques Chart.js
// 1. Prix médian au m² par arrondissement (projet Prix Paris)
// ==========================================================================

// Graphiques déjà dessinés, gardés pour pouvoir les redessiner au changement de thème
let graphiquePrix = null;

// Données du graphique des prix, gardées après le premier chargement
let donneesPrix = null;

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
// Changement de thème : on redessine les graphiques avec les nouvelles couleurs
// --------------------------------------------------------------------------

document.getElementById("bouton-theme").addEventListener("click", () => {
  if (graphiquePrix) {
    graphiquePrix.destroy();
    dessinerGraphiquePrix(donneesPrix);
  }
});
