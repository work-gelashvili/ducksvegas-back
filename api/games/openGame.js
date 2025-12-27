const express = require("express");
const openGame = express.Router();
const axios = require("axios");
const FormData = require("form-data");

openGame.get("/games/launch", (req, res) => {
  const gameId = req.query.gameId;
  const currency = req.query.currency;
  const userId = req.query.userId;
  const isDemo = req.query.isDemo;

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

  // Step 1. Get the required data
  var allParams = {
    gameId: gameId,
    currency: "USDT",
    userId: userId,
  }; // Query parameters
  const SECRET_KEY = "Ws09WGCl2dSNfWtiJiyFvXS22TdbCm"; // Your secret key

  // Step 2. Delete the parameter 'clientId' from array with query parameters
  if (allParams.hasOwnProperty("clientId")) {
    delete allParams["clientId"];
  }

  // Step 3. Sort the parameters
  allParams = sortObjectRecursive(allParams);

  // Step 4. Concatenate the parameters into a string
  var paramString = implodeRecursive(allParams);

  // Step 5. Add a secret key to the string
  paramString = paramString + SECRET_KEY;

  // Step 6. Generate a signature using the SHA256 algorithm
  var sign = sha256(paramString);

  const params = new URLSearchParams();
  params.append("currency", "USDT");
  params.append("userId", userId);

  if (isDemo == "false") {
    axios
      .post(
        `https://web.ducksvegas.com/api/web/v2/casino-provider/games/${gameId}/session?clientId=dv-KUlURWR5hh`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/vnd.api+json",
            sign: sign,
          },
        }
      )
      .then((resp) => {
        res.send(resp.data);
      })
      .catch((resError) => {
        res.send(resError);
      });
  } else {
    axios
      .post(
        `https://web.ducksvegas.com/api/web/v2/casino-provider/games/${gameId}/session-demo?clientId=dv-KUlURWR5hh`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/vnd.api+json",
            sign: sign,
          },
        }
      )
      .then((resp) => {
        res.send(resp.data);
      })
      .catch((resError) => {
        res.send(resError);
      });
  }
});

module.exports = openGame;
