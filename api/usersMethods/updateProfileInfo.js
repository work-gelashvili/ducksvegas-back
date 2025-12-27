const express = require("express");
const updateProfileInfo = express.Router();
const pool = require("../pool");

updateProfileInfo.put("/users/:id", (req, res) => {
  const userID = req.params.id ? `userId=${req.params.id}` : "";
  const name = req.body.name ? ` name='${req.body.name}',` : "";
  const surname = req.body.surname ? ` surname='${req.body.surname}',` : "";
  const country = req.body.country ? ` country='${req.body.country}',` : "";
  const city = req.body.city ? ` city='${req.body.city}',` : "";
  const gender = req.body.gender ? ` gender='${req.body.gender}',` : "";
  const zip = req.body.zip ? ` zipCode='${req.body.zip}',` : "";
  const birthDate = req.body.birthDate
    ? ` dateOfBirth='${req.body.birthDate}',`
    : "";
  const email = req.body.email ? ` email='${req.body.email}',` : "";
  const phone = req.body.phone ? ` phone='${req.body.phone}',` : "";
  const nickname = req.body.nickname ? ` nickName='${req.body.nickname}',` : "";
  const personalID = req.body.personalID
    ? ` personalID='${req.body.personalID}',`
    : "";

  let sql = `UPDATE users SET${name}${surname}${country}${city}${gender}${zip}${birthDate}${email}${phone}${nickname}${personalID}`;
  sql = `${sql.slice(0, -1)} WHERE ${userID}`;

  pool.getConnection((err, connection) => {
    connection.query(sql, (err, rows) => {
      connection.release();

      if (err) throw err;

      let data = JSON.stringify(rows);
      data = JSON.parse(data);

      res.send(data);
    });
  });
});

module.exports = updateProfileInfo;
