const express = require("express");
const notificationsPayout = express.Router();
const crypto = require("crypto");

notificationsPayout.post(
  "/payments/wallet/notifications/create-payout",
  (req, res) => {
    let requestBody = req.body;
    let userId = req.query.userId;
    const status = req.body.payment_status;
    const headerSign = req.headers["x-nowpayments-sig"];

    const SECRET_KEY = "4K1glPTx6z0mWJRSWPFl7z0krfFVIFnV"; // Your secret key

    const hmac = crypto.createHmac("sha512", SECRET_KEY);
    hmac.update(JSON.stringify(requestBody, Object.keys(requestBody).sort()));
    const signature = hmac.digest("hex");

    if (status == "finished" || status == " finished") {
      res.json({
        error: 0,
        message: "success",
      });
    } else {
      res.json({
        error: 1,
        message: "Signs are not equal",
      });
    }
  }
);

module.exports = notificationsPayout;
