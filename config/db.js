const mongoose = require("mongoose");

// connection URI
const mongoURI = "mongodb://localhost/ali-restaurant";

// remove deprecation warning of collection.ensureIndex
mongoose.set('useCreateIndex', true);

// connect to mongodb
mongoose.connect(mongoURI, {useNewUrlParser: true})

module.exports = mongoose;

