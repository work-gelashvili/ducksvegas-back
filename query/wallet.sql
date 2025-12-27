CREATE TABLE wallet(Id INT(11) NOT NULL auto_increment PRIMARY KEY, userId INT(15) NOT NULL, balance VARCHAR(30) NOT NULL, currency VARCHAR(15) NOT NULL);
CREATE TABLE transactions(Id INT(11) NOT NULL auto_increment PRIMARY KEY, transactionId VARCHAR(155) NOT NULL, referenceTransactionId VARCHAR(155) NOT NULL, userId INT(15) NOT NULL);

INSERT INTO wallet(userId, balance, currency) VALUES(541258, '0,00', 'USD'), (457845, '0,00', 'USD'), (145278, '0,00', 'USD'), (785412, '0,00', 'USD')