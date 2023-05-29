/* eslint-env browser */
/* global Mustache, page */
'use strict';

// Le script principal de notre application single page
// Celui-ci effectue le routing coté client (et d'autres choses)

// Notre objet contexte, qui contiendra toutes les données
// pour les templates Mustache
let context = { 'logged': false, 'user': 0, 'previous': 0, 'button': 0 };
let dataPlante = [];
let plantes = [];
let potagers = [];

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
        context.previous = 'main';
        async function loadMain() {
            await renderTemplate(templates('private/main/main.mustache'));
            async function getMeteo() {
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
                    })
                    .catch(err => console.error(err));
            }

            getMeteo();

            const buttonReload = document.getElementById('reload');
            buttonReload.addEventListener('click', () => {
                console.log("Reload");
                getMeteo();
            }
            );

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

        loadMain();
        console.log("main.js chargé");
    }
});

page('monpotager', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        context.previous = 'monpotager';
        async function loadPotager() {
            await renderTemplate(templates('private/monpotager/monpotager.mustache'));
            const etatSelect = document.getElementById('etat');
            const imgEtat = document.getElementById('imgEtat');

            const etat = etatSelect.value;
            if (etat == "0") {
                imgEtat.src = "private/monPotager/images/etatPotager/bon.png";
            } else if (etat == "1") {
                imgEtat.src = "private/monPotager/images/etatPotager/mauvais.png";
            } else if (etat == "2") {
                imgEtat.src = "private/monPotager/images/etatPotager/arroser.png";
            } else {
                imgEtat.src = "private/monPotager/images/etatPotager/travaux.png";
            }

            etatSelect.addEventListener('change', (event) => {
                const etat = event.target.value;
                if (etat == "0") {
                    imgEtat.src = "private/monPotager/images/etatPotager/bon.png";
                } else if (etat == "1") {
                    imgEtat.src = "private/monPotager/images/etatPotager/mauvais.png";
                } else if (etat == "2") {
                    imgEtat.src = "private/monPotager/images/etatPotager/arroser.png";
                } else {
                    imgEtat.src = "private/monPotager/images/etatPotager/travaux.png";
                }
            });

            var boutonsAssignation = document.querySelectorAll("#toDo input[name='assignation']");
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

            const boutonRetour = document.getElementById('retour');
            boutonRetour.addEventListener('click', () => {
                page('/main');
            }
            );

            const boutonAjoutTache = document.getElementById('ajouttache');
            boutonAjoutTache.addEventListener('click', () => {
                page('/ajouttache');
            }
            );

            const ulToDo = document.getElementById('toDo').querySelector('ul');
            console.log(ulToDo);
            try {
                const result = await fetch('http://127.0.0.1:8080/api/taches/' + context.user.id);
                const taches = await result.json();
                console.log(taches);
                let li;
                for (var i = 0; i < taches.length; i++) {
                    console.log(taches[i]);
                    li = document.createElement('li');
                    const form = document.createElement('form');
                    li.appendChild(form);
                    const input = document.createElement('input');
                    input.type = "checkbox";
                    input.name = "toDo" + i;
                    if (taches[i].etat == 1) {
                        input.checked = true;
                    }
                    input.value = "Je m'assigne cette tâche";

                    const ulDescription = document.createElement('ul');
                    ulDescription.className = "desc";

                    const liDescription1 = document.createElement('li');
                    liDescription.className = "desc";
                    const labelDescription = document.createElement('label');
                    labelDescription.className = "nomTache";
                    labelDescription.innerHTML = taches[i].titre;
                    liDescription1.appendChild(labelDescription);

                    const liDescription2 = document.createElement('li');
                    liDescription.className = "desc";
                    const labelDescription2 = document.createElement('label');
                    labelDescription2.className = "description";
                    labelDescription2.innerHTML = taches[i].notes;

                    ulDescription.appendChild(liDescription1);
                    ulDescription.appendChild(liDescription2);

                    const date = document.createElement('label');
                    date.className = "date";
                    const date2 = new Date(taches[i].date);
                    date.innerHTML = date2.toLocaleDateString();

                    const bouton = document.createElement('input');
                    bouton.type = "button";
                    bouton.name = "assignation";
                    bouton.value = "Je m'assigne cette tâche";

                    form.appendChild(input);
                    form.appendChild(ulDescription);
                    form.appendChild(date);
                    form.appendChild(bouton);

                    li.appendChild(form);

                    ulToDo.appendChild(li);
                }
            } catch (error) {
                console.log(error);
            }

            const boutonsAjout = document.getElementsByClassName("buttonType");
            let j = 0;
            let result;
            let potager;
            let plante;
            for (var i = 0; i < boutonsAjout.length; i++) {
                boutonsAjout[i].id = j + "" + i % 5;
                if (i % 5 == 4) {
                    j++;
                }

                try {
                    result = await fetch('http://127.0.0.1:8080/api/potager/byXandYandUser/' + j + '/' + i % 5 + '/' + context.user.id);
                    potager = await result.json();

                    if (potager != null) {
                        result = await fetch('http://127.0.0.1:8080/api/planteData/' + potager.idPlanteData);
                        plante = await result.json();
                        plantes.push(plante);
                        potagers.push(potager);
                        boutonsAjout[i].numero = plantes.length - 1;
                        console.log("potager : " + plante);
                        console.log("potager.img : " + plante.img);
                        let icone;
                        if (plante.img == 0) {
                            icone = "private/monPotager/images/type/carotte.png";
                        } else if (plante.img == 1) {
                            icone = "private/monPotager/images/type/salade.png";
                        } else if (plante.img == 2) {
                            icone = "private/monPotager/images/type/tomate.png";
                        } else {
                            console.log("Erreur : potager.img = " + plante.img);
                        }
                        boutonsAjout[i].querySelector('img').src = icone;

                        boutonsAjout[i].addEventListener('click', function () {
                            context.button = this.id;
                            console.log("bouton : " + context.button);

                            const titre = document.getElementById('infoTitre');
                            const infoDernArrosage = document.getElementById('infoDernArrosage');
                            infoDernArrosage.style.display = "flex";
                            const infoProchArrosage = document.getElementById('infoProchArrosage');
                            infoProchArrosage.style.display = "flex";
                            const infoIntervalle = document.getElementById('infoIntervalle');
                            infoIntervalle.style.display = "flex";
                            const infoEngrais = document.getElementById('infoEngrais');
                            infoEngrais.style.display = "flex";
                            const infoConseil = document.getElementById('infoConseil');
                            infoConseil.style.display = "flex";
                            const arroser = document.getElementById('arroser');
                            arroser.style.display = "flex";

                            titre.innerHTML = plantes[this.numero].nom;
                            let date = potagers[this.numero].date_dernier_arrosage.split('-');
                            let annee = date[0];
                            let mois = date[1];
                            let jour = date[2];
                            let nouvelleDateChaine = 'Date du dernier arrossage : ' + jour + '/' + mois + '/' + annee;
                            infoDernArrosage.innerHTML = nouvelleDateChaine;
                            let dateObjet = new Date(potagers[this.numero].date_dernier_arrosage);
                            dateObjet.setDate(dateObjet.getDate() + Number(plantes[this.numero].intervalle_arrosage));

                            jour = String(dateObjet.getDate()).padStart(2, '0');
                            mois = String(dateObjet.getMonth() + 1).padStart(2, '0');
                            annee = String(dateObjet.getFullYear());

                            nouvelleDateChaine = 'Date du prochain arrossage : ' + jour + '/' + mois + '/' + annee;
                            infoProchArrosage.innerHTML = nouvelleDateChaine;
                            infoIntervalle.innerHTML = "Intervalle d'arrossage : " + plantes[this.numero].intervalle_arrosage + ' jours';
                            infoEngrais.innerHTML = "Engrais conseillé : " + plantes[this.numero].engrais_conseille;
                            infoConseil.innerHTML = "Conseil : " + plantes[this.numero].conseils;
                        });
                    } else {
                        boutonsAjout[i].addEventListener('click', function () {
                            context.button = this.id;
                            page('/ajoutplante');
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (plantes.length > 0) {
                const titre = document.getElementById('infoTitre');
                const infoDernArrosage = document.getElementById('infoDernArrosage');
                const infoProchArrosage = document.getElementById('infoProchArrosage');
                const infoIntervalle = document.getElementById('infoIntervalle');
                const infoEngrais = document.getElementById('infoEngrais');
                const infoConseil = document.getElementById('infoConseil');

                titre.innerHTML = plantes[0].nom;
                let date = potagers[0].date_dernier_arrosage.split('-');
                let annee = date[0];
                let mois = date[1];
                let jour = date[2];
                let nouvelleDateChaine = 'Date du dernier arrossage : ' + jour + '/' + mois + '/' + annee;
                infoDernArrosage.innerHTML = nouvelleDateChaine;
                let dateObjet = new Date(potagers[0].date_dernier_arrosage);
                dateObjet.setDate(dateObjet.getDate() + Number(plantes[0].intervalle_arrosage));

                jour = String(dateObjet.getDate()).padStart(2, '0');
                mois = String(dateObjet.getMonth() + 1).padStart(2, '0');
                annee = String(dateObjet.getFullYear());

                nouvelleDateChaine = 'Date du prochain arrossage : ' + jour + '/' + mois + '/' + annee;
                infoProchArrosage.innerHTML = nouvelleDateChaine;
                infoIntervalle.innerHTML = "Intervalle d'arrossage : " + plantes[0].intervalle_arrosage + ' jours';
                infoEngrais.innerHTML = "Engrais conseillé : " + plantes[0].engrais_conseille;
                infoConseil.innerHTML = "Conseil : " + plantes[0].conseils;
            } else {
                const titre = document.getElementById('infoTitre');
                const checkArrosé = document.getElementById('checkArrosé');
                const infoDernArrosage = document.getElementById('infoDernArrosage');
                const infoProchArrosage = document.getElementById('infoProchArrosage');
                const infoIntervalle = document.getElementById('infoIntervalle');
                const infoEngrais = document.getElementById('infoEngrais');
                const infoConseil = document.getElementById('infoConseil');
                const arroser = document.getElementById('arroser');

                titre.innerHTML = "Aucune plante";
                checkArrosé.innerHTML = "Ajouter une plante en cliquant sur le bouton + à droite";
                infoDernArrosage.style.display = "none";
                infoProchArrosage.style.display = "none";
                infoIntervalle.style.display = "none";
                infoEngrais.style.display = "none";
                infoConseil.style.display = "none";
                arroser.style.display = "none";
            }

            const notification = document.getElementById('notification');
            const boutonArroser = document.getElementById('arroser');

            boutonArroser.addEventListener('click', async (event) => {
                console.log("click");
                notification.style.opacity = "1";

                try {
                    console.log('x=' + context.button[0] + '&y=' + context.button[1] + '&idUser=' + context.user.id);
                    result = await fetch('api/potager/arrose', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                        },
                        body: 'x=' + context.button[0] + '&y=' + context.button[1] + '&idUser=' + context.user.id
                    });


                    if (result.status == 200) {
                        console.log(result);
                        const infoDernArrosage = document.getElementById('infoDernArrosage');
                        const infoProchArrosage = document.getElementById('infoProchArrosage');
                        const infoIntervalle = document.getElementById('infoIntervalle');

                        const intervalle_arrosage = Number(infoIntervalle.innerHTML.split(' ')[3]);
                        console.log("intervalle_arrosage : " + intervalle_arrosage);

                        const dateActuelle = new Date();
                        let mois = '';
                        let jour = '';
                        if (dateActuelle.getMonth() < 10) {
                            mois = '0' + (dateActuelle.getMonth() + 1);
                        } else {
                            mois = dateActuelle.getMonth() + 1;
                        }

                        if (dateActuelle.getDate() < 10) {
                            jour = '0' + dateActuelle.getDate();
                        } else {
                            jour = dateActuelle.getDate();
                        }

                        let date = jour + '/' + mois + '/' + dateActuelle.getFullYear();
                        infoDernArrosage.innerHTML = 'Date du dernier arrossage : ' + date;
                        date = dateActuelle.getFullYear() + '-' + mois + '-' + jour;
                        let dateObjet = new Date(date);
                        dateObjet.setDate(dateObjet.getDate() + intervalle_arrosage);

                        jour = String(dateObjet.getDate()).padStart(2, '0');
                        mois = String(dateObjet.getMonth() + 1).padStart(2, '0');
                        let annee = String(dateObjet.getFullYear());

                        let nouvelleDateChaine = 'Date du prochain arrossage : ' + jour + '/' + mois + '/' + annee;
                        infoProchArrosage.innerHTML = nouvelleDateChaine;

                        potagers.find(potager => potager.x == context.button[0] && potager.y == context.button[1]).date_dernier_arrosage = date;
                    } else {
                        console.log("Erreur : " + result.status);
                    }

                } catch (error) {
                    console.log(error);
                }
                setTimeout(function () {
                    notification.style.opacity = "0";
                }, 3000);
            });
        }

        loadPotager();
    }
});

page('agenda', async function () {
    if (!context.logged) {
        page('/');
    }
    else {
        context.previous = 'agenda';
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

            const boutonNewTask = document.getElementById('newTask');
            boutonNewTask.addEventListener('click', () => {
                page('/ajouttache');
            }
            );
        }
        loadSchedule();
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
                if (context.previous == "main") {
                    page('/main');
                } else if (context.previous == "monpotager") {
                    page('/monpotager');
                } else if (context.previous == "agenda") {
                    page('/agenda');
                }
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
        async function load() {
            await renderTemplate(templates('private/ajoutPlante/ajoutPlante.mustache'));
            const formPlante = document.getElementById('formPlante');
            formPlante.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('ajouté !');
            }
            );
            const boutonRetour = document.getElementById('annulé');
            boutonRetour.addEventListener('click', () => {
                page('/monPotager');
            }
            );

            const selectIcone = document.getElementById('icone');
            const imageIcone = document.getElementById('imageIcone');
            selectIcone.addEventListener('change', () => {
                if (selectIcone.selectedIndex == 0) {
                    imageIcone.src = "private/monPotager/images/type/carotte.png";
                } else if (selectIcone.selectedIndex == 1) {
                    imageIcone.src = "private/monPotager/images/type/salade.png";
                } else if (selectIcone.selectedIndex == 2) {
                    imageIcone.src = "private/monPotager/images/type/tomate.png";
                }
            }
            );

            const datePlantation = document.getElementById('datePlantation');
            datePlantation.value = new Date().toISOString().slice(0, 10);
            const dateRecolte = document.getElementById('dateRecolte');
            dateRecolte.value = new Date().toISOString().slice(0, 10);

            const selectPlante = document.getElementById('plante');
            try {
                const result = await fetch('api/planteData');
                dataPlante = await result.json();
                console.log(dataPlante);

                for (var i = 0; i < dataPlante.length; i++) {
                    var option = document.createElement('option');
                    option.value = dataPlante[i].id;
                    option.textContent = dataPlante[i].nom;
                    selectPlante.appendChild(option);
                }

                if (!dataPlante.length) {
                    document.getElementById('selectionPlante').style.opacity = 0;
                    document.getElementById('selectionPlante').style.position = 'absolute';
                    document.getElementById('selectionPlante').style.pointerEvents = 'none';
                    document.getElementById('selectionPlante').style.height = 0;
                    document.getElementById('selectionPlante').style.width = 0;
                } else {
                    selectPlante.addEventListener('change', () => {
                        if (selectPlante.selectedIndex == 0) {
                            document.getElementById('nom').value = "";
                            document.getElementById('nom').disabled = false;
                            selectIcone.getElementsByTagName("option")[0].selected = 'selected';
                            selectIcone.disabled = false;
                            if (selectIcone.selectedIndex == 0) {
                                imageIcone.src = "private/monPotager/images/type/carotte.png";
                            } else if (selectIcone.selectedIndex == 1) {
                                imageIcone.src = "private/monPotager/images/type/salade.png";
                            } else if (selectIcone.selectedIndex == 2) {
                                imageIcone.src = "private/monPotager/images/type/tomate.png";
                            }
                            document.getElementById('intervalleArrosage').value = "";
                            document.getElementById('intervalleArrosage').disabled = false;
                            document.getElementById('engrais').value = "";
                            document.getElementById('engrais').disabled = false;
                            document.getElementById('commentaire').value = "";
                            document.getElementById('commentaire').disabled = false;
                        }
                        else {
                            document.getElementById('nom').value = dataPlante[selectPlante.selectedIndex - 1].nom;
                            document.getElementById('nom').disabled = true;
                            console.log(Number(dataPlante[selectPlante.selectedIndex - 1].img));
                            selectIcone.getElementsByTagName("option")[Number(dataPlante[selectPlante.selectedIndex - 1].img)].selected = 'selected';
                            selectIcone.disabled = true;
                            if (selectIcone.selectedIndex == 0) {
                                imageIcone.src = "private/monPotager/images/type/carotte.png";
                            } else if (selectIcone.selectedIndex == 1) {
                                imageIcone.src = "private/monPotager/images/type/salade.png";
                            } else if (selectIcone.selectedIndex == 2) {
                                imageIcone.src = "private/monPotager/images/type/tomate.png";
                            }
                            document.getElementById('intervalleArrosage').value = Number(dataPlante[selectPlante.selectedIndex - 1].intervalle_arrosage);
                            document.getElementById('intervalleArrosage').disabled = true;
                            document.getElementById('engrais').value = dataPlante[selectPlante.selectedIndex - 1].engrais_conseille;
                            document.getElementById('engrais').disabled = true;
                            document.getElementById('commentaire').value = dataPlante[selectPlante.selectedIndex - 1].conseils;
                            document.getElementById('commentaire').disabled = true;
                        }
                    });
                }
            }
            catch (e) {
                console.error(e);
                return;
            }

            document.getElementById('validé').addEventListener('click', async () => {
                const x = Number(context.button[0]);
                const y = Number(context.button[1]);



                if (selectPlante.selectedIndex) {
                    try {
                        await fetch('api/potager/add', {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                            },
                            method: 'POST',
                            body: 'idUser=' + encodeURIComponent(context.user.id) + '&idPlante=' + encodeURIComponent(selectPlante.value) + '&x=' + encodeURIComponent(x) + '&y=' + encodeURIComponent(y) + '&date_recolte=' + encodeURIComponent(document.getElementById('dateRecolte').value) + "&date_dernier_arrosage=" + encodeURIComponent(document.getElementById('datePlantation').value),
                        });

                        page('/monpotager');
                    }
                    catch (e) {
                        console.error(e);
                        return;
                    }
                } else {
                    if (dataPlante.find(plante => plante.nom === document.getElementById('nom').value) === undefined) {
                        if (document.getElementById('nom').value != "" && document.getElementById('intervalleArrosage').value != "" && document.getElementById('datePlantation').value != "" && document.getElementById('dateRecolte').value != "") {
                            try {
                                await fetch('api/planteData/add', {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                                    },
                                    method: 'POST',
                                    body: 'nom=' + encodeURIComponent(document.getElementById('nom').value) + '&intervalle_arrosage=' + encodeURIComponent(document.getElementById('intervalleArrosage').value) + '&engrais_conseille=' + encodeURIComponent(document.getElementById('engrais').value) + '&conseils=' + encodeURIComponent(document.getElementById('commentaire').value) + '&img=' + encodeURIComponent(selectIcone.selectedIndex),
                                });

                                const result = await fetch('api/planteData/nom/' + encodeURIComponent(document.getElementById('nom').value));
                                const data = await result.json();
                                console.log(data);
                                console.log('idUser=' + encodeURIComponent(context.user.id) + '&idPlante=' + encodeURIComponent(data.id) + '&x=' + encodeURIComponent(x) + '&y=' + encodeURIComponent(y) + '&date_recolte=' + encodeURIComponent(document.getElementById('dateRecolte').value) + "&date_dernier_arrosage=" + encodeURIComponent(document.getElementById('datePlantation').value));

                                await fetch('api/potager/add', {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                                    },
                                    method: 'POST',
                                    body: 'idUser=' + encodeURIComponent(context.user.id) + '&idPlante=' + encodeURIComponent(data.id) + '&x=' + encodeURIComponent(x) + '&y=' + encodeURIComponent(y) + '&date_recolte=' + encodeURIComponent(document.getElementById('dateRecolte').value) + "&date_dernier_arrosage=" + encodeURIComponent(document.getElementById('datePlantation').value),
                                });

                                page('/monpotager');
                            }
                            catch (e) {
                                console.error(e);
                                return;
                            }
                        }
                    } else {
                        alert('La plante existe déjà');
                        console.log(dataPlante.indexOf(document.getElementById('nom').value) + 2);
                        selectPlante.getElementsByTagName("option")[dataPlante.indexOf(document.getElementById('nom').value) + 2].selected = 'selected';
                        document.getElementById('nom').value = dataPlante[selectPlante.selectedIndex - 1].nom;
                        document.getElementById('nom').disabled = true;
                        document.getElementById('intervalleArrosage').value = dataPlante[selectPlante.selectedIndex - 1].intervalle_arrosage;
                        document.getElementById('intervalleArrosage').disabled = true;
                        document.getElementById('engrais').value = dataPlante[selectPlante.selectedIndex - 1].engrais_conseille;
                        document.getElementById('engrais').disabled = true;
                        document.getElementById('commentaire').value = dataPlante[selectPlante.selectedIndex - 1].conseils;
                        document.getElementById('commentaire').disabled = true;
                    }
                }
            });
        }
        load();
    }
});

