const generateWalletAddress = require("express").Router();
const pool = require("../pool");
const axios = require("axios");

generateWalletAddress.get("/payments/wallet/address/create", (req, res) => {
  origin =
    req.headers.origin == "http://localhost:5001"
      ? "http://localhost:5001"
      : "http://localhost:3000";

  // res.setHeader("Access-Control-Allow-Origin", origin);
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  // res.setHeader("Access-Control-Allow-Methods", "GET");
  const userId = req.query.userId;
  const currency = req.query.currency;
  const sessionId = req.cookies.sessionID;
  const walletName =
    req.query.currency == "usdttrc20"
      ? "usdtTrc20WalletAddress"
      : "solanaWalletAddress";
  const expire =
    req.query.currency == "usdttrc20" ? "usdtTrc20Timeout" : "solanaTimeout";

  const dateInMilliseconds = +new Date();
  const expiredDate = dateInMilliseconds + 86400000;

  pool.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM users WHERE sessionId='${sessionId}'`,
      (err, rows) => {
        connection.release();
        if (err) {
          res.send(err);
        }

        let data = JSON.stringify(rows);
        data = JSON.parse(data);

        if (typeof data[0] != 'undefined') {
          const isCreated =
            req.query.currency == "usdttrc20"
              ? data[0].usdtTrc20WalletAddress
              : data[0].solanaWalletAddress;
          let isExpired =
            req.query.currency == "usdttrc20"
              ? data[0].usdtTrc20Timeout
              : data[0].solanaTimeout;
          isExpired = parseInt(isExpired);

          if (isCreated == "" || isExpired < dateInMilliseconds) {
            axios
              .post(
                "https://api.nowpayments.io/v1/payment",

                {
                  price_amount: "20",
                  price_currency: "usd",
                  pay_currency: currency,
                  ipn_callback_url: `https://ducksvegas.com/payments/wallet/notifications/create-payment?userId=${userId}&currency=${currency}`,
                },
                {
                  headers: {
                    "x-api-key": "P4GTB85-P2Y4THQ-MZ7QFFA-ECZ5074",
                    "Content-Type": "application/json",
                  },
                }
              )
              .then((response) => {
                const newPayment = response.data;
                const paymentAddress = newPayment.pay_address;

                connection.query(
                  `UPDATE users SET ${walletName}='${paymentAddress}', currency='${currency}', ${expire}=${expiredDate} WHERE userId='${userId}'`,
                  (err, row) => {
                    if (err) throw err;

                    res.status(200)
                    res.json({
                      data: {
                        error: 0,
                        exist: false,
                        address: paymentAddress,
                        message: "Wallet address is generated",
                      },
                    });
                  }
                );
              })
              .catch((err) => res.json(err));
          } else {
            res.status(200)
            res.json({
              data: {
                error: 0,
                exist: true,
                address: isCreated,
                message: "Old wallet address is not used",
              },
            });
          }
        }else{
          res.status(403)
          res.json({
            error: 403,
            message: 'User is not authorized'
          })
        }
      }
    );
  });
});

module.exports = generateWalletAddress;
