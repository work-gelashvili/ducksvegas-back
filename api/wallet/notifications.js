const express = require("express");
const notifications = express.Router();
const crypto = require("crypto");
const pool = require("../pool");
const axios = require("axios");

notifications.post(
  "/payments/wallet/notifications/create-payment",
  async (req, res) => {
    let requestBody = req.body;
    const userId = req.query.userId;
    const headerSign = req.headers["x-nowpayments-sig"];
    const currency = req.query.currency;
    const date = new Date();
    let now = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`;

    const SECRET_KEY = "4K1glPTx6z0mWJRSWPFl7z0krfFVIFnV"; // Your secret key

    const formatMoney = (cash) => {
      cash = parseFloat(cash).toFixed(2);

      const decimalStr = cash.toString().split(".")[1];
      const integerStr = cash.toString().split(".")[0];

      return `${parseFloat(integerStr).toLocaleString()}.${decimalStr}`;
    };

    const hmac = crypto.createHmac("sha512", SECRET_KEY);
    hmac.update(JSON.stringify(requestBody, Object.keys(requestBody).sort()));
    const signature = hmac.digest("hex");

    if (headerSign == signature && requestBody.actually_paid != 0) {
      pool.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM payments WHERE paymentId='${requestBody.payment_id}'`,
          (err, paymentsRow) => {
            connection.release();

            if (err) throw err;

            let paymentsData = JSON.stringify(paymentsRow);
            paymentsData = JSON.parse(paymentsData);

            if (paymentsData.length > 0) {
              console.log(
                `resend: paymentID ${paymentsData[0].paymentId} userID ${userId}`
              );
              res.json({
                error: 1,
                message: "Payment already in progress",
              });
            } else {
              connection.query(
                `SELECT * FROM users WHERE userId='${userId}'`,
                (err, rows) => {
                  if (err) throw err;

                  let data = JSON.stringify(rows);
                  data = JSON.parse(data);

                  const config = {
                    method: "get",
                    url: `https://api.nowpayments.io/v1/estimate?amount=${requestBody.actually_paid}&currency_from=sol&currency_to=usdttrc20`,
                    headers: {
                      "x-api-key": "P4GTB85-P2Y4THQ-MZ7QFFA-ECZ5074",
                    },
                  };

                  if (currency == "sol") {
                    axios(config)
                      .then((convert) => {
                        const currentBalance = parseFloat(data[0].balance);
                        const paid = parseFloat(convert.data.estimated_amount);

                        let balance = currentBalance + paid;

                        balance = formatMoney(balance);

                        if (currentBalance == balance) {
                          res.json({
                            error: 0,
                            message: "waitting",
                          });
                        } else {
                          connection.query(
                            `INSERT INTO payments(paymentId, userId, actuallyPaid) VALUES('${requestBody.payment_id}', '${userId}', '${requestBody.actually_paid}')`,
                            (err, row) => {
                              if (err) {
                                console.log(
                                  `${err} ${requestBody.payment_id} ${now}`
                                );
                                throw err;
                              }

                              connection.query(
                                `UPDATE users SET balance='${balance}', walletId='Empty', solanaWalletAddress='' WHERE userId='${userId}'`,
                                (err, rows) => {
                                  if (err) {
                                    console.log(
                                      `${err} ${requestBody.payment_id} ${now}`
                                    );
                                    throw err;
                                  }

                                  console.log(
                                    `${now} ${balance} ${requestBody.payment_id} ${requestBody.actually_paid}`
                                  );

                                  res.json({
                                    error: 0,
                                    message: "success",
                                  });
                                }
                              );
                            }
                          );
                        }
                      })
                      .catch((err) => {
                        console.log(`${err} ${requestBody.payment_id}`);
                        throw err;
                      });
                  } else {
                    const currentBalance = parseFloat(data[0].balance);
                    const paid = requestBody.actually_paid;

                    let balance = currentBalance + paid;

                    balance = formatMoney(balance);

                    if (currentBalance == balance) {
                      res.json({
                        error: 0,
                        message: "waitting",
                      });
                    } else {
                      connection.query(
                        `INSERT INTO payments(paymentId, userId, actuallyPaid) VALUES('${requestBody.payment_id}', '${userId}', '${requestBody.actually_paid}')`,
                        (err, row) => {
                          if (err) {
                            console.log(`${err} ${requestBody.payment_id}`);
                            throw err;
                          }

                          connection.query(
                            `UPDATE users SET balance='${balance}', walletId='Empty', usdtTrc20WalletAddress='' WHERE userId='${userId}'`,
                            (err, rows) => {
                              if (err) throw err;

                              console.log(
                                `${now} ${balance} ${requestBody.payment_id} ${requestBody.actually_paid}`
                              );

                              res.json({
                                error: 0,
                                message: "success",
                              });
                            }
                          );
                        }
                      );
                    }
                  }
                }
              );
            }
          }
        );
      });
    } else {
      res.json({
        error: 1,
        message: "Signs are not equal",
      });
    }
  }
);

module.exports = notifications;
