// ==========================================================================
// main.js : thème clair / sombre et menu de navigation mobile
// ==========================================================================

// --------------------------------------------------------------------------
// Thème clair / sombre
// --------------------------------------------------------------------------

// Éléments de la page
const racine = document.documentElement; // la balise <html>
const boutonTheme = document.getElementById("bouton-theme");
const iconeTheme = boutonTheme.querySelector(".bouton-theme__icone");

// Préférence du système d'exploitation (true si le système est en mode sombre)
const systemeEnSombre = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Applique un thème ("light" ou "dark") à la page et met à jour le bouton
const appliquerTheme = (theme) => {
  racine.setAttribute("data-theme", theme);

  if (theme === "dark") {
    iconeTheme.textContent = "☀";
    boutonTheme.setAttribute("aria-label", "Activer le thème clair");
  } else {
    iconeTheme.textContent = "☾";
    boutonTheme.setAttribute("aria-label", "Activer le thème sombre");
  }
};

// Choix du thème au chargement :
// 1. le choix déjà fait par le visiteur (sauvegardé dans le navigateur),
// 2. sinon la préférence du système.
const themeSauvegarde = localStorage.getItem("theme");

if (themeSauvegarde) {
  appliquerTheme(themeSauvegarde);
} else if (systemeEnSombre) {
  appliquerTheme("dark");
} else {
  appliquerTheme("light");
}

// Au clic : on inverse le thème et on sauvegarde le choix
boutonTheme.addEventListener("click", () => {
  const themeActuel = racine.getAttribute("data-theme");
  const nouveauTheme = themeActuel === "dark" ? "light" : "dark";

  appliquerTheme(nouveauTheme);
  localStorage.setItem("theme", nouveauTheme);
});

// --------------------------------------------------------------------------
// Menu de navigation mobile
// --------------------------------------------------------------------------

// Éléments du menu
const boutonMenu = document.getElementById("bouton-menu");
const navigation = document.getElementById("navigation");
const liensNavigation = document.querySelectorAll(".navigation__lien");

// Ouvre le menu (true) ou le ferme (false)
const basculerMenu = (ouvrir) => {
  navigation.classList.toggle("navigation--ouverte", ouvrir);
  boutonMenu.setAttribute("aria-expanded", ouvrir);
};

// Clic sur le bouton Menu : on inverse l'état actuel
boutonMenu.addEventListener("click", () => {
  const estOuvert = boutonMenu.getAttribute("aria-expanded") === "true";
  basculerMenu(!estOuvert);
});

// Clic sur un lien : on ferme le menu pour voir la section choisie
liensNavigation.forEach((lien) => {
  lien.addEventListener("click", () => {
    basculerMenu(false);
  });
});

// Touche Échap : on ferme le menu et on remet le focus sur le bouton
document.addEventListener("keydown", (evenement) => {
  const estOuvert = boutonMenu.getAttribute("aria-expanded") === "true";

  if (evenement.key === "Escape" && estOuvert) {
    basculerMenu(false);
    boutonMenu.focus();
  }
});
