const express = require("express");
const pool = require("../pool");
const getBalance = express.Router();
const cors = require("cors");

const app = express();

app.use(cors());

getBalance.post("/users/balance/getBalance", async (req, res) => {
  const userID = req.body.userId;
  const method = req.body.method;
  const currency = req.body.currency;
  const secret = req.headers.sign;

  var sha256 = function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = "length";
    var i, j; // Used as a counter across the whole file
    var result = "";

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    var hash = (sha256.h = sha256.h || []);

    var k = (sha256.k = sha256.k || []);
    var primeCounter = k[lengthProperty];

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += "\x80"; // Append Ƈ' bit (plus zero padding)
    while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00"; // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return; // ASCII check: only accept characters in range 0-255
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;

      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var i2 = i + j;

        var w15 = w[i - 15],
          w2 = w[i - 2];

        var a = hash[0],
          e = hash[4];
        var temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
          ((e & hash[5]) ^ (~e & hash[6])) + // ch
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
                0);

        var temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? 0 : "") + b.toString(16);
      }
    }
    return result;
  };

  function sortObjectRecursive(obj) {
    var keys = Object.keys(obj).sort();
    var sortedObject = {};
    keys.forEach((key) => {
      let value = obj[key];
      if (value instanceof Object || value instanceof Array) {
        sortedObject[key] = sortObjectRecursive(value);
      } else {
        sortedObject[key] = value;
      }
    });
    return sortedObject;
  }

  function implodeRecursive(obj, separator = "") {
    var str = "";

    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }

      let value = obj[key];
      if (value instanceof Object || value instanceof Array) {
        str += implodeRecursive(value, separator) + separator;
      } else {
        str += value + separator;
      }
    }

    return str.substring(0, str.length - separator.length);
  }

  let allParams = req.body;
  const SECRET_KEY = "AE1KtTf1vgjBSGgzJKGc6EsQ7dijUl5R";

  allParams = JSON.stringify(allParams);

  const paramString = allParams + SECRET_KEY;

  let sign = sha256(paramString);

  if (sign !== secret) {
    const response = {
      errorCode: 1,
      errorDescription: "Invalid signature",
    };
    res.json(response);

    return;
  } else {
    if (
      typeof userID == "undefined" ||
      typeof method == "undefined" ||
      typeof currency == "undefined"
    ) {
      const response = {
        errorCode: 4,
        errorDescription: "Invalid request params",
      };
      res.json(response);

      return;
    } else {
      pool.getConnection((err, connection) => {
        connection.query(
          `SELECT * FROM users WHERE userId=${userID}`,
          (err, rows) => {
            connection.release();

            if (err) throw err;

            let data = JSON.stringify(rows);
            data = JSON.parse(data);

            if (data.length === 0) {
              const response = {
                errorCode: 2,
                errorDescription: "Player not found",
              };

              res.json(response);

              return;
            } else {
              const balanceReceived = parseFloat(data[0].balance).toFixed(2);
              let balanceNow = JSON.stringify(balanceReceived);
              balanceNow = balanceNow.replace(".", "");
              const balanceInt = JSON.parse(balanceNow);
              const balanceLength = balanceInt.length;
              let USDTbalance = "00000000";
              const slicer = 8 - balanceLength;
              USDTbalance = USDTbalance.slice(0, slicer);
              USDTbalance = USDTbalance + balanceInt;
              const response = {
                balance: USDTbalance == "00000000" ? "00000001" : USDTbalance,
                errorCode: 0,
                errorDescription: "Completed successfully",
              };
              res.json(response);
            }
          }
        );
      });
    }
  }
});

module.exports = getBalance;
