const express = require("express");
require('dotenv').config();
const app = express();
const fatsecretRoutes = require('./routes/fatsecretRoutes');
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/api/fatsecret', fatsecretRoutes);


app.get("/", (req, res) => {
    res.json({weight : "62"})
});


const PORT = 8080;
app.listen(PORT, () => {
  console.log(`My first Express app - listening on port ${PORT}!`);
});