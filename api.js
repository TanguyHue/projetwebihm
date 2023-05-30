/* eslint-env node */
'use strict';

// Ce module nodejs gère l'API de notre site
// Il définit l'ensemble des routes (relative à "/api") corresponant aux 
// points d'entrée de l'API

// Expressjs
const express = require('express');
// Notre module nodejs d'accès simplifié à la base de données
const dbHelper = require('./dbhelper.js');
const app = express();

// Comme c'est un module nodejs il faut exporter les fonction qu'on veut rendre publiques
// ici on n'exporte qu'ne seule fonction (anonyme) qui est le "constructeur" du module
// Cette fonction prend en paramètre un objet "passport" pour la gestion de l'authentification 
module.exports = (passport) => {
    // Partie /plante

    app.get('/planteData', function (req, res, next) {
        dbHelper.PlanteData.all().then(
            planteData => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(planteData));
            },
            err => {
                next(err);
            },
        );
    });

    app.get('/planteData/:id', function (req, res, next) {
        dbHelper.PlanteData.byId(req.params.id).then(
            planteData => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(planteData));
            },
            err => {
                next(err);
            },
        );
    });

    app.get('/planteData/nom/:nom', function (req, res, next) {
        dbHelper.PlanteData.byNom(req.params.nom).then(
            planteData => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(planteData));
            },
            err => {
                next(err);
            },
        );
    });

    app.post('/planteData/add', function (req, res, next) {
        dbHelper.PlanteData.add(req.body.nom, req.body.intervalle_arrosage, req.body.conseils, req.body.engrais_conseille, req.body.img).then(
            planteData => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(planteData));
            }
        )
    });

    // Parti taches

    app.get('/taches', function (req, res, next) {
        dbHelper.taches.byEtat(0).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            },
            err => {
                next(err);
            },
        );
    });

    app.get('/taches/:idUser', function (req, res, next) {
        dbHelper.taches.byUser(req.params.idUser).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            },
            err => {
                next(err);
            },
        );
    });

    app.post('/taches/:idTache/add/:idUser', function (req, res, next) {
        dbHelper.taches.addUser(req.params.idTache, req.params.idUser).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            },
            err => {
                next(err);
            },
        );
    });


    app.post('/taches/:idTache/remove', function (req, res, next) {
        dbHelper.taches.suppTache(req.params.idTache).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            },
            err => {
                next(err);
            },
        );
    });

    app.post('/taches/changeEtat', function (req, res, next){
        dbHelper.taches.changeEtat(req.body.id, req.body.etat).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            },
            err => {
                next(err);
            },
        )
    });

    app.post('/taches/changeRealisateur', function (req, res, next){
        dbHelper.taches.changeRealisateur(req.body.id, req.body.realisateur).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            },
            err => {
                next(err);
            },
        )
    });


    // Authentification pour accéder aux parties privées de l'api (on n'en a pas dans cet exemple)
    // et aux templates privés
    // C'est ici qu'on utilise passport pour créer une session utilisateur
    app.post('/login', function (req, res, next) {
        if (!req.body.username) {
            return res.send({ success: false, message: 'empty username' });
        }
        if (!req.body.password) {
            return res.send({ success: false, message: 'empty password' });
        }
        passport.authenticate('local', function (err, user) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.send({ succes: false, message: 'authentication failed' });
            }
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.send({ success: true, message: 'authentication succeeded' });
            });
        })(req, res, next);
    });

    app.get('/login/:username/:password', function (req, res, next) {
        dbHelper.users.byUsername(req.params.username).then(
            user => {
                if (user.password === req.params.password) {
                    res.set('Content-type', 'application/json');
                    res.send(JSON.stringify(user));
                } else {
                    res.set('Content-type', 'application/json');
                    res.send(JSON.stringify({}));
                }
            },
            err => {
                next(err);
            },
        );
    });

    app.post('/user/add', function (req, res, next) {
        const adresse_mail = req.body.email; // Récupérer l'adresse mail à partir du corps de la requête
        console.log(adresse_mail);
        const password = req.body.password; // Récupérer le mot de passe à partir du corps de la requête
        const nom = req.body.nom; // Récupérer le nom à partir du corps de la requête
        const prenom = req.body.prenom; // Récupérer le prénom à partir du corps de la requête
        const departement = req.body.departement; // Récupérer le département à partir du corps de la requête
        const langue = req.body.langue; // Récupérer la langue à partir du corps de la requête
        const role = req.body.role; // Récupérer le rôle à partir du corps de la requête
        const etat = 0;

        dbHelper.users.addUser(adresse_mail, password, nom, prenom, departement, langue, role, etat).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            }
        );
    });

    app.post('/user/changeEtat', function (req, res, next) {
        const id = req.body.id;
        const etat = req.body.etat;

        dbHelper.users.changeEtat(id, etat).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            }
        );
    });

    app.post('/taches/add', function (req, res, next) {
        const idCreateur = req.body.idCreateur; // Récupérer l'id du créateur de la tâche à partir du corps de la requête
        const idRealisateur = req.body.idRealisateur; // Récupérer l'id du réalisateur de la tâche à partir du corps de la requête
        const titre = req.body.titre; // Récupérer le titre de la tâche à partir du corps de la requête
        const date = req.body.date; // Récupérer la date de la tâche à partir du corps de la requête
        const notes = req.body.notes; // Récupérer les notes de la tâche à partir du corps de la requête

        dbHelper.taches.addTache(idCreateur, idRealisateur, titre, date, notes).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            }
        );

    });

    app.post('/taches/remove', function (req, res, next) {
        dbHelper.taches.rmTache(req.body.id).then(
            taches => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(taches));
            }
        );

    });

    app.post('/potager/add', function (req, res, next) {
        const idUser = req.body.idUser; // Récupérer l'id du créateur de la tâche à partir du corps de la requête
        const idPlante = req.body.idPlante; // Récupérer l'id du réalisateur de la tâche à partir du corps de la requête
        const x = req.body.x; // Récupérer le titre de la tâche à partir du corps de la requête
        const y = req.body.y; // Récupérer la date de la tâche à partir du corps de la requête
        const date_recolte = req.body.date_recolte; // Récupérer les notes de la tâche à partir du corps de la requête
        const date_dernier_arrosage = req.body.date_dernier_arrosage; // Récupérer les notes de la tâche à partir du corps de la requête

        dbHelper.PlantePotager.addPotager(idUser, idPlante, x, y, date_recolte, date_dernier_arrosage).then(
            potagers => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(potagers));
            }
        );
    });

    app.get('/potager/byXandYandUser/:x/:y/:idUser', function (req, res, next) {
        const x = req.params.x; // Récupérer l'id du créateur de la tâche à partir du corps de la requête
        const y = req.params.y; // Récupérer le titre de la tâche à partir du corps de la requête
        const idUser = req.params.idUser; // Récupérer la date de la tâche à partir du corps de la requête

        dbHelper.PlantePotager.byXandYandUser(x, y, idUser).then(
            potagers => {
                if (potagers === undefined) {
                    potagers = null;
                }
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(potagers));
            }
        );

    });

    app.post('/potager/arrose', function (req, res, next) {
        const x = req.body.x; // Récupérer l'id du créateur de la tâche à partir du corps de la requête
        const y = req.body.y; // Récupérer le titre de la tâche à partir du corps de la requête
        const idUser = req.body.idUser; // Récupérer la date de la tâche à partir du corps de la requête
        const dateActuelle = new Date();
        let aujourdhui = '';
        let mois = '';
        let jour = '';
        if (dateActuelle.getMonth() < 10) {
            mois = '0' + (dateActuelle.getMonth() + 1) ;
        } else {
            mois = dateActuelle.getMonth() + 1;
        }

        if (dateActuelle.getDate() < 10) {
            jour = '0' + dateActuelle.getDate();
        } else {
            jour = dateActuelle.getDate();
        }

        let annee = dateActuelle.getFullYear();
        aujourdhui = annee + '-' + mois + '-' + jour;

        console.log(aujourdhui);
        console.log('update PlantePotager set date_dernier_arrosage = ' + aujourdhui + ' where x = '+ x + ' and y = ' + y +' and idUser = ' + idUser + ';')
        dbHelper.PlantePotager.arrose(x, y, idUser, aujourdhui).then(
            potagers => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(potagers));
            }
        );

    });
    return app;
}