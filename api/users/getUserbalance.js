const express = require("express");
const pool = require("../pool");
const getUserBalance = express.Router();

getUserBalance.get("/users/balance", async (req, res) => {
  const sessionId = req.cookies.sessionID;

  origin =
    req.headers.origin == "http://localhost:5001"
      ? "http://localhost:5001"
      : "http://localhost:3000";

  // res.setHeader("Access-Control-Allow-Origin", origin);
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  // res.setHeader("Access-Control-Allow-Methods", "GET");

  pool.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM users WHERE sessionId='${sessionId}'`,
      (err, rows) => {
        connection.release();

        if (err) throw err;

        let data = JSON.stringify(rows);
        data = JSON.parse(data);

        if (data.length === 0) {
          const response = {
            errorCode: 2,
            errorDescription: "Player not found",
          };

          res.json(response);

          return;
        } else {
          const response = {
            balance: data[0].balance,
            errorCode: 0,
            errorDescription: "Completed successfully",
          };
          res.json(response);
        }
      }
    );
  });
});

module.exports = getUserBalance;
