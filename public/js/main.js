/* eslint-env browser */
/* global Mustache, page */
'use strict';

// Le script principal de notre application single page
// Celui-ci effectue le routing coté client (et d'autres choses)

// Notre objet contexte, qui contiendra toutes les données
// pour les templates Mustache
let context = {'logged': false};

// fonction utilitaire permettant de faire du 
// lazy loading (chargement à la demande) des templates
const templates = (() => {
    let templates = {};
    return function load(url) {
        if (templates[url]) {
            return Promise.resolve(templates[url]);
        }
        else {
            return fetch(url)
                .then(res => res.text())
                .then(text => {
                    return templates[url] = text;
                })
        }
    }
})();

// Fonction utilitaire qui permet de charger en parallèle les 
// différents "partial" (morceaux de template. Ex: header)
const loadPartials = (() => {
    let partials;

    return async function loadPartials() {
        if (!partials) {
            partials = {
                header: templates('public/templates/header.mustache'),
                footer: templates('public/templates/footer.mustache'),
            };
            const promises = Object.entries(partials)
                .map(async function ([k, v]) {
                    return [k, await v];
                });
            partials = Object.fromEntries(await Promise.all(promises));
        }
        return partials;
    }
})();

// Route pour la page d'admin
page('admin', async function () {
    // Si on n'est pas authentifé, on affiche la page de login
    if (!context.logged) {
        page('/login');
    }
    else {
        // Sinon on charge le template d'admin
        // Si on n'est pas authentifié (ex: un petit malin a changé la valeur de 'logged')
        // le serveur ne renverra tout de même pas le template puisqu'il est dans la partie 'private'
        renderTemplate(templates('private/admin.mustache'), {...context, ariane: [{text: 'Home', url: '/'}, {text: 'Admin'}]});
    }
});

// route pour la page d'authentification des utilisateurs
page('login', async function () {
    // pas besoin de faire de await sur cet appel puisqu'il n'y a pas d'autre 
    // traitement ensuite
    renderLoginPage(context);

    // fonction interne d'affichage de la page 
    async function renderLoginPage(context) {
        // On rend le template
        await renderTemplate(templates('public/templates/login.mustache'), context);

        // Puis on ajoute l'écouteur d'évenement sur les boutons
        const cancel_btn = document.querySelector('#cancel-btn');
        cancel_btn.addEventListener('click', function () {
            page('/');
        });
        const login_btn = document.querySelector('#login-btn');
        login_btn.addEventListener('click', async function () {
            // Récupération du login et du mot de passe
            const username = document.querySelector('input[placeholder="username"]').value;
            console.log('username: ' + username);
            const password = document.querySelector('input[placeholder="password"]').value;
            let result;
            try {
                // On fait ensuite un fetch sur l'api pour s'authentifier
                result = await fetch('api/login', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                    },
                    method: 'POST',
                    body: 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password),
                });
            }
            catch (e) {
                console.error(e);
                return;
            }
            try {
                if (result.ok) {
                    // Si tout s'est bien passé
                    result = await result.json();
                    // Et que l'authentification s'est bien passée
                    if (result.success) {
                        // on passe à la page d'administration
                        context.logged = true;
                        page('/admin');
                    }
                    else {
                        // Sinon on réaffiche la page avec quelques infos pour expliquer ce qui n'a pas marché
                        renderLoginPage({...context, username, password, message: result.message});
                    }
                }
            }
            catch (e) {
                console.error(e);
                return;
            }
        });
    }
});

// Route pour la page principale (index.html)
page('/', async function () {
    let response;

    // Chargement des artistes à partir de l'API
    response = await fetch('api/artists');
    context.artists = await response.json();

    // On charge les albums de l'artiste sélectionné par défaut
    renderArtist(0);

    // fonction interne de chargement et d'affichage des albums d'un artiste
    async function renderArtist(id) {
        // On charge les données depuis l'API
        const response = await fetch('api/artist/' + id + '/albums');
        context.albums = await response.json();

        // On selectionne le bon élement dans le contexte
        context.artists[context.selectedArtist | 0].selected = false;
        context.artists[context.selectedArtist = id].selected = true;

        // Rendu du template et insertion dans la page html
        await renderTemplate(templates('public/templates/index.mustache'), {...context, ariane: [{text: 'Home'}]});
        // Enregistrement de l'écouteur d'évenement sur la liste des artistes
        let select_item = document.querySelector('#selection select');
        select_item.addEventListener('change', ({target}) => {
            renderArtist(target.selectedIndex);
        });
    }
});

// On démarre le routing
page.base('/'); // psi votre projet n'est pas hébergé à la racine de votre serveur, ajuster son url de base ici !
page.start();

// fonction utilitaire de rendu d'un template
async function renderTemplate(template, context) {
    // On charge les partials (si pas déà chargés)
    const partials = await loadPartials();
    // On rend le template
    const rendered = Mustache.render(await template, context, partials);
    // Et on l'insère dans le body
    let body = document.querySelector('body');
    body.innerHTML = rendered;
}
