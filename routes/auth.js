const express = require("express");
const router = express.Router();
const User = require("../models/User");

// middleware to check for authentication state
const isAuthenticatedMiddleware = require('../middlewares/auth');

router.post('/register', (req, res) => {
    const { email, password } = req.body;
    const user = new User({ email, password })

    user.save()
        .then(user => res.status(200).send(user))
        .catch(err => res.status(400).send(err))
})

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
        .catch(err => {
            res.locals.error = err;
            next();
        })

    if (!user) {
        res.locals.error = { message: "no email found in db" };
        next();
    }

    const isAuthenticated = await user.comparePassword(password)
        .catch(err => {
            res.locals.error = err;
            next();
        })

    if (!isAuthenticated) {
        res.locals.error = { message: "not authenticated" };
        next();
    }

    const token = await user.generateToken();

    res.header("x-auth", token);
    res.send(user)
})

// protected route
router.post("/logout", isAuthenticatedMiddleware, (req, res) => {
    const token = req.header("x-auth");

    User.removeToken(token)
        .then(() => res.send("removed token"))
        .catch(err => res.send(err))
})

// Error handling middleware
router.use((req, res) => {
    const code = res.locals.statusCode || "400";
    const message = res.locals.error.message;

    res.status(code).send({ message })
})

module.exports = router;