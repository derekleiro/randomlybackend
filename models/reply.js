const moongoose = require("mongoose");

const Reply = new moongoose.Schema({
	replyText: { type: String, required: true, maxlength: 320, minlength: 1 },
	timestamp: { type: Number, required: true },
	pid: { type: moongoose.Types.ObjectId, required: true },
	cid: { type: moongoose.Types.ObjectId, required: true },
	authorUID: { type: String, required: true },
	authorName: { type: String, required: true },
	authorPhotoURL: { type: String, required: true },
	likeCount: { type: Number, required: true },
	replyToUID: { type: String, required: true },
	replyToName: { type: String, required: true },
	replyType: { type: String, required: true },
});

module.exports = moongoose.model("Replie", Reply);
