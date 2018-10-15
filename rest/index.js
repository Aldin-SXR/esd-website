const express = require("express");

let port = process.env.PORT || 3000;
let app = express();

app.get("/", (req, res) => {
    res.status(200).send("God's blessing to this wonderful world.");
})

app.listen(port, () => {
    console.log("Server listening on port: " + port);
})
