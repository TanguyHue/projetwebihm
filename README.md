# Projet Web-IHM

[Lien du drive](https://drive.google.com/drive/u/0/folders/10AicmWCYztUl-gz1vEhxgxGWnEvKsUsb)

## Avant tout chose

N'oubiez pas le `npm install`

## Création de la base

Attention, le script supprime les éventuelles données existantes !

Lancer `sqlite3 PolyMusic.db < createDB.sql` ou, via npm, `npm run createDB`

Bien évidemment, pensez à avoir installé sqlite3 (par exemple 
```bash
$ wget https://sqlite.org/2019/sqlite-autoconf-3280000.tar.gz
$ (cd sqlite-autoconf-3280000/ && ./configure --prefix="$HOME" \
                               && make && make install)

)
```
devrait faire l'affaire sur un système disposant de l'environnement de
compilation autoconf.

Pensez également à avoir un client web récent et à jour (ce qui est normalement
le cas pour des raisons évidentes de sécurité sur un code a priori
sensible...), cf. par exemple

https://tc39.github.io/proposal-object-from-entries/

## Lancement du serveur

Un petit `npm start`
