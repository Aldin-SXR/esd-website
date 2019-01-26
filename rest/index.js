const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const Config = require("./Config");

let db;
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

/**
 * Non-user endpoints
 */
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

app.get("/news/preview", (req, res) => {
    let start = parseInt(req.query.start);
    let limit = parseInt(req.query.limit);
    db.collection("news").find().skip(start).limit(limit).toArray((error, news) => {
        if (error) {
            throw error;
        }
        /* Match with authors */
        let categoryCounter = 0;
        let authorCounter = 0;
        news.forEach((info) => {
            db.collection("members").find({ _id: ObjectID(info.author_id) }, { _id: 1, name: 1 }).toArray((error, author) => {
                if (error) {
                    throw error;
                }
                info.author_name= author[0].name
                authorCounter++;
                // if (authorCounter == news.length && categoryCounter == news.length) {
                //     res.json(news);
                // }
            });
        });
        /* Match with categories */
        news.forEach((info) => {
            db.collection("news_categories").find({ _id: ObjectID(info.category_id) }, { _id: 1, name: 1 }).toArray((error, category) => {
                if (error) {
                    throw error;
                }
                info.category_name= category[0].name
                categoryCounter++;
                if (categoryCounter == news.length && authorCounter == news.length) {
                    /* Return count of all news */
                    db.collection("members").count({}, (error, numOfNews) => {
                        if (error) {
                            throw error;
                        }
                        res.json({
                            numOfNews: numOfNews,
                            news: news
                        });
                    })
                }
            });
        });
    });
});

app.get("/news_categories", (req, res) => {
    db.collection("news_categories").find().toArray((error, newsCategories) => {
        if (error) {
            throw error;
        }
        res.json(newsCategories);
    });
});

/**
 * Admin/user endpoints
 */
app.get("/admin/members/preview", (req, res) => {
    let start = parseInt(req.query.start);
    let limit = parseInt(req.query.limit);
    db.collection("members").find({}, { name: 1, department: 1, year: 1, member_since: 1, superuser: 1 }).skip(start).limit(limit).toArray((error, members) => {
        if (error) {
            throw error;
        }
        for (let i = 0; i < members.length; i++) {
             members[i].member_since = new Date((members[i].member_since).getHighBits() * 1000 ).toDateString();
        } 
        /* Return count of all members */
        db.collection("members").count({}, (error, numOfMembers) => {
            if (error) {
                throw error;
            }
            res.json({
                numOfMembers: numOfMembers,
                members: members
            });
        })
    });
});

app.post("/admin/news", (req, res) => {
    /* creating a new movie object in order to avoid adding uncessary fields later on */
    let article = {
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        author_id: req.body.author_id,
        category_id: req.body.category_id,
        published_at: new Date(),
        disable_comments: req.body.disable_comments
    }
    db.collection("news").insertOne(article, (error, result) => {
        if (error) {
            return console.log(error);
        }
        res.json(result.ops[0]);
    })
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
