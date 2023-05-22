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

page('main', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/main.mustache'), {...context, ariane: [{text: 'Home', url: '/'}, {text: 'Table de bord'}]});
    }
});

page('monpotager', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/monpotager.mustache'), {...context, ariane: [{text: 'Home', url: '/'}, {text: 'Admin'}]});
    }
});

page('agenda', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/agenda.mustache'), {...context, ariane: [{text: 'Home', url: '/'}, {text: 'Admin'}]});
    }
});

page('ajouttache', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/ajouttache.mustache'), {...context, ariane: [{text: 'Home', url: '/'}, {text: 'Admin'}]});
    }
});

page('ajoutplante', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/ajoutplante.mustache'), {...context, ariane: [{text: 'Home', url: '/'}, {text: 'Admin'}]});
    }
});

// Route pour la page principale (index.html)
page('/', async function () {
        // pas besoin de faire de await sur cet appel puisqu'il n'y a pas d'autre 
    // traitement ensuite
    renderLoginPage(context);

    // fonction interne d'affichage de la page 
    async function renderLoginPage(context) {
        // On rend le template
        await renderTemplate(templates('public/templates/index.mustache'), context);
        const login_btn = document.querySelector('#login-btn');
        login_btn.addEventListener('click', async function () {
            // Récupération du login et du mot de passe
            const username = document.querySelector('input[placeholder="Identifiant"]').value;
            console.log('username: ' + username);
            const password = document.querySelector('input[placeholder="Mot de passe"]').value;
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
                        page('/main');
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
