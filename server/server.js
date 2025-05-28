const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.json({weight : "68"})
});


const PORT = 8080;
app.listen(PORT, () => {
  console.log(`My first Express app - listening on port ${PORT}!`);
});