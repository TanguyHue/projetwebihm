/* eslint-env browser */
/* global Mustache, page */
'use strict';

// Le script principal de notre application single page
// Celui-ci effectue le routing coté client (et d'autres choses)

// Notre objet contexte, qui contiendra toutes les données
// pour les templates Mustache
let context = { 'logged': false, 'user': 0 };

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

        async function getData() {
            await renderTemplate(templates('private/main/main.mustache'));
            await fetch('https://api.open-meteo.com/v1/forecast?latitude=47.22&longitude=-1.55&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m,uv_index,terrestrial_radiation&current_weather=true&forecast_days=1&timezone=Europe%2FBerlin')
                .then(response => response.json())
                .then(data => {
                    const uv = document.getElementById('uv');
                    const temp = document.getElementById('temperature');
                    const ozone = document.getElementById('ozone');
                    const vent = document.getElementById('vent');
                    const humidite = document.getElementById('humidite');
                    const pluie = document.getElementById('pluie');

                    const hour = new Date().getHours();

                    temp.innerHTML = data.current_weather.temperature + data.hourly_units.temperature_2m;
                    vent.innerHTML = data.current_weather.windspeed + data.hourly_units.windspeed_10m;

                    uv.innerHTML = data.hourly.uv_index[hour] + data.hourly_units.uv_index;
                    ozone.innerHTML = data.hourly.terrestrial_radiation[hour] + data.hourly_units.terrestrial_radiation;
                    humidite.innerHTML = data.hourly.relativehumidity_2m[hour] + data.hourly_units.relativehumidity_2m;
                    pluie.innerHTML = data.hourly.precipitation_probability[hour] + data.hourly_units.precipitation_probability;

                    const buttonReload = document.getElementById('reload');
                    buttonReload.addEventListener('click', () => {
                        console.log("Reload");
                        getData();
                    }
                    );
                })
                .catch(err => console.error(err));

            const boutonsAssignation = document.querySelectorAll("#toDo input[name='assignation']");
            boutonsAssignation.forEach(function (bouton) {
                bouton.addEventListener('click', function () {
                    if (!this.checked) {
                        this.style.backgroundColor = "rgb(223, 219, 172)";
                        this.checked = true;
                        this.value = "Assigné";
                    } else {
                        this.checked = false;
                        this.style.backgroundColor = "#e9e9ed";
                        this.value = "Je m'assigne cette tâche";
                    }
                });
            });

            const boutonPotager = document.getElementById('potager');
            boutonPotager.addEventListener('click', () => {
                page('/monpotager');
            }
            );

            const boutonAgenda = document.getElementById('agenda');
            boutonAgenda.addEventListener('click', () => {
                page('/agenda');
            }
            );

            const boutonAjoutTache = document.getElementById('ajouttache');
            boutonAjoutTache.addEventListener('click', () => {
                page('/ajouttache');
            }
            );

            const boutonDeconnexion = document.getElementById('deconnexion');
            boutonDeconnexion.addEventListener('click', () => {
                context.logged = false;
                context.user = 0;
                page('/');
            }  
            );

            const nomUser = document.getElementById('nomUser');
            nomUser.innerHTML = context.user.nom + " " + context.user.prenom;

            const roleUser = document.getElementById('roleUser');
            roleUser.innerHTML = "Role : " + context.user.role;

            const departUser = document.getElementById('departUser');
            departUser.innerHTML = "Département : " + context.user.departement;
        }

        getData();
        console.log("main.js chargé");
    }
});

page('monpotager', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/monpotager.mustache'), { ...context, ariane: [{ text: 'Home', url: '/' }, { text: 'Admin' }] });
    }
});

page('agenda', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/agenda.mustache'), { ...context, ariane: [{ text: 'Home', url: '/' }, { text: 'Admin' }] });
    }
});

page('ajouttache', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/ajouttache.mustache'), { ...context, ariane: [{ text: 'Home', url: '/' }, { text: 'Admin' }] });
    }
});

page('ajoutplante', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        renderTemplate(templates('private/ajoutplante.mustache'), { ...context, ariane: [{ text: 'Home', url: '/' }, { text: 'Admin' }] });
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
                        var user = await fetch('api/login/' + username + '/' + password);
                        user = await user.json();
                        context.user = { 
                            nom: user.nom, 
                            prenom: user.prenom, 
                            departement: user.departement, 
                            role: user.role 
                        };
                        console.log(context.user);
                        page('/main');
                    }
                    else {
                        // Sinon on réaffiche la page avec quelques infos pour expliquer ce qui n'a pas marché
                        renderLoginPage({ ...context, username, password, message: result.message });
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
