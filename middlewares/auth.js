const User = require("../models/User");

module.exports = async function (req, res, next) {
    const token = req.header('x-auth');

    if (token) {
        const user = await User.findByToken(token)
            .catch(err => { res.status(401).send(err) })

        if (user) {
            res.locals.user = user;
            next()
        }
    }
    else {
        res.status(401).send({ message: "not authorized" })
    }
}