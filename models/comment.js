const moongoose = require("mongoose");

const Comment = new moongoose.Schema({
	commentText: { type: String, required: true, maxlength: 320, minlength: 1 },
	timestamp: { type: Number, required: true },
	pid: { type: moongoose.Types.ObjectId, required: true },
	authorUID: { type: String, required: true },
	authorName: { type: String, required: true },
	authorPhotoURL: { type: String, required: true },
	hasReplies: { type: Boolean, required: true },
	replyCount: { type: Number, required: true },
	likeCount: { type: Number, required: true },
});

module.exports = moongoose.model("Comment", Comment);
