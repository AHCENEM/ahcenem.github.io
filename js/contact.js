// ==========================================================================
// contact.js : formulaire de contact
// 1. Validation en direct des champs (message d'erreur sous chaque champ)
// 2. Envoi avec fetch vers Web3Forms, sans recharger la page
// ==========================================================================

// Adresse du service Web3Forms, qui transmet le message par e-mail
const urlWeb3Forms = "https://api.web3forms.com/submit";

// Éléments du formulaire
const formulaire = document.getElementById("formulaire-contact");
const boutonEnvoyer = document.getElementById("bouton-envoyer");
const statutFormulaire = document.getElementById("formulaire-statut");

// Expression régulière simple pour une adresse e-mail : texte@texte.extension
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Règles de validation : pour chaque champ, un test et le message à afficher s'il échoue
const reglesChamps = [
  {
    id: "contact-nom",
    estValide: (valeur) => valeur.trim().length >= 2,
    erreur: "Indiquez votre nom (2 caractères minimum).",
  },
  {
    id: "contact-email",
    estValide: (valeur) => regexEmail.test(valeur.trim()),
    erreur: "Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.",
  },
  {
    id: "contact-objet",
    estValide: (valeur) => valeur !== "",
    erreur: "Choisissez l'objet de votre message.",
  },
  {
    id: "contact-message",
    estValide: (valeur) => valeur.trim().length >= 10,
    erreur: "Écrivez un message d'au moins 10 caractères.",
  },
];

// --------------------------------------------------------------------------
// 1. Validation
// --------------------------------------------------------------------------

// Vérifie un champ, affiche ou efface son message d'erreur, et renvoie true s'il est valide
const validerChamp = (regle) => {
  const champ = document.getElementById(regle.id);
  const zoneErreur = document.getElementById(`${regle.id}-erreur`);
  const valide = regle.estValide(champ.value);

  zoneErreur.textContent = valide ? "" : regle.erreur;

  // aria-invalid : les lecteurs d'écran annoncent que le champ contient une erreur
  champ.setAttribute("aria-invalid", !valide);
  champ.classList.toggle("champ__saisie--invalide", !valide);
  champ.classList.toggle("champ__saisie--valide", valide);

  return valide;
};

// Validation en direct :
// - quand on quitte un champ (blur), on le vérifie et on le marque comme « touché » ;
// - pendant la saisie (input), on revérifie seulement les champs déjà touchés,
//   pour ne pas afficher d'erreur dès la première lettre.
reglesChamps.forEach((regle) => {
  const champ = document.getElementById(regle.id);

  champ.addEventListener("blur", () => {
    champ.classList.add("champ__saisie--touche");
    validerChamp(regle);
  });

  champ.addEventListener("input", () => {
    if (champ.classList.contains("champ__saisie--touche")) {
      validerChamp(regle);
    }
  });
});

// Remet le formulaire à zéro après un envoi réussi (valeurs et couleurs des champs)
const viderFormulaire = () => {
  formulaire.reset();
  reglesChamps.forEach((regle) => {
    const champ = document.getElementById(regle.id);
    champ.classList.remove("champ__saisie--touche", "champ__saisie--valide", "champ__saisie--invalide");
    champ.removeAttribute("aria-invalid");
  });
};

// --------------------------------------------------------------------------
// 2. Envoi
// --------------------------------------------------------------------------

// Affiche le message sous le bouton : type "succes" ou "erreur"
const afficherStatut = (texte, type) => {
  statutFormulaire.textContent = texte;
  statutFormulaire.classList.remove("formulaire__statut--succes", "formulaire__statut--erreur");
  statutFormulaire.classList.add(`formulaire__statut--${type}`);
};

// Réactive le bouton après l'envoi (réussi ou non)
const reactiverBouton = () => {
  boutonEnvoyer.disabled = false;
  boutonEnvoyer.textContent = "Envoyer le message";
};

// Envoie le formulaire à Web3Forms avec fetch (style du cours : then, then, catch)
const envoyerFormulaire = () => {
  // FormData lit tous les champs du formulaire (y compris les champs cachés : clé, botcheck)
  const donnees = new FormData(formulaire);

  // Objet de l'e-mail reçu : « Portfolio : Offre d'emploi », par exemple
  donnees.append("subject", `Portfolio : ${donnees.get("objet")}`);

  // Le bouton est désactivé pendant l'envoi : pas de double envoi
  boutonEnvoyer.disabled = true;
  boutonEnvoyer.textContent = "Envoi en cours…";
  statutFormulaire.textContent = "";

  fetch(urlWeb3Forms, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: donnees,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then((resultat) => {
      // Web3Forms répond { success: true } si le message est parti
      if (!resultat.success) {
        throw new Error(resultat.message);
      }
      afficherStatut("Merci, votre message est bien envoyé. Je vous réponds dès que possible.", "succes");
      viderFormulaire();
      reactiverBouton();
    })
    .catch((error) => {
      console.error("Erreur :", error);
      afficherStatut("L'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez-moi directement à madjourahcene@gmail.com.", "erreur");
      reactiverBouton();
    });
};

// Clic sur « Envoyer » : on vérifie tous les champs, puis on envoie
formulaire.addEventListener("submit", (evenement) => {
  // preventDefault : empêche le navigateur d'envoyer le formulaire et de recharger la page
  evenement.preventDefault();

  const resultats = reglesChamps.map((regle) => validerChamp(regle));

  if (resultats.includes(false)) {
    // Place le curseur dans le premier champ en erreur, pour corriger au clavier
    const premierChampInvalide = formulaire.querySelector(".champ__saisie--invalide");
    premierChampInvalide.focus();
    afficherStatut("Le formulaire contient des erreurs : corrigez les champs indiqués.", "erreur");
    return;
  }

  envoyerFormulaire();
});
