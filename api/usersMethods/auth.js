const express = require("express");
const auth = express.Router();
const pool = require("../pool");

auth.post("/users/auth", (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  function generateString(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const sessionId = generateString(20);

  pool.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM users WHERE nickName='${userName}'`,
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

        if (data.length == 0 || data[0].nickName !== userName) {
          res.json({
            errorCode: 11,
            access: "danied",
            message: "Username is not correct",
          });
        } else if (data[0].password == password) {
          pool.getConnection((error, conn) => {
            conn.query(
              `UPDATE users SET sessionId='${sessionId}' WHERE nickName='${userName}'`,
              (error, row) => {
                conn.release();

                if (error) throw error;
              }
            );
          });

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
              type: data[0].type,
              sessionId: sessionId,
              userId: data[0].userId,
            },
          });
        } else {
          res.json({
            errorCode: 11,
            access: "danied",
            message: "Password is not correct",
          });
        }
      }
    );
  });
});

module.exports = auth;
