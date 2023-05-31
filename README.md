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

Ce dossier contient les fichiers accessibles à un utilisateur qui n'est pas connecté. Il contient les fichiers HTML, CSS et JS permettant la connexion et l'inscription d'un utilisateur. Il contient aussi le fichier `main.js` qui gère l'entièreté du site. Il permet de gérer les différentes pages du site, et de faire les requêtes HTTP nécessaires à l'API pour récupérer les données de la base de données. 

### Private 

Ce dossier contient les fichiers accessibles à un utilisateur connecté. Il gère aussi la page d'ajout de tâche ainsi que celle d'ajout de plante. Pour chaque page, on retrouve un dossier répertoriant les fichiers mustache, le fichier CSS, les images et un fichier JS si nécessaire. L'ensemble des pages est décrite plus en détail dans la partie suivante.

## Pages du site

### Page de connexion `/`

Quand vous arrivez sur le site, une première page d'acceuil vous permet de vous connecter en rentrant un email et un mot de passe. Si vous n'avez pas de compte, vous pouvez en créer un en cliquant sur le bouton "Créer un compte". Vous serez alors redirigé vers une page d'inscription.

On vérifie que l'utilisateur existe bien dans la base de données, et que le mot de passe rentré est le bon. Si c'est le cas, on crée une session utilisateur et on redirige vers la page d'accueil. Sinon, on affiche un message d'erreur demandant à l'utilisateur de vérifier les informations rentrées.

### Page d'inscription `/register`

Sur cette page, vous pouvez créer un compte avec les champs suivants : 
- Nom
- Prénom
- Email
- Mot de passe (à confirmer)
- Département dans l'école
- Langue
- Rôle

Ces informations sont alors stockés dans les champs correspondants de la table `user` de la base de données.
Une fois le compte créé, vous serez redirigé vers la page de connexion, où vous pourrez vous connecter avec vos identifiants fraîchement créés.

### Page d'accueil `/main`

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

Ces informations sont récupérées grâce à une API Open-Meteo, qui est accessible à l'adresse suivante : [API Meteo](https://api.open-meteo.com/v1/forecast?latitude=47.22&longitude=-1.55&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m,uv_index,terrestrial_radiation&current_weather=true&forecast_days=1&timezone=Europe%2FBerlin)

Cette API nous renseigne sur la météo actuelle à la longitude et latitude indiquées. On peut alors récupérer les informations qui nous intéressent, et les afficher sur notre site. On peut également trouver un bouton permettant de recharger les informations météo si besoin.

Enfin, on retrouve une liste des tâches à faire dans le potager, avec la possibilité de cocher les tâches effectuées, de les supprimer, ou d'en ajouter de nouvelles. On peut aussi choisir si la tâche nous est assignée ou non.

### Page Mon Potager `/monpotager`

Sur cette page, on peut gérer son potager. On retrouve tout d'abord un bouton permettant de retourner à l'acceuil (`/main`). Au dessus de ce bouton, on retrouve un récapitulatif de notre potager, avec une liste déroulante permettant de choisir l'état du potager : 
- Bon état 
- Mauvais état
- A arroser
- En travaux 

Cette liste correspond à l'attribut `etat` de la table `user` de la base de données.

Cette liste permet à l'utilisateur de donner l'état de son potager, et de le modifier à tout moment.

A droite de l'écran, on retrouve tout d'abord une liste des tâches à faire dans le potager, la même que celle de la page `/main`. Cependant, on peut cette fois ajouter une tâche en cliquant sur le bouton "Ajouter une tâche". Cela nous emmène sur la page d'ajout de tâche.

En dessous de la liste des tâches, on retrouve une carte du potager. Cette carte est une grille du potager qui permet de visualiser les différentes plantes présentes dans le potager. Chaque case de la grille correspond à une plante. On peut cliquer sur une case pour afficher les informations de la plante correspondante. Si une case est vide, elle présente un symbole de `+` vert qui permet d'ajouter une plante à cette case. Cela nous emmène sur la page d'ajout de plante.

### Page Ajouter une tâche `/ajouttache`

Sur cette page, on retrouve la possibilité d'ajouter une tâche à la liste de tâche. Chaque tâche est composée des champs suivants : 
- Nom de la tâche 
- Date avant laquelle la tâche doit être effectuée
- Personne à qui la tâche est assignée
- Description de la tâche

Une fois les champs renseigné, on est redigiré vers la page `/monpotager`, où la tâche est ajoutée à la liste des tâches.

### Page Ajouter une plante `/ajoutplante`

Pour la page d'ajout de plante, on retrouve les fonctionnalitées suivantes : 
- Si on a déjà créé une plante, on peut la sélectionner dans une liste déroulante. Cela nous permet de remplir automatiquement les champs de la plante avec les informations déjà renseignées.
- Sinon, on peut décider de créer une plante de toute pièce. On retrouve alors les champs suivants : 
    - Nom de la plante
    - Icône de la plante (liste déroulante avec les icônes disponibles)
    - Date de plantation (Calendrier pour choisir la date)
    - Date de récolte (Calendrier pour choisir la date)
    - Intervalle d'arrosage (Nombre entier en jours)
    - Engrais conseillé 
    - Commentaire

Les champs obligatoires sont marqués par une astérisque (`*`). Une fois les champs renseignés, on peut cliquer sur le bouton "Ajouter la plante". Cela nous emmène sur la page `/monpotager`, où la plante est ajoutée à la case sélectionnée.

### Page Agenda `/agenda`

Sur cette page, on retrouve un agenda qui permet de visualiser les différentes tâches à faire dans la semaine. 

On y trouve aussi un bouton "Retour" sous la forme d'une flèche qui permet de retourner à la page d'accueil (`/main`).

### Page Autres potagers `/autrepotager`

Sur cette page, on peut visualiser les potagers des autres utilisateurs de la base de données. On retrouve une liste déroulante permettant de choisir un utilisateur. Une fois un utilisateur sélectionné, on peut voir son potager, avec les différentes plantes présentes dans son potager. On peut cliquer sur une plante pour afficher ses informations. 

On peut aussi voir la liste des tâches associées à ce potager, avec la possibilité de les cocher si elles sont effectuées. On peut également s'assigner une tâche en cliquant sur le bouton "Je m'assigne cette tâche" ou 