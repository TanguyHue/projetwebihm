drop table if exists user;
drop table if exists PlanteData;
drop table if exists PlantePotager;
drop table if exists Taches;

--
-- Création de la table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `password` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `adresse_mail` varchar(255) NOT NULL UNIQUE,
  `departement` varchar(255) NOT NULL,
  `langue` varchar(255) NOT NULL,
  `role`varchar(255) NOT NULL,
  `etat` varchar(255) NOT NULL CHECK (etat in(0,1,2,3))
);

--
-- Création de la table `PlanteData`
--

CREATE TABLE IF NOT EXISTS `PlanteData` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nom` varchar(255) NOT NULL UNIQUE,
  `intervalle_arrosage` varchar(255) NOT NULL,
  `conseils` varchar(255) NOT NULL,
  `engrais_conseille` varchar(255) NOT NULL,
  `img` int(11) NOT NULL
);

--
-- Création de la table `PlantePotager`
--

CREATE TABLE IF NOT EXISTS `PlantePotager` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `idPlanteData` int NOT NULL,
  `idUser` int NOT NULL,
  `date_recolte` date NOT NULL,
  `date_dernier_arrosage` date NOT NULL,
  FOREIGN KEY (idPlanteData) REFERENCES PlanteData(id),
  FOREIGN KEY (idUser) REFERENCES user(id)
);

--
-- Création de la table `Tache`
--

CREATE TABLE IF NOT EXISTS `Taches` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `idCreateur` int NOT NULL,
  `idRealisateur` int,
  `titre` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `notes` varchar(255) NOT NULL,
  `etat` varchar(255) NOT NULL CHECK (etat in(0,1)),
  FOREIGN KEY (idCreateur) REFERENCES user(id)
  FOREIGN KEY (idRealisateur) REFERENCES user(id)
);


--
-- Insertions
--

INSERT INTO `user` (`password`, `nom`, `prenom`, `adresse_mail`, `departement`, `langue`, `role`, `etat`) VALUES
('aaa', 'Dupont', 'Jean', 'jean@dupont', 'INFO', 'francais', 'beau-gosse', '0');

INSERT INTO `user` (`password`, `nom`, `prenom`, `adresse_mail`, `departement`, `langue`, `role`, `etat`) VALUES
('aaa', 'Dupond', 'Jean', 'jean@dupond', 'INFO', 'francais', 'beau-gosse', '0');

insert into taches (idCreateur, idRealisateur, titre, date, notes, etat) values (1, 1, 'zzaeaz', '1980-12-17', 'aaza', 0);
