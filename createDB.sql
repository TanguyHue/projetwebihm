drop table if exists user;
drop table if exists PlanteData;
drop table if exists PlantePotager;
drop table if exists Potager;
drop table if exists Tache;

--
-- Création de la table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `adresse_mail` varchar(255) NOT NULL,
  `departement` varchar(255) NOT NULL,
  `disponibilite` date NOT NULL,
  `preferences` varchar(255) NOT NULL,
  `langue` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

--
-- Création de la table `PlanteData`
--

CREATE TABLE IF NOT EXISTS `PlanteData` (
  `id` int NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prix` int(11) NOT NULL,
  `intervalle_arrosage` varchar(255) NOT NULL,
  `conseils` varchar(255) NOT NULL,
  `engrais_conseille` varchar(255) NOT NULL,	
  PRIMARY KEY (`id`)
);

--
-- Création de la table `PlantePotager`
--

CREATE TABLE IF NOT EXISTS `PlantePotager` (
  `id` int NOT NULL,
  `idPlanteData` int NOT NULL,
  `idUser` int NOT NULL,
  `idPotager` int NOT NULL,	
  `etat` varchar(255) NOT NULL CHECK (etat in(0,1)),
  `date_floraison` date NOT NULL,
  `date_recolte` date NOT NULL,
  `date_dernier_arrosage` date NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (idPlanteData) REFERENCES PlanteData(id),
  FOREIGN KEY (idUser) REFERENCES user(id),
  FOREIGN KEY (idPotager) REFERENCES Potager(id)
);

--
-- Création de la table `Potager`
--

CREATE TABLE IF NOT EXISTS `Potager` (
  `id` int NOT NULL,
  `nombre_plante` int(11) NOT NULL,
  `largeur` int(11) NOT NULL,
  `longueur` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);

--
-- Création de la table `Tache`
--

CREATE TABLE IF NOT EXISTS `Tache` (
  `id` int NOT NULL,
  `idCreateur` int NOT NULL,
  `idRealisateur` int,
  `titre` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `notes` varchar(255) NOT NULL,
  `etat` varchar(255) NOT NULL CHECK (etat in(0,1)),
  PRIMARY KEY (`id`),
  FOREIGN KEY (idCreateur) REFERENCES user(id)
  FOREIGN KEY (idRealisateur) REFERENCES user(id)
);


--
-- Insertions
--

INSERT INTO `user` (`id`, `password`, `nom`, `prenom`, `adresse_mail`, `departement`, `disponibilite`, `preferences`, `langue`, `role`) VALUES
(1, 'aaa', 'Dupont', 'Jean', 'jean@dupont', 'INFO', '1980-12-17', 'aucune', 'francais', 'beau-gosse');