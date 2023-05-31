# Projet Web-IHM

[Lien du drive](https://drive.google.com/drive/u/0/folders/10AicmWCYztUl-gz1vEhxgxGWnEvKsUsb)

## Avant tout chose

N'oubiez pas le `npm install` pour pouvoir opbtenir les dépendances nécessaires au bon fonctionnement du projet.

## Création de la base

Attention, le script supprime les éventuelles données existantes !

Lancer `sqlite3 PolyMusic.db < createDB.sql` ou, via npm, `npm run createDB`

Bien évidemment, pensez à avoir installé sqlite3 (par exemple) en bash, la commande : 
```bash
$ wget https://sqlite.org/2019/sqlite-autoconf-3280000.tar.gz
$ (cd sqlite-autoconf-3280000/ && ./configure --prefix="$HOME" \
                               && make && make install)


```
devrait faire l'affaire sur un système disposant de l'environnement de
compilation autoconf.
Pour être sûr que tout fonctionne, vous pouvez lancer `sqlite3` et vérifier que le système connaît bien la commande.

Pensez également à avoir un client web récent et à jour (ce qui est normalement
le cas pour des raisons évidentes de sécurité sur un code a priori
sensible...), cf. par exemple

https://tc39.github.io/proposal-object-from-entries/

## Lancement du serveur

Pour lancer le serveur, il suffit de taper `npm start` dans le dossier racine du projet. Le serveur se lancera et un message dans la console vous indiquera l'adresse à laquelle vous pouvez accéder au site. Il vous suffira de cliquer sur le lien pour y accéder.

En cas de crash du serveur, il peut être nécessaire de ré-initialiser la base de données. Pour cela, il suffit de lancer la commande `npm run createDB` dans le dossier racine du projet.
Ensuite, il suffit de relancer le serveur avec la commande `npm start`.

## Fichier du projet

### Fichier `server.js`

Ce fichier contient le code du serveur. Il permet de lancer le serveur et de gérer les requêtes HTTP. Il permet de s'assurer qu'une personne connectée ne puisse pas accéder à une page sans être connectée, et de rediriger vers la page de connexion si ce n'est pas le cas. 

### Fichier `dbhelper.js`

Ce fichier contient des fonctions permettant de simplifier l'accès à la base de données. Il permet de simplifier les requêtes SQL et de les rendre plus lisibles. C'est à dire qu'il créé des fonctions permettant d'effectuer des requêtes SQL, et de récupérer les données de la base de données.

### Fichier `api.js`

Ce module Node.js gère l'API de notre site. Il contient un ensemble de routes (relative à `/api`) qui correspondent aux points d'entrée de l'API, avec différentes fonctionnalités telles que la gestion des données des plantes, des tâches, des utilisateurs, et du potager.

Il utilise les différentes fonctions définies dans `dbhelper.js` pour récupérer les données de la base de données.

Les routes liées aux données des plantes permettent d'effectuer des opérations telles que récupérer toutes les données des plantes, récupérer les données d'une plante spécifique par son ID, ou récupérer les données d'une plante par son nom. Il y a également une route pour ajouter de nouvelles données de plante.

Les routes liées aux tâches permettent de récupérer les tâches en fonction de leur état ou de l'utilisateur associé. Il y a aussi des routes pour ajouter ou supprimer un utilisateur à une tâche, changer l'état d'une tâche, ou changer le réalisateur d'une tâche.

Il y a également des routes pour l'authentification des utilisateurs, permettant de créer une session utilisateur à partir d'un nom d'utilisateur et d'un mot de passe. On peut également récupérer un utilisateur par son nom d'utilisateur et son mot de passe.

Enfin, il y a des routes pour la gestion des utilisateurs, telles que l'ajout d'un nouvel utilisateur, le changement de l'état d'un utilisateur, ou la récupération de la liste des utilisateurs.

### Fichier `auth.js`

Ce module permet de gérer l'authentification avec la librairie `passport.js`. Il dépend également du module `dbHelper` puisque les informations de nos utilisateurs sont stockées dans la base de données. Il utilise la stratégie `LocalStrategy` de `passport.js` pour stocker les informations des utilisateurs en local sur notre base de données. Il permet de vérifier qu'un utilisateur est bien dans la base de données, et qu'il a bien rentré le bon mot de passe. Il stock ensuite les informations de l'utilisateur dans le cookie de la session. 

### Public 

Ce dossier contient les fichiers accessibles à un utilisateur qui n'est pas connecté. Il contient les fichiers HTML, CSS et JS permettant la connexion et l'inscription d'un utilisateur. 

## Pages du site

### Page de connexion

Quand vous arrivez sur le site, une première page d'acceuil vous permet de vous connecter en rentrant un email et un mot de passe. Si vous n'avez pas de compte, vous pouvez en créer un en cliquant sur le bouton "Créer un compte". Vous serez alors redirigé vers une page d'inscription.

### Page d'inscription

Sur cette page, vous pouvez créer un compte avec les champs suivants : 
- Nom
- Prénom
- Email
- Mot de passe (à confirmer)
- Département dans l'école
- Langue
- Rôle

Une fois le compte créé, vous serez redirigé vers la page d'accueil, où vous pourrez vous connecter avec vos identifiants fraîchement créés.

### Page d'accueil

Sur cette page, on retrouve les différentes fonctionnalités du site. Une petite description de la personne connectée est affichée en haut à gauche, avec son nom, prénom, département et rôle. On retrouve également un bouton "Déconnexion" qui nous permet de nous déconnecter du site.

En dessous, on retrouve les différentes fonctionnalités du site, à savoir : 
- Gérer son potager (Nous emmène sur la page mon_potager)
- Agenda général (Nous emmène sur la page agenda)
- Les autres potagers (Nous emmène sur la page autrePotager)

Chaque bouton nous emmène sur la page correspondante. 

On retrouve également un récapitulatif météo en haut à droite de la page, qui nous indique la météo actuelle à Polytech Nantes. On peut y voir : 
- L'indice UV
- La température
- L'ozone
- La vitess du vent
- L'humidité
- Le % de précipitations

Enfin, on retrouve une liste des tâches à faire dans le potager, avec la possibilité de cocher les tâches effectuées, de les supprimer, ou d'en ajouter de nouvelles. On peut aussi choisir si la tâche nous est assignée ou non.

### Page Mon Potager `/monpotager`

Sur cette page, on peut gérer son potager. On retrouve tout d'abord un bouton permettant de retourner à l'acceuil (`/main`). Au dessus de ce bouton, on retrouve un récapitulatif de notre potager, avec une liste déroulante permettant de choisir l'état du potager : 
- Bon état 
- Mauvais état
- A arroser
- En travaux 

Cette liste correspond à l'attribut `etat` de la table `user` de la base de données.

Cette liste permet à l'utilisateur de donner l'état de son potager, et de le modifier à tout moment.

