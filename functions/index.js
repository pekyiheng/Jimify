const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const fatsecretRoutes = require("./routes/fatsecretRoutes");

const app = express();
/*
const allowedOrigins = [
  "jimify-a6795.web.app",
  "https://jimify-a6795.firebaseapp.com/",
];
*/

app.use(cors({origin: true}));

/*
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));
*/

app.use(express.json());
app.use("/fatsecret", fatsecretRoutes);

exports.api = functions.https.onRequest(app);
