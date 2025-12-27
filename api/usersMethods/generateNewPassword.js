const express = require("express");
const passwordResetLink = express.Router();
const pool = require("../pool");
const axios = require('axios');

passwordResetLink.put("/users/password/new", (req, res) => {

  const email = req.body.email;
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

  const newPassword = generateString(10);

  sql = `UPDATE users SET password='${newPassword}' WHERE email='${email}'`;

  pool.getConnection((err, connection) => {
    connection.query(sql, (err, rows) => {
      connection.release();

      if (err) throw err;

      let data = JSON.stringify(rows);
      data = JSON.parse(data);

      if (data.affectedRows > 0) {

        const emailData = JSON.stringify({
          "from": {
            "email": "no-reply@ducksvegas.com",
            "name": "Reset password"
          },
          "to": [
            {
              "email": email
            }
          ],
          "subject": "Reset password",
          "text": `Your new password is: ${newPassword}. Please change it after authorization from you profile.`,
          "category": "Reset password"
        });
        
        const config = {
          method: 'post',
          url: 'https://send.api.mailtrap.io/api/send',
          headers: { 
            'Authorization': 'Bearer 7f8a1263b7ee007ef0cc2845aa03ee64', 
            'Content-Type': 'application/json'
          },
          data : emailData
        };
        
        axios(config)
        .then(function () {
          console.log(`New password sent to ${email}`);
        })
        .catch(function (error) {
          console.log(error);
        });

        res.send({
          errorCode: 0,
          message: "Password changed",
        });
      } else {
        res.status(500)
        res.send({
          errorCode: 10,
          message: "User not found",
        });
      }
    });
  });
});

module.exports = passwordResetLink;
