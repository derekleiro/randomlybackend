const moongoose = require("mongoose");

const ChatRoom = new moongoose.Schema({
	senderUID: { type: String, required: true },
	receiverUID: { type: String, required: true },
	createdAt: { type: Number, required: true },
	senderInfo: {
		profilePicture: { type: String, required: true },
		profileName: { type: String, required: true },
	},
	receiverInfo: {
		profilePicture: { type: String, required: true },
		profileName: { type: String, required: true },
	},
	lastMessage: { type: String, required: true },
	senderUnread: { type: Number, required: true },
	receiverUnread: { type: Number, required: true },
	timestamp: { type: Number, required: true },
	accepted: { type: Boolean, required: true },
});

module.exports = moongoose.model("Chatroom", ChatRoom);
