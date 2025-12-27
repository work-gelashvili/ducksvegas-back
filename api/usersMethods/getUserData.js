const express = require("express");
const getUserData = express.Router();
const pool = require("../pool");

getUserData.get("/users", (req, res) => {
  const sessionID = req.cookies.sessionID;

  origin =
    req.headers.origin == "http://localhost:5001"
      ? "http://localhost:5001"
      : "http://localhost:3000";

  // res.setHeader("Access-Control-Allow-Origin", origin);
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  // res.setHeader("Access-Control-Allow-Methods", "GET");

  pool.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM users WHERE sessionId='${sessionID}'`,
      (err, rows) => {
        connection.release();

        if (err) {
          res.json({
            errorCode: 11,
            errorMessage: "Something unexpected happened",
          });
          throw err;
        }

        let data = JSON.stringify(rows);
        data = JSON.parse(data);

        if (data.length == 0) {
          res.json({
            errorCode: 11,
            access: "danied",
            message: "Session ID is not correct",
          });
        } else {
          res.json({
            errorCode: 0,
            message: "approved",
            data: {
              nick: data[0].nickName,
              name: data[0].name,
              surname: data[0].surname,
              emailIsVerified: data[0].emailIsVerified,
              phoneIsVerified: data[0].phoneIsVerified,
              ID_IsVerified: data[0].ID_cardIsVerified,
              userId: data[0].userId,
              type: data[0].type,
              phone: data[0].phone,
              zip: data[0].zipCode,
              gender: data[0].gender,
              country: data[0].country,
              city: data[0].city,
              birthday: data[0].dateOfBirth,
            },
          });
        }
      }
    );
  });
});

module.exports = getUserData;