page('register', async function () {
    await renderTemplate(templates('public/templates/register.mustache'), context);
    const boutonBack = document.getElementById('annulé');
    boutonBack.addEventListener('click', () => {
        page('/');
    }
    );

    const formRegister = document.getElementById('formRegister');
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('register');
    }
    );
    const boutonRegister = document.getElementById('validé');
    boutonRegister.addEventListener('click', async () => {
        console.log('register');
        const nom = document.getElementById('nom').value;
        console.log(nom);
        const prenom = document.getElementById('prenom').value;
        console.log(prenom);
        const email = document.getElementById('email').value;
        console.log(email);
        const password = document.getElementById('password').value;
        console.log(password);
        const password2 = document.getElementById('password2').value;
        const departement = document.getElementById('departement').value;
        const disponibilite = document.getElementById('disponibilite').value;
        console.log(disponibilite);
        const preferences = document.getElementById('preferences').value;
        console.log(preferences);
        const langue = document.getElementById('langue').value;
        const role = document.getElementById('role').value;

        if (nom == "" || prenom == "" || email == "" || password == "" || password2 == "" || role == "" || departement == "") {
            const notificationRegister = document.getElementById('notificationRegister');
            notificationRegister.style.top = window.scrollY + 20 + "px";
            notificationRegister.innerHTML = 'Il manque des informations<img src="public/images/mauvais.png" alt="erreur">'
            notificationRegister.style.opacity = 1;
            setTimeout(function () {
                notificationRegister.style.opacity = "0";
            }, 3000);
        } else if (password != password2) {
            console.log('mdp pas identique');
            const notificationRegister = document.getElementById('notificationRegister');
            notificationRegister.style.top = window.scrollY + 20 + "px";
            notificationRegister.innerHTML = 'Les mots de passe de correspondent pas<img src="public/images/mauvais.png" alt="erreur">'
            notificationRegister.style.opacity = 1;
            setTimeout(function () {
                notificationRegister.style.opacity = "0";
            }, 3000);
        } else {
            try {
                // On fait ensuite un fetch sur l'api pour s'authentifier
                await fetch('api/user/add', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                    },
                    method: 'POST',
                    body: 'nom=' + encodeURIComponent(nom) + '&prenom=' + encodeURIComponent(prenom) + '&email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password) + '&departement=' + encodeURIComponent(departement) + '&disponibilite=' + encodeURIComponent(disponibilite) + '&preferences=' + encodeURIComponent(preferences) + '&langue=' + encodeURIComponent(langue) + '&role=' + encodeURIComponent(role),
                });

                context.previous = 'register';

                page('/');
            }
            catch (e) {
                console.error(e);
                page('/');
                return;
            }
        }
    }
    );
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
        const notificationAccueil = document.querySelector('#notificationAccueil');
        notificationAccueil.style.opacity = "0";
        if (context.erreur) {
            notificationAccueil.innerHTML = context.erreur + '<img src="public/images/mauvais.png" alt="erreur">';
            console.log(context.erreur);
            notificationAccueil.style.opacity = "1";
            setTimeout(function () {
                notificationAccueil.style.opacity = "0";
            }, 3000);
            context.erreur = '';
        }

        if (context.previous == 'register') {
            notificationAccueil.innerHTML = 'Votre compte a bien été créé ! <img src="public/images/bon.png" alt="bon">';
            notificationAccueil.style.borderColor = "green";
            notificationAccueil.style.width = "280px";
            notificationAccueil.style.opacity = "1";
            setTimeout(function () {
                notificationAccueil.style.opacity = "0";
                notificationAccueil.style.borderColor = "red";
                notificationAccueil.style.width = "250px";
            }, 3000);
            context.previous = '';
        }

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

        document.querySelector('#register-btn').addEventListener('click', () => {
            page('/register');
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
                        context.erreur = false;
                        page('/main');
                    }
                    else {
                        // Sinon on réaffiche la page avec quelques infos pour expliquer ce qui n'a pas marché
                        context.erreur = result.message;
                        renderLoginPage(context);
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
