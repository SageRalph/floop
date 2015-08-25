-- username
INSERT INTO Account (username, email, phone, studentNo) VALUES ('David','test@email.com','1234567890','687691');
INSERT INTO Account (username)  VALUES ('Josh');
INSERT INTO Account (username)  VALUES ('Ryan');
INSERT INTO Account (username)  VALUES ('Tom' );
-- title, trailer, watched
INSERT INTO Film (title, watched, trailer)  VALUES ('Pans labrinth ',       false,  'https://www.youtube.com/embed/O9Rdqm_74C0');
INSERT INTO Film (title, watched, trailer)  VALUES ('Prometheus & Alien',   true,   'https://www.youtube.com/embed/xSNxqgUdPBI');
INSERT INTO Film (title, watched)           VALUES ('Terminator',           true    );
INSERT INTO Film (title, watched)           VALUES ('The imitation game',   false   );
-- filmID, genre
INSERT INTO FilmGenre VALUES (1,'Action');
INSERT INTO FilmGenre VALUES (1,'Comedy');
INSERT INTO FilmGenre VALUES (2,'Action');
INSERT INTO FilmGenre VALUES (3,'Action');
INSERT INTO FilmGenre VALUES (4,'Horror');
-- filmID, username, rating
INSERT INTO Rating VALUES (1,	'David',4);
INSERT INTO Rating VALUES (1,	'Josh',	3);
INSERT INTO Rating VALUES (1,	'Ryan',	2);
INSERT INTO Rating VALUES (1,	'Tom',	1);
INSERT INTO Rating VALUES (2,	'David',0);
INSERT INTO Rating VALUES (2,	'Josh',	2);
INSERT INTO Rating VALUES (2,	'Ryan',	3);
INSERT INTO Rating VALUES (2,	'Tom',	5);
INSERT INTO Rating VALUES (3,	'Ryan',	3);
INSERT INTO Rating VALUES (3,	'Tom',	5);
INSERT INTO Rating VALUES (4,	'David',2);
INSERT INTO Rating VALUES (4,	'Tom',	3);
COMMIT;