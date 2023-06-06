var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	givenName:String,
    familyName:String,
	password:String,
	email:String
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});
module.exports = mongoose.model("User",userSchema);