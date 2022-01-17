## Partie 4: requêtes AJAX avec JQuery

Cette partie du labo se trouve sur la branche suivante: [fb-ajax](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/fb-ajax)

Le but de cette partie est de créer un script JS permettant de faire une requête HTTP sur le serveur web `express` depuis le serveur web `apache` et d'afficher le résultat dans une div. Contrairement à la donnée demandant d'utilisier JQuery pour faire une requête AJAX, nous avons choisi d'utiliser les API webs standards (en l'occurence fetch).

### Création du Dockerfile

Le dockerfile est le même que celui utilisé pour le serveur `apache`. La modification réside dans les fichiers à copier qui embarque maintenant le script `index.js`. Ce script marche sur le principe suivant:

```js
// Attendre que le DOM soit chargé
window.addEventListener('DOMContentLoaded', () => {
    // Récupérer la div qui contiendra le résultat
    const random = document.getElementById("random");
    // Fonction anonyme et asynchrone pour faire 
    // une requête HTTP se exécutée toutes les 3 secondes
    setInterval(async () => {
        // Faire une requête HTTP sur le serveur express
        // et récupérer le résultat en format JSON
        const res = await fetch("/api/random").then(res => res.json());
        // Remplacer le contenu de la div par le résultat de la requête
        random.innerText = res.random;
    }, 3000);
});
```

### Construction de l'image

L'image se construit de la même manière que pour le serveur `apache`.

### Création d'un container

La création du container se fait de la même manière que pour le serveur `apache`.
