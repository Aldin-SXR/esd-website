const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("mongodb");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const cors = require("cors");
const Config = require("./Config");

let db;
let app = express();
/* Set up mailing server */
const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: Config.MAIL_AUTH
});

app.use(cors({credentials: true, origin: true}));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
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
    } else {
        next();
    }
});

app.use((req, res, next) => {
    req.headers['if-none-match'] = 'no-match-for-this';
    next();
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

app.get("/members/alumni", (req, res) => {
    db.collection("members").find({ display_alumni: true }, { name: 1, currently_at: 1, department: 1 }).toArray((error, alumni) => {
        if (error) {
            console.log(error);
        }
        res.json(alumni);
    })
})

app.post("/login", (req, res) => {
    /* Check for empty data */
    if (!req.body.email_address || !req.body.password) {
        res.status(400).send({ message: "Invalid user credentials." });
        return;
    }
    db.collection("members").findOne({ email_address: req.body.email_address }, (error, user) => {
        if (error) {
            throw error;
        }
        /* Check whether an actual user has been found. */
        if (user) {
            /* Check if approved member */
            if (!user.approved_at) {
                res.status(401).send({ message: "Your membership has not been approved yet." });
                return;
            }
            /* Check for valid password */
            if (bcrypt.compareSync(req.body.password, user.password)) {
                res.json({
                    message: "Successfully authenticated.",
                    superuser: user.superuser,
                    token: jwt.sign({
                        _id: user._id, email_address: user.email_address, name: user.name, superuser: user.superuser
                    }, Config.JWT_SECRET, { expiresIn: "1d" })
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

app.post("/register", (req, res) => {
    /* Check for empty data */
    if (!req.body.email_address || !req.body.password || !req.body.name) {
        res.status(400).send({ message: "Invalid registration data." });
        return;
    }
    /* creating a new member object in order to avoid adding uncessary fields later on */
    let member = {
        name: req.body.name,
        email_address: req.body.email_address,
        password: bcrypt.hashSync(req.body.password, 10),
        department: req.body.department,
        year: req.body.year,
        registered_at: new Date(),
        currently_at: req.body.currently_at,
        display_alumni: req.body.display_alumni
    }
    if (req.body.currently_at) {
        member.currently_at = req.body.currently_at;
    }
    if (req.body.display_alumni) {
        member.display_alumni = req.body.display_alumni;
    }
    /* Check for duplicates */
    db.collection("members").findOne({ email_address: req.body.email_address }, { email_address: 1 }, (error, user) => {
        if (error) {
            throw error;
        }
        if (user) {
            res.status(400).send({ message: "A member with this email address already exists." });
        } else {
            db.collection("members").insertOne(member, (error, result) => {
                if (error) {
                    throw error;
                }
                res.json({ success: true, message: "An administrator should approve your membership shortly." });
            })
        }
    });
});

app.put("/private/profile/:id", (req, res) => {
    delete req.body._id;
    db.collection("members").findOneAndUpdate({ _id: ObjectID(req.params.id) }, { $set: req.body }, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.value) {
            res.json({ success: true, message: "Successfully updated your profile." });
        } else {
            res.status(404).send({ status: "The member by the given ID was not found." });
        }
    });
});

app.put("/private/profile/:id/password", (req, res) => {
    delete req.body._id;
    if (!req.body.old || req.body.old == '') {
        res.status(404).send({ message: 'The password cannot be empty.' });
    }
    db.collection('members').findOne({ _id: ObjectID(req.params.id) }, (error, result) => {
        if (bcrypt.compareSync(req.body.old, result.password)) {
            if (!req.body.new || req.body.new == '') {
                res.status(404).send({ message: 'The password cannot be empty.' });
            }
            db.collection('members').updateOne({ _id: ObjectID(req.params.id) }, { $set: { password: bcrypt.hashSync(req.body.new, 10) } }, (error, result) => {
                res.json({ success: true, message: 'You have succesfully changed your password.' })
            });
        } else {
            res.status(403).send({ message: 'The old password is incorrect.' }); 
        }
    });
});

app.post("/contact", (req, res) => {
    /* Check for empty data */
    if (!req.body.email_address || !req.body.message || !req.body.name) {
        res.status(400).send({ message: "Invalid contact data." });
        return;
    }

    /* Set up mail */
    let mailOptions = {
        from: "no-reply@esdclub.com",
        to: Config.MAILING_LIST.concat(Config.MAIL_AUTH.user),
        subject: "IBU ESD | New message from contact form",
        html:  "<b>Name: </b>" + req.body.name + "<br><b>Email address: </b>" + req.body.email_address + "<br><b>Subject: </b>" + 
        req.body.subject + "<br><hr><em>Message: </em><br>" + req.body.message
    }

    /* Send mail */
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(400).send({ message: "Unkown mailing error." });
            throw error;
        }
        /* Save message for future use */
        db.collection("contact_messages").insertOne(req.body, (error, result) => {
            if (error) {
                throw error;
            }
            res.json({ success: true, message: "Message successfully sent." });
        });
        // console.log("Email sent: " + info.response);
    });
});

app.get("/leaders/short", (req, res) => {
    db.collection("members").find({ superuser: true }, { email_address: 0, password: 0 }).toArray((error, members) => {
        if (error) {
            throw error;
        }
        res.json(members);
    });
});

app.get("/private/profile/:id", (req, res) => {
    db.collection("members").findOne({ _id: ObjectID(req.params.id)},  { password: 0 }, (error, member) => {
        if (error) {
            throw error;
        }
        res.json(member);
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
    let query = {}
    if (category_id) {
        query = { category_id: ObjectID(category_id) };
    }
    db.collection("news").aggregate([
        { $match: query },
        { $project: { content: 0 } },
        { $lookup: {
            from: 'members',
            localField: 'author_id',
            foreignField: '_id',
            as: 'author'
        } },
        { $lookup: {
            from: 'news_categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
        } },
        { $unwind: '$author' },
        { $unwind: '$category' },
        { $sort: { published_at: -1 } },
        { $skip: start },
        { $limit: limit },
        { $project: {
            'title': 1, 'description': 1, 'author_id': 1, 'category_id': 1, 'published_at': 1, 'disable_comments': 1, 'image': 1,
            'last_edited_at': 1, 'author_name': '$author.name', 'author_title': '$author.title', 'author_picture': '$author.picture', 
            'category_name': '$category.name'
        } }
    ]).toArray((error, news) => {
        let c = 0;
        /* Return count of all news */
        db.collection("news").count(query, (error, numOfNews) => {
            if (error) {
                throw error;
            }
            res.json({
                numOfNews: numOfNews,
                news: news
            });
            return;
        })
    });
});

app.get("/events/preview", (req, res) => {
    let start = parseInt(req.query.start);
    let limit = parseInt(req.query.limit);
    /* Take optional category ID */
    let category_id = req.query.category_id;
    let completed = parseInt(req.query.completed);
    let query = { completed: completed }
    if (category_id) {
        query.category_id =  ObjectID(category_id);
    }
    db.collection("events").find(query, { }).skip(start).limit(limit).sort({ start_date: -1 }).toArray((error, events) => {
        if (error) {
            throw error;
        }
        if (!events.length) {
            res.json([]);
        }
        let categoryCounter = 0;
        /* Match with categories */
        events.forEach((event) => {
            db.collection("event_categories").find({ _id: ObjectID(event.category_id) }, { _id: 1, name: 1 }).toArray((error, category) => {
                if (error) {
                    throw error;
                }
                event.category_name = category[0].name
                event.num_participants = event.enrolled_members.length;
                categoryCounter++;
                if (categoryCounter == events.length) {
                    /* Return count of all news */
                    db.collection("events").count(query, (error, numOfEvents) => {
                        if (error) {
                            throw error;
                        }
                        res.json({
                            numOfEvents: numOfEvents,
                            events: events
                        });
                    })
                }
            });
        });
    });
});

app.get("/events/:id", (req, res) => {
    db.collection("events").findOne({ _id: ObjectID(req.params.id) }, (error, event) => {
        if (error) {
            throw error;
        }
        res.json(event);
    });
});

app.post("/private/events", (req, res) => {
    /* creating a new movie object in order to avoid adding uncessary fields later on */
    let event = {
        title: req.body.title,
        description: req.body.description,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date),
        category_id: ObjectID(req.body.category_id),
        enrolled_members: [ ],
        banner: req.body.banner,
        completed: 0
    }
    db.collection("events").insertOne(event, (error, result) => {
        if (error) {
            return console.log(error);
        }
        res.json(result.ops[0]);
    })
});

app.put("/private/events/:id", (req, res) => {
    delete req.body._id;
    db.collection("events").findOneAndUpdate({ _id: ObjectID(req.params.id) }, { $set: req.body }, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.value) {
            res.json({ success: true, message: "Successfully updated the event." });
        } else {
            res.status(404).send({ status: "The event by the given ID was not found." });
        }
    });
});

app.delete("/private/events/:id", (req, res) => {
    db.collection("events").findAndRemove({ _id: ObjectID(req.params.id) }, (error, result) => {
        if (error) {
            return console.log(error);
        }
        if (result.value) {
            res.json({ success: true, message: "The event was successfully deleted." });
        } else {
            res.status(404).send({ status: "The event by the given ID was not found." });
        }
    })
});


app.get("/event_categories", (req, res) => {
    db.collection("event_categories").find().toArray((error, eventCategories) => {
        if (error) {
            throw error;
        }
        res.json(eventCategories);
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

app.put("/private/events/:id/apply", (req, res) => {
    delete req.body._id;
    db.collection("events").findOneAndUpdate({ _id: ObjectID(req.params.id) }, { $addToSet: { enrolled_members: req.body.member_name } }, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.value) {
            res.json({ success: true, message: "Successfully applied for the event." });
        } else {
            res.status(404).send({ status: "The event by the given ID was not found." });
        }
    });
});

app.post("/private/events/applications", (req, res) => {
    db.collection("events").find({ }, { _id: 1, title: 1, enrolled_members: 1 }).toArray((error, events) => {
        if (error) {
            throw error;
        }
        let eventList = [ ];
        events.forEach(event => {
            if (event.enrolled_members && event.enrolled_members.length) {
                for (let i = 0; i < event.enrolled_members.length; i++) {
                    if (event.enrolled_members[i] == req.body.member_name) {  
                        eventList.push({
                            _id: event._id,
                            title: event.title
                        });
                        break;
                    }
                }
            }
        });
        res.json(eventList);
    });
});

app.put("/private/events/:id/cancel", (req, res) => {
    delete req.body._id;
    db.collection("events").findOneAndUpdate({ _id: ObjectID(req.params.id) }, { $pull: { enrolled_members: req.body.member_name } }, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.value) {
            res.json({ success: true, message: "Successfully cancelled event application." });
        } else {
            res.status(404).send({ status: "The event by the given ID was not found." });
        }
    });
});

app.post("/private/events/:id/check_application", (req, res) => {
    db.collection("events").findOne({ _id: ObjectID(req.params.id) }, (error, event) => {
        if (error) {
            throw error;
        }
        if (event.enrolled_members && event.enrolled_members.length) {
            for (let i = 0; i < event.enrolled_members.length; i++) {
                if (event.enrolled_members[i] == req.body.member_name) {
                    res.json({ enrolled: true });
                    return;
                }
            }
        }
        res.json({ enrolled: false });
    });
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

app.get("/event_category/:id", (req, res) => {
    db.collection("event_categories").findOne({ _id: ObjectID(req.params.id) }, (error, category) => {
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
app.get("/private/members/approved", (req, res) => {
    let start = parseInt(req.query.start);
    let limit = parseInt(req.query.limit);
    db.collection("members").find({ approved_at: { $exists: true } }, { name: 1, department: 1, year: 1, approved_at: 1, currently_at: 1, superuser: 1 }).skip(start).limit(limit).toArray((error, members) => {
        if (error) {
            throw error;
        }
        // for (let i = 0; i < members.length; i++) {
        //     members[i].member_since = new Date((members[i].member_since).getHighBits() * 1000).toDateString();
        // }
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

app.get("/private/members/pending", (req, res) => {
    db.collection("members").find({ approved_at: { $exists: false } }, { name: 1, department: 1, year: 1}).toArray((error, members) => {
        if (error) {
            throw error;
        }
        res.json(members);
    });
});

app.put("/private/members/approve/:id", (req, res) => {
    db.collection("members").findOneAndUpdate({ _id: ObjectID(req.params.id) }, { $set: { approved_at: new Date() } }, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.value) {
            /* Set up mail */
            let mailOptions = {
                from: "no-reply@esdclub.com",
                to: result.value.email_address,
                subject: "IBU ESD | Membership approved",
                html: `Hello, ${result.value.name}, and thank you for taking an interest in IBU Embedded System Design Electronics Club. <br /> 
                    Your membership has been approved, and you can now log in and enjoy member benefits.`
            }

            /* Send mail */
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(400).send({ message: "Unkown mailing error." });
                    throw error;
                }
                res.json({ success: true, message: "Membership successfully approved." });
            });
        } else {
            res.status(404).send({ status: "The member by the given ID was not found." });
        }
    });
});

app.delete("/private/members/:id", (req, res) => {
    db.collection("members").findAndRemove({ _id: ObjectID(req.params.id) }, (error, result) => {
        if (error) {
            throw error;
        }
        if (result.value) {
            res.json({ success: true, message: "Membership successfully revoked." });
        } else {
            res.status(404).send({ status: "The member by the given ID was not found." });
        }
    })
});

app.post("/private/news", (req, res) => {
    /* creating a new movie object in order to avoid adding uncessary fields later on */
    let article = {
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        image: req.body.image,
        author_id: ObjectID(req.body.author_id),
        category_id: ObjectID(req.body.category_id),
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
    req.body.author_id = ObjectID(req.body.author_id);
    req.body.category_id =ObjectID(req.body.category_id);
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

app.get("/private/members/approved/count", (req, res) => {
    db.collection("members").count({approved_at: { $exists: true }}, (error, count) => {
        if (error) {
            throw error;
        }
        res.json({ count: count });
    });
});

app.get("/private/members/pending/count", (req, res) => {
    db.collection("members").count({approved_at: { $exists: false }}, (error, count) => {
        if (error) {
            throw error;
        }
        res.json({ count: count });
    });
});

app.get("/private/news/count", (req, res) => {
    db.collection("news").count({ }, (error, count) => {
        if (error) {
            throw error;
        }
        res.json({ count: count });
    });
});

app.get("/private/events/count", (req, res) => {
    db.collection("events").count({ completed: 0 }, (error, count) => {
        if (error) {
            throw error;
        }
        res.json({ count: count });
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
