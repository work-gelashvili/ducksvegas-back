const express = require("express");
const changePassword = express.Router();
const pool = require("../pool");

changePassword.put("/users/password", (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const sessionId = req.cookies.sessionID;

  origin =
    req.headers.origin == "http://localhost:5001"
      ? "http://localhost:5001"
      : "http://localhost:3000";

  // res.setHeader("Access-Control-Allow-Origin", origin);
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  // res.setHeader("Access-Control-Allow-Methods", "PUT");

  pool.getConnection((err, connection) => {
    connection.query(
      `UPDATE users SET password='${newPassword}' WHERE sessionId='${sessionId}'&&password='${oldPassword}'`,
      (err, rows) => {
        connection.release();
        if (err) throw err;

        let data = JSON.stringify(rows);
        data = JSON.parse(data);

        if (data.affectedRows == 0) {
          res.json({
            errorCode: 13,
            message: "Old password is not correct",
          });
        } else {
          res.json({
            errorCode: 0,
            message: "Password updated sucessfully",
          });
        }
      }
    );
  });
});

module.exports = changePassword;
