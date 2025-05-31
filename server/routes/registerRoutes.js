const { Router } = require("express");
var mysql = require('mysql2');
const db = require("../db");

const registerRouter = Router();

registerRouter.post("/", async (req, res) => {
    var {username, password} = req.body;
    var sqlCheckExist = `SELECT COUNT(*) AS count FROM Users 
                        WHERE username = ?`;
    var sqlStatement = `INSERT INTO Users (username, password_hash)
                        VALUES (?,  ?)`;
    try {
        const [userExist] = await db.execute(sqlCheckExist, [username]);

        if (userExist[0].count == 0) {
            const [result] = await db.execute(sqlStatement, [username, password]);
            res.send("success");
        } else {
            res.send("user exist");
        }
        
    }
    catch (e) {
        res.send("Error");
    }
    
    
});

module.exports = registerRouter;