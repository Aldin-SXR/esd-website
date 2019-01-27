const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("mongodb");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Config = require("./Config");

let db;
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", (req, res, next) => {
    /* Check for protected routes */
    if ((req.path).includes("private/")) {
        /* Check for the existence of auth header */
        let authHeader = req.get("Authorization");
        if (authHeader) {
            try {
                let token = authHeader.split("Bearer ")[1];
                jwt.verify(token, Config.JWT_SECRET, (error, decoded) => {
                    if (error) {
                        res.status(401).send({ message: "Unauthorized access: " + error.message });
                    } else {
                        //TODO: Improve JWT sessions.
                       next();
                    }
                });
            } catch (e) {
                res.status(401).send({ message: "Corrupted authorization header." });
            }
        } else {
            res.status(401).send({ message: "Missing authorization header." });
        }
        // 
        console.log(authHeader);
    } else {
        next();
    }
});

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

app.post("/login", (req, res) => {
    /* Check for empty data */
    if (!req.body.email_address || !req.body.password) {
        res.status(404).send({ message: "Invalid user credentials." });
        return;
    }
     db.collection("members").findOne({ email_address: req.body.email_address }, (error, user) => {
         if (error) {
             throw error;
         }
         /* Check whether an actual user has been found. */
         if (user) {
            /* Check for valid password */
            if (bcrypt.compareSync(req.body.password, user.password)) {
                res.json({
                    message: "Successfully authenticated.",
                    superuser: user.superuser,
                    token: jwt.sign({
                        _id: user._id, email_address: user.email_address, name: user.name, superuser: user.superuser
                    }, Config.JWT_SECRET)
                });
            } else {
                res.status(401).send({ message: "You have entered an invalid password." })
            }
            db.coll
         } else {
             res.status(404).send({ message: "This user does not exist." });
         }
     })
});

app.get("/leaders/short", (req, res) => {
    db.collection("members").find({ superuser: true }).toArray((error, members) => {
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
    /* Take optional category ID */
    let category_id = req.query.category_id;
    let query = { }
    if (category_id) {
        query = { category_id: category_id };
    }
    db.collection("news").find(query, { content: 0 }).skip(start).limit(limit).sort({ published_at: -1 }).toArray((error, news) => {
        if (error) {
            throw error;
        }
        if (!news.length) {
            res.json([ ]);
        }
        /* Match with authors */
        let categoryCounter = 0;
        let authorCounter = 0;
        news.forEach((info) => {
            db.collection("members").find({ _id: ObjectID(info.author_id) }, { _id: 1, name: 1, title: 1,  picture: 1}).toArray((error, author) => {
                if (error) {
                    throw error;
                }
                info.author_name = author[0].name;
                info.author_title = author[0].title;
                info.author_picture = author[0].picture;
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
                    db.collection("news").count(query, (error, numOfNews) => {
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

app.get("/news/:id", (req, res) => {
    db.collection("news").findOne({ _id: ObjectID(req.params.id) }, (error, news) => {
        if (error) {
            throw error;
        }
        res.json(news);
    });
});

app.delete("/private/news/:id", (req, res) => {
    db.collection("news").findAndRemove({ _id: ObjectID(req.params.id) }, (error, result) => {
        if (error) {
            return console.log(error);
        }
        if (result.value) {
           res.json({ success: true, message: "The article was successfully deleted." });
        } else {
            res.status(404).send({ status: "The article by the given ID was not found." });
        }
    })
});

app.get("/author/:id", (req, res) => {
    db.collection("members").findOne({ _id: ObjectID(req.params.id) }, (error, author) => {
        if (error) {
            throw error;
        }
        res.json(author);
    });
});

app.get("/category/:id", (req, res) => {
    db.collection("news_categories").findOne({ _id: ObjectID(req.params.id) }, (error, category) => {
        if (error) {
            throw error;
        }
        res.json(category);
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
app.get("/private/members/preview", (req, res) => {
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

app.post("/private/news", (req, res) => {
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

app.put("/private/news/:id", (req, res) => {
    delete req.body._id;
    /* Set a last edit date */
    req.body.last_edited_at = new Date();
    db.collection("news").findOneAndUpdate({ _id: ObjectID(req.params.id) }, { $set: req.body }, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.value) {
            res.json({ success: true, message: "Successfully updated the article." });
        } else {
            res.status(404).send({ status: "The article by the given ID was not found." });
        }
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
