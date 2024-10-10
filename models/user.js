const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
    },
});

/*line 13 is used because passport local mongoose by default will implement username,hashing ,
salting, hash password and we do not need to build it from scratch */
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);