drop table if exists user;
drop table if exists album;
drop table if exists artist;

--
-- artists
--

create table artist (
    id integer primary key,
    name text not null
);

--
-- albums
--

create table album (
    name text not null,
    year integer,
    artist_id integer not null,
    foreign key(artist_id) references artist(id)
);

--
-- users
--

create table user (
    id integer primary key,
    name text not null,
    password text
);

--
-- Populate tables
--

insert into artist (id, name) values
    (0, 'Cream'),
    (1, 'Pink Floyd'),
    (2, 'Frank Zappa');
insert into album (artist_id, year, name) values
    (0, 1966, 'Fresh Cream'),
    (1, 1969, 'Ummagumma');
insert into user (name, password) values
    ('admin', 'admin');

