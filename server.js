const express = require("express");
const app = express();

const db = require("./config/db");

// test db connection
db.connection.once('open', () => console.log("connected to db")).on("error", (err) => console.log("error connecting db -->", err))

const port = process.env.PORT || "4000";

// middleware to check for authentication state
const isAuthenticatedMiddleware = require('./middlewares/auth');

// parse json data sent from client
app.use(express.json())

// parse urlencoded data sent from client
app.use(express.urlencoded({ extended: true }));

app.use("/auth", require("./routes/auth"));

// protected route 
app.get("/", isAuthenticatedMiddleware, (req, res) => {
    res.send(res.locals.user);
})

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})