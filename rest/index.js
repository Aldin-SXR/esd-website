const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const Config = require("./Config");

let db;
let app = express();

app.use(express.static("public"));

app.get("/news", (req, res) => {
    db.collection("news").find().toArray((error, news) => {
        if (error) {
            console.log(error);
        }
        res.json(news);
    })
})

app.get("/members/short", (req, res) => {
    db.collection("members").find().toArray((error, members) => {
        if (error) {
            throw error;
        }
        res.json(members);
    });
});

app.get("/awards", (req, res) => {
    db.collection("awards").find().toArray((error, awards) => {
        if (error) {
            throw error;
        }
        res.json(awards);
    });
});

MongoClient.connect(Config.MONGODB_URI, (error, database) => {
    if (error) {
        console.log(error);
    }
    db = database;
    app.listen(Config.PORT, () => {
        console.log("Server listening on port: " + Config.PORT);
    })
});
