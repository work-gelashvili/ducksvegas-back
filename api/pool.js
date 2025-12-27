const mysql = require("mysql");
const pool = mysql.createPool({
  host: "cp4.co.hostnodes.ge",
  user: "ophossdi_ducksvegas",
  password: "Kaikaco123.",
  database: "ophossdi_ducksvegas",
  multipleStatements: true,
  port: 3306,
});

module.exports = pool;
