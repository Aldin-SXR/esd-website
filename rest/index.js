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

MongoClient.connect(Config.MONGODB_URI, (error, database) => {
    if (error) {
        console.log(error);
    }
    db = database;
    app.listen(Config.PORT, () => {
        console.log("Server listening on port: " + Config.PORT);
    })
});
