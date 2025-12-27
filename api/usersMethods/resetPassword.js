const express = require("express");
const resetPassword = express.Router();
const pool = require("../pool");

resetPassword.put("/users/password/reset", (req, res) => {
  const nick = req.body.nickName;
  const password = req.body.password;

  pool.getConnection((err, connection) => {
    connection.query(
      `UPDATE users SET password='${password}' WHERE nickName='${nick}'`,
      (err, rows) => {
        connection.release();

        if (err) throw err;

        let data = JSON.stringify(rows);
        data = JSON.parse(data);

        res.json(data);
      }
    );
  });
});

module.exports = resetPassword;
