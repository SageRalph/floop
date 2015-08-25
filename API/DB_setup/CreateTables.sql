CREATE TABLE Account (
username    VARCHAR(30) PRIMARY KEY,
regDate     DATETIME    DEFAULT CURRENT_TIMESTAMP,
email       VARCHAR(254),
phone       VARCHAR(16),
studentNo   VARCHAR(6)
);
CREATE TABLE Film (
filmID      INTEGER	AUTO_INCREMENT	PRIMARY KEY,
title       VARCHAR(30)	NOT NULL,
trailer     VARCHAR(50),
releaseYear INTEGER,
watched     BOOLEAN     NOT NULL
);
CREATE TABLE FilmGenre (
filmID      INTEGER,
genre       VARCHAR(30),
INDEX	(filmID),
CONSTRAINT  PK_FilmGenres      PRIMARY KEY(filmID, genre),
CONSTRAINT  FK_FilmGenreID     FOREIGN KEY(filmID)	REFERENCES Film(filmID)
);
CREATE TABLE Rating (
filmID      INTEGER,
username    VARCHAR(30),
rating      INTEGER	NOT NULL,
INDEX   (username),
INDEX	(filmID),
CONSTRAINT  PK_Rating           PRIMARY KEY(filmID, username),
CONSTRAINT  FK_RatingUsername   FOREIGN KEY(username)	REFERENCES Account(username),
CONSTRAINT  FK_RatingFilmID     FOREIGN KEY(filmID)	REFERENCES Film(filmID)
);