const express = require("express");
const gamesList = express.Router();
const axios = require("axios");

gamesList.get("/games/list", async (req, res) => {
  const limit = req.query.limit;
  const next = req.headers.next;

  const requestUrl =
    next == "undefined" || typeof next == "undefined"
      ? "https://web.ducksvegas.com/api/web/v2/casino-provider/games?clientId=dv-KUlURWR5hh"
      : next;
  axios
    .get(requestUrl, {
      headers: {
        accept: "application/vnd.api+json",
        sign: "73fbcd5ed9b6755c399a71bab938370b8aa42c964c8d3a869708f98dd1f35557",
      },
      params: {
        "per-page": limit,
        clientId: "dv-KUlURWR5hh",
      },
    })
    .then((resp) => {
      res.json(resp.data);
    })
    .catch((e) => {
      res.send(e);
    });
});

module.exports = gamesList;
