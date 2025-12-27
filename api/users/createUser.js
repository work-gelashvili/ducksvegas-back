const express = require("express");
const createUser = express.Router();
const pool = require("../pool");

createUser.post("/users/create", (req, res) => {
  const userId = req.body.userId;
  const balance = "0";
  const currency = req.body.currency;
  const walletId = req.body.walletId;

  pool.getConnection((err, conn) => {
    conn.query(
      `INSERT INTO wallet(userId, balance, currency, walletId) VALUES(${userId}, '${balance}', '${currency}', '${walletId}')`,
      (err, rows) => {
        conn.release();

        if (err) throw err;

        let data = JSON.stringify(rows);
        data = JSON.parse(data);

        res.json(data);
      }
    );
  });
});

module.exports = createUser;
