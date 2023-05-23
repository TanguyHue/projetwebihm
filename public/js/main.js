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
        async function loadSchedule() {
            await renderTemplate(templates('private/agenda/agenda.mustache'));
            console.log('Construction du calendrier.');

            // Construction du calendrier
            const calendar = document.getElementById('calendar');
            const daysOfWeek = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            const headerRow = document.createElement('tr');

            // Construction des colonnes (jours)
            const tableHeader = document.createElement('thead');

            for (var i = 0; i < daysOfWeek.length; i++) {
                const headerCell = document.createElement('th');
                headerCell.textContent = daysOfWeek[i];
                headerRow.appendChild(headerCell);
            }

            tableHeader.appendChild(headerRow);

            const table = document.createElement('table');
            table.appendChild(tableHeader);
            table.setAttribute('class', 'table table-striped-columns');

            // Création des lignes (heures de 8 à 22)
            const tableBody = document.createElement('tbody');

            for (var i = 8; i <= 22; i++) {
                // Ligne de la table
                const new_row = document.createElement('tr');

                // Heure correspondant à la ligne
                const hour = document.createElement('th');
                hour.setAttribute('scope', 'row');
                const hourText = document.createTextNode(i);
                hour.appendChild(hourText);
                new_row.appendChild(hour);

                // Créneaux horaires de chaque ligne
                for (var j = 1; j < daysOfWeek.length; j++) {
                    const time_slot = document.createElement('td');
                    new_row.appendChild(time_slot);
                }

                tableBody.appendChild(new_row)
            }

            // Ajout des cases "notes"
            const memo_row = document.createElement('tr');
            const empty = document.createElement('td');
            memo_row.appendChild(empty);

            for (var i = 1; i < daysOfWeek.length; i++) {
                const memo = document.createElement('td');
                const memoText = document.createTextNode('Notes :');
                memo.appendChild(memoText);
                memo_row.appendChild(memo);
            }
            tableBody.appendChild(memo_row);

            table.appendChild(tableBody);

            calendar.appendChild(table);
        }
    }
});

page('ajouttache', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        async function load() {
            await renderTemplate(templates('private/ajoutTache/ajouttache.mustache'));
            var buttonAssignation = document.getElementById("assignation");
            buttonAssignation.checked = false;

            buttonAssignation.addEventListener("click", function () {
                if (buttonAssignation.checked) {
                    buttonAssignation.value = "Personne pour le moment";
                    buttonAssignation.style.backgroundColor = "#f44336";
                    buttonAssignation.checked = false;
                } else {
                    buttonAssignation.value = "Assigné à moi";
                    buttonAssignation.style.backgroundColor = "#4CAF50";
                    buttonAssignation.checked = true;
                }
            });

            var date = document.getElementById("date");
            date.value = new Date().toISOString().slice(0, 10);

            var buttonAnnuler = document.getElementById("annulé");
            buttonAnnuler.addEventListener("click", function () {
                page('/main');
            }
            );

            var buttonValider = document.getElementById("validé");
            buttonValider.addEventListener("click", async function () {
                var titre = document.getElementById("titre").value;
                var description = document.getElementById("note").value;
                var date = document.getElementById("date").value;
                if (document.getElementById("assignation").checked) {
                    var assignation = context.user.id;
                } else {
                    var assignation = "none";
                }
                var tache = { titre: titre, description: description, date: date, assignation: assignation };
                console.log(tache);

                try {
                    // On fait ensuite un fetch sur l'api pour s'authentifier
                    const result = await fetch('api/taches/add', {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                        },
                        method: 'POST',
                        body: 'idCreateur=' + encodeURIComponent(context.user.id) + '&idRealisateur=' + encodeURIComponent(assignation) + '&titre=' + encodeURIComponent(titre) + '&date=' + encodeURIComponent(date) + '&notes=' + encodeURIComponent(description),
                    });

                    // On récupère le résultat de la requête
                    const data = await result.json();
                    console.log(data);
                    page('/main');
                }
                catch (e) {
                    console.error(e);
                    page('/main');
                    return;
                }
            }
            );
        }
        load();
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
        login_btn.addEventListener('click', loadMain);
        document.querySelector('#identifiant').addEventListener('keypress', (event) => {
            if (event.keyCode === 13) {
                loadMain();
            }
        });
        document.querySelector('#password').addEventListener('keypress', (event) => {
            if (event.keyCode === 13) {
                loadMain();
            }
        });

        async function loadMain() {
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
                            id: user.id,
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
        };
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
