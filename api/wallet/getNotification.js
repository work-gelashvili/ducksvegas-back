const getNotifications = require("express").Router();
const pool = require("../pool");

getNotifications.get("/wallet/notifications/all", (req, res) => {
  pool.getConnection((err, conn) => {
    conn.query("SELECT * FROM notificationsLog WHERE Id!=0", (err, rows) => {
      conn.release();
      if (err) throw err;

      let data = JSON.stringify(rows);
      data = JSON.parse(data);
      res.send(data);
    });
  });
});

module.exports = getNotifications;
