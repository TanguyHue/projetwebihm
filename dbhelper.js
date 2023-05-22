/* eslint-env node */
'use strict';

// Ce modules fournit quelques fonction pour simplifier l'accès
// à notre base de données sqlite

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./Potager.db', sqlite3.OPEN_READWRITE, function (err) {
    if (err) {
        console.error(err + '\n' + 'run "npm run createDB" to create a database file');
        // Pas de problème pour faire un appel synchrone ici : on est dans la phase
        // d'initialisation du serveur et pas dans le traitement de requêtes.
        require('process').exit(-1);
    }
});

// Rend la fonction get de l'api sqlite compatible avec les promesses
const get = sql => new Promise(function (resolve, reject) {
    db.get(sql, function (err, row) {
        if (err) {
            reject(err);
        }
        else {
            resolve(row);
        }
    });
});

// Idem pour la fonction all
const all = sql => new Promise(function (resolve, reject) {
    db.all(sql, function (err, rows) {
        if (err) {
            reject(err);
        }
        else {
            resolve(rows);
        }
    });
});

module.exports.users = {
    byUsername: (username) => get(`
        select id, password, nom, prenom, departement, role from user where adresse_mail = '${username}';
    `),
    a: Promise.resolve({
        id: 0,
        checkPassword: (/*password*/) => true,
    }),
    byId: id => get(`select adresse_mail as username from user where id = ${id}`),
    byIdAndPassword: (id, password) => get(`select * from user where id = ${id} and password = '${password}'`),
};


module.exports.PlantePotager = {
    byId: id => ({
        get PlantePotager() {
            return all(`
                select * from PlantePotager where id = ${id|0};
            `);
        }
    }),
    all: () => all('select * from PlantePotager'),
    byIdUser: id => ({
        get PlantePotager() {
            return all(`
                select * from PlantePotager where idUser = ${id|0};
            `);
        }
    }),
    byXandY: (x, y) => ({
        get PlantePotager() {
            return all(`
                select * from PlantePotager where x = ${x|0} and y = ${y|0};
            `);
        }
    }),
};

module.exports.PlanteData = {
    byId: id => ({
        get PlanteData() {
            return all(`
                select * from PlanteData where id = ${id|0};
            `);
        }
    }),
    all: () => all('select * from PlanteData'),
    byIdPlantePotager: id => ({
        get PlanteData() {
            return all(`
                select * from PlanteData where idPlantePotager = ${id|0};
            `);
        }
    }),
};

module.exports.taches = {
    byId: id => ({
        get taches() {
            return all(`
                select * from taches where id = ${id|0};
            `);
        }
    }),
    all: () => all('select * from taches'),
    byEtat: etat => ({
        get taches() {
            return all(`
                select * from taches where etat = '${etat}';
            `);
        }
    }),
    byUser: id => ({
        get taches() {
            return all(`
                select * from taches where idUser = ${id|0};
            `);
        }
    }),
    toDo: () => all(`
        select * from taches where etat = '0';
    `),
    byUserToDo: id => ({
        get taches() {
            return all(`
                select * from taches where idUser = ${id|0} and etat = '0';
            `);
        }
    }),
    ajoutUser: (id, idUser) => ({
        get taches() {
            return all(`
                update taches set idRealisateur = ${idUser|0} where id = ${id|0};
            `);
        }
    }),
    suppRealisateurTache: id => ({
        get taches() {
            return all(`
                update tache set idRealisateur = null where id = ${id|0};
            `);
        }
    }),
};