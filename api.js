/* eslint-env node */
'use strict';

// Ce module nodejs gère l'API de notre site
// Il définit l'ensemble des routes (relative à "/api") corresponant aux 
// points d'entrée de l'API

// Expressjs
const express = require('express');
// Notre module nodejs d'accès simplifié à la base de données
const dbHelper = require('./dbhelper.js');

// Comme c'est un module nodejs il faut exporter les fonction qu'on veut rendre publiques
// ici on n'exporte qu'ne seule fonction (anonyme) qui est le "constructeur" du module
// Cette fonction prend en paramètre un objet "passport" pour la gestion de l'authentification 
module.exports = (passport) => {
    const app = express();

    // Parti /potager

    app.get('/potager/:id', function (req, res, next) {
        dbHelper.potager.byId(req.params.id).then(
            potager => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(potager));
            },
            err => {
                next(err);
            },
        );
    });

    app.get('/potager', function (req, res, next) {
        dbHelper.potager.all().then(
            potager => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(potager));
            },
            err => {
                next(err);
            },
        );
    });

    app.get('/potager/:idUser/plantes', function (req, res, next) {
        dbHelper.potager.byId(req.params.idUser).plantes.then(
            plantes => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(plantes));
            },
            err => {
                next(err);
            },
        );
    });

    app.get('/potager/:x/:y', function (req, res, next) {
        dbHelper.potager.byCoord(req.params.x, req.params.y).then(
            potager => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(potager));
            },
            err => {
                next(err);
            },
        );
    });

    // Partie /plante

    app.get('/planteData', function (req, res, next) {
        dbHelper.planteData.all().then(
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
        dbHelper.planteData.byId(req.params.id).then(
            planteData => {
                res.set('Content-type', 'application/json');
                res.send(JSON.stringify(planteData));
            },
            err => {
                next(err);
            },
        );
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


    // Authentification pour accéder aux parties privées de l'api (on n'en a pas dans cet exemple)
    // et aux templates privés
    // C'est ici qu'on utilise passport pour créer une session utilisateur
    app.post('/login', function (req, res, next) {
        if (!req.body.username) {
            return res.send({success: false, message: 'empty username'});
        }
        if (!req.body.password) {
            return res.send({success: false, message: 'empty password'});
        }
        passport.authenticate('local', function (err, user) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.send({succes: false, message: 'authentication failed'});
            }
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.send({success: true, message: 'authentication succeeded'});
            });
        })(req, res, next);
    });

    return app;
}
