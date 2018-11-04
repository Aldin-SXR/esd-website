const express = require("express");

let port = process.env.PORT || 5000;
let app = express();

app.use(express.static("public"));

app.get("/news", (req, res) => {
    const news = [
        {
            image: "img/categories/1.jpg",
            title: "ESD Kick-Off Workshop",
            description: "Lorem ipsum dolor sit amet, consectetur.",
            date: "15/11/2018",
            authorName: "Lejla Imširović",
            authorImage: "img/authors/1.jpg",
            authorTitle: "President"
        },
        {
            image: "img/categories/2.jpg",
            title: "PCB Design Workshop",
            description: "Lorem ipsum dolor sit amet, consectetur.",
            date: "27/11/2018",
            authorName: "Džavid Isanović",
            authorImage: "img/authors/2.jpg",
            authorTitle: "Developer"
        },
        {
            image: "img/categories/3.jpg",
            title: "Raspberry Pi & IoT",
            description: "Lorem ipsum dolor sit amet, consectetur.",
            date: "30/11/2018",
            authorName: "Aldin Kovačević",
            authorImage: "img/authors/3.jpg",
            authorTitle: "Vice President"
        },
        {
            image: "img/categories/4.jpg",
            title: "ESP8266 Workshop",
            description: "Lorem ipsum dolor sit amet, consectetur.",
            date: "15/11/2018",
            authorName: "Džavid Isanović",
            authorImage: "img/authors/2.jpg",
            authorTitle: "Developer"
        },
        {
            image: "img/categories/5.jpg",
            title: "Collaboration with ACM Student Chapter",
            description: "Lorem ipsum dolor sit amet, consectetur.",
            date: "06/12/2018",
            authorName: "Aldin Kovačević",
            authorImage: "img/authors/3.jpg",
            authorTitle: "Vice President"
        },
        {
            image: "img/categories/6.jpg",
            title: "Line Follower Competition",
            description: "Lorem ipsum dolor sit amet, consectetur.",
            date: "06/12/2018",
            authorName: "Lejla Imširović",
            authorImage: "img/authors/1.jpg",
            authorTitle: "President"
        }
    ]
    res.json(news);
});

app.listen(port, () => {
    console.log("Server listening on port: " + port);
})
