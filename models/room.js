var mongoose = require("mongoose");

var roomSchema = new mongoose.Schema({
	_id:String,
    messages:[{
        _id: String,
        text:String,
        sender: String,
        senderId: String,
        messageType: Number, // 1- Text, 2-Product
        likes: [String],
        dislikes: Number
    }]
});

module.exports = mongoose.model("Room", roomSchema);