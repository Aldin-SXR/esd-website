const express = require("express");

let port = process.env.PORT || 5000;
let app = express();

app.use(express.static("public"));

app.listen(port, () => {
    console.log("Server listening on port: " + port);
})
