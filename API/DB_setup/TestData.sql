
INSERT INTO Account (username, email, phone, studentNo) VALUES ('David','test@email.com','1234567890','687691');
INSERT INTO Account (username, phone)  VALUES ('Josh', '7425368748484');
INSERT INTO Account (username)  VALUES ('Ryan');
INSERT INTO Account (username)  VALUES ('Tom' );

INSERT INTO Film (title, watched, trailer)  VALUES ('Pans labrinth ',       false,  'https://www.youtube.com/embed/O9Rdqm_74C0');
INSERT INTO Film (title, watched, trailer)  VALUES ('Prometheus & Alien',   true,   'https://www.youtube.com/embed/xSNxqgUdPBI');
INSERT INTO Film (title, watched, progress) VALUES ('Community',            true,   'S6 E1');
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

INSERT INTO Food (itemName)  VALUES ('Chicken strips');
INSERT INTO Food (itemName)  VALUES ('Cheesecake');
INSERT INTO Food (itemName, NOTES)  VALUES ('Chips', 'Example of a note');

-- username, itemName, amount
INSERT INTO Stock VALUES ('Chips',      'Josh', 1);
INSERT INTO Stock VALUES ('Cheesecake', 'Josh', 1);
INSERT INTO Stock VALUES ('Cheesecake', 'Ryan', 3);
INSERT INTO Stock VALUES ('Cheesecake', 'David',1);

COMMIT;