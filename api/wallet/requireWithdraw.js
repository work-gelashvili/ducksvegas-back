const requireWithdraw = require("express").Router();
const { default: axios } = require("axios");
const pool = require("../pool");

requireWithdraw.put("/payments/wallet/withdraw", async (req, res) => {
  origin =
    req.headers.origin == "http://localhost:5001"
      ? "http://localhost:5001"
      : "http://localhost:3000";

  // res.setHeader("Access-Control-Allow-Origin", origin);
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  // res.setHeader("Access-Control-Allow-Methods", "PUT");

  const amount = req.body.amount;
  const userId = req.body.userId;
  const addressToPayout = req.body.address;
  const sessionId = req.cookies.sessionID;

  const formatMoney = (cash) => {
    cash = parseFloat(cash).toFixed(2);

    const decimalStr = cash.toString().split(".")[1];
    const integerStr = cash.toString().split(".")[0];

    return `${parseFloat(integerStr).toLocaleString()}.${decimalStr}`;
  };

  const config = {
    method: "get",
    url: `https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=sol&currency_to=usdttrc20`,
    headers: {
      "x-api-key": "P4GTB85-P2Y4THQ-MZ7QFFA-ECZ5074",
    },
  };

  let convert = "";

  try {
    convert = await axios(config);
  } catch {
    (err) => {
      console.log(err);
    };
  }

  pool.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM users WHERE sessionId='${sessionId}'`,
      async (err, rows) => {
        connection.release();

        if (err) throw err;

        let data = JSON.stringify(rows);
        data = JSON.parse(data);

        if (data.length == 1) {
          let roundedBalance = formatMoney(convert.data.estimated_amount);

          let checkWithdrawRequest =
            parseFloat(data[0].balance) - roundedBalance;

          if (checkWithdrawRequest >= 0) {
            const params = new URLSearchParams();
            params.append("email", "hello@ducksvegas.com");
            params.append("password", "DucksVegas2022");

            const response = await axios.post(
              "https://api.nowpayments.io/v1/auth",
              params
            );

            const token = response.data.token;

            let amountToPayout = parseFloat(amount);
            amountToPayout = amountToPayout.toFixed(6);

            const cpOptions = JSON.stringify({
              ipn_callback_url: `https://ducksvegas.com/payments/wallet/notifications/create-payout?userId=${userId}`,
              withdrawals: [
                {
                  address: addressToPayout,
                  currency: "sol",
                  amount: amountToPayout,
                  ipn_callback_url: `https://ducksvegas.com/payments/wallet/notifications/create-payout?userId=${userId}`,
                },
              ],
            });

            const cpConfig = {
              method: "post",
              url: "https://api.nowpayments.io/v1/payout",
              headers: {
                "x-api-key": "P4GTB85-P2Y4THQ-MZ7QFFA-ECZ5074",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              data: cpOptions,
            };

            axios(cpConfig)
              .then(function () {
                connection.query(
                  `UPDATE users SET balance='${checkWithdrawRequest}' WHERE userId=${userId}`,
                  (err, rows) => {
                    if (err) throw err;

                    res.json({
                      error: 0,
                      message: "Payout request sent",
                    });
                  }
                );
              })
              .catch(function () {
                res.send({
                  error: 15,
                  message: "something unexpected happened",
                });
              });
          } else {
            res.json({
              errorCode: 15,
              errorMessage: "Wrong amount required on withdraw",
            });
          }
        }else{
          res.json({
            error: 403,
            message: 'User is not authorized'
          })
        }
      }
    );
  });
});

module.exports = requireWithdraw;
