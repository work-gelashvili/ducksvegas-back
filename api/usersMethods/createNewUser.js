const express = require("express");
const createNewUser = express.Router();
const pool = require("../pool");

createNewUser.post("/users", async (req, res) => {
  const nick = req.body.nick;
  const email = req.body.email;
  const password = req.body.password;
  let userId = +(new Date()).getTime();
  userId = userId - 1666000000000;

  pool.getConnection(async (err, connection) => {
    await connection;
    connection.query(
      `SELECT * FROM users WHERE email='${email}' || nickName='${nick}' || userId=${userId}`,
      (err, user) => {
        connection.release();
        if (err) throw err;

        let checkUser = JSON.stringify(user);
        checkUser = JSON.parse(checkUser);

        if (typeof checkUser[0] != 'undefined') {
          if (checkUser[0].nickName == nick) {
            res.send({
              errorCode: 10,
              errorDescription: "Duplicate nickname",
            });
          } else {
            res.send({
              errorCode: 10,
              errorDescription: "Duplicate email",
              userId: userId
            });
          }
        } else {
          pool.getConnection((errs, conn) => {
            conn.query(
              `INSERT INTO users(email, password, nickName, userId, favorites, gamesHistory, currency, balance, solanaWalletAddress, solanaTimeout, usdtTrc20Timeout, usdtErc20Timeout, usdtErc20WalletAddress, usdtTrc20WalletAddress) VALUE('${email}', '${password}', '${nick}', ${userId}, '{"data": []}', '{"data": []}', 'USDT', '0', '', '', '', '', '', '')`,
              (error, response) => {
                conn.release()
                if (error) {
                  console.log(error)
                }
                const resp = {
                  errorCode: 0,
                  success: true,
                  message: "User created successfully",
                };
                res.send(resp);
              }
            );
          })
        }
      }
    );
  });
});

module.exports = createNewUser;
