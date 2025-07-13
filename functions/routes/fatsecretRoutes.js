const express = require("express");
const router = express.Router();
const axios = require("axios");
const oAuthObj = require("oauth-1.0a");
const crypto = require("crypto");

const oauth = oAuthObj({
  consumer: {
    key: process.env.FATSECRET_CONSUMER_KEY,
    secret: process.env.FATSECRET_CONSUMER_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString, key) => crypto.createHmac("sha1", key)
      .update(baseString).digest("base64"),
});

router.get("/searchFood", async (req, res) => {
  const query = req.query.q;
  const url = "https://platform.fatsecret.com/rest/server.api";

  const apiParams = {
    method: "foods.search",
    format: "json",
    search_expression: query,
    oauth_signature_method: "HMAC-SHA1",
    region: "SG",
  };

  const requestData = {
    url: url,
    method: "GET",
    data: apiParams,
  };

  try {
    const authorization = oauth.authorize(requestData);

    const allQueryParams = {
      ...apiParams,
      oauth_consumer_key: authorization.oauth_consumer_key,
      oauth_nonce: authorization.oauth_nonce,
      oauth_signature: authorization.oauth_signature,
      oauth_timestamp: authorization.oauth_timestamp,
      oauth_version: authorization.oauth_version || "1.0",
    };

    const response = await axios({
      url: url,
      method: "GET",
      params: allQueryParams,
    });

    res.json(response.data["foods"]["food"].slice(0, 5));
  } catch (error) {
    console.error("Error searching food:", error.response ?
                                           error.response.data :
                                           error.message);
    res.status(error.response ?
               error.response.status :
               500)
        .send(error.response ? error.response.data : "Error searching food");
  }
});

module.exports = router;
