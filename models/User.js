const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const serverSecret = "izaan123";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    tokens: {
        type: Array,
        default: []
    }
})

UserSchema.methods.comparePassword = function (password) {
    const user = this;

    return bcryptjs.compare(password, user.password);
}

UserSchema.methods.generateToken = function () {
    const user = this;
    const { _id } = user;
    const token = jwt.sign({ _id }, serverSecret);

    user.tokens.push(token);

    return user.save().then(() => token)
}

UserSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;

    return new Promise(async (resolve, reject) => {
        try {
            decoded = jwt.verify(token, serverSecret);
        } catch (e) {
            reject(e)
        }

        if (decoded) {
            const user = await User.findOne({ _id: decoded._id, tokens: token })
                .catch(err => reject(err))

            if (!user) {
                reject({ message: "no user found" })
            }

            resolve(user)
        }
    })

}

UserSchema.statics.removeToken = function (token) {
    const User = this;
    decoded = jwt.verify(token, serverSecret);

    return User.findOneAndUpdate({ _id: decoded._id }, { $pull: { tokens: token } })
}

UserSchema.pre("save", function (next) {
    const user = this;

    if (user.isModified('password')) {
        bcryptjs.genSalt(10, (error, salt) => {
            bcryptjs.hash(user.password, salt, (error, hash) => {
                user.password = hash;
                next();
            })
        })
    }
    else {
        next();
    }
})

module.exports = mongoose.model("user", UserSchema);