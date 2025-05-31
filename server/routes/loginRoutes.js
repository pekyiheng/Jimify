const { Router } = require("express");
var mysql = require('mysql2');
const db = require("../db");

const loginRouter = Router();

loginRouter.post("/", async (req, res) => {
    var {username, password} = req.body;
    var sqlStatement = `SELECT COUNT(*) AS count FROM Users 
                        WHERE username = ? AND password_hash = ?`;
    try {
        const [result] = await db.execute(sqlStatement, [username, password]);

        if (result[0].count == 0) {
            res.send("fail");
        } else {
            res.send("success");
        }
    }
    catch (e) {
        res.status(500).send("Error");
    }
    
    
});

module.exports = loginRouter;