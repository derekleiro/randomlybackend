const moongoose = require("mongoose");

const Message = new moongoose.Schema({
	chatRoomID: { type: moongoose.Types.ObjectId, required: true },
	message: { type: String, required: true },
	uid: { type: String, required: true },
	timestamp: { type: Number, required: true },
});

module.exports = moongoose.model("Message", Message);
