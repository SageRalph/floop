-- username
INSERT INTO Account (username) VALUES ('David');
INSERT INTO Account (username) VALUES ('Josh');
INSERT INTO Account (username) VALUES ('Ryan');
INSERT INTO Account (username) VALUES ('Tom');
-- title, trailer, watched
INSERT INTO Film (title, trailer, watched)  VALUES ('Terminator',           null,true);
INSERT INTO Film (title, trailer, watched)  VALUES ('The imitation game',   null,false);
INSERT INTO Film (title, trailer, watched)  VALUES ('Pans labrinth ',       'https://www.youtube.com/embed/O9Rdqm_74C0',false);
INSERT INTO Film (title, trailer, watched)  VALUES ('Prometheus & Alien',   'https://www.youtube.com/embed/xSNxqgUdPBI',true);
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