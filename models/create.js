const mongoose = require("mongoose");

const usersLiked = new mongoose.Schema({
	uid: { type: String, required: true },
});

const noSee = new mongoose.Schema({
	uid: { type: String, required: true },
});

const saved = new mongoose.Schema({
	uid: { type: String, required: true },
});

const createPost = new mongoose.Schema({
	author: { type: String, required: true },
	profileURL: { type: String, required: true },
	uid: { type: String, required: true },
	content: { type: String, required: true, maxlength: 320, minlength: 1 },
	rawTime: { type: Number, required: true },
	likeCount: { type: Number, required: true },
	commentCount: { type: Number, required: true },
	likedBy: [usersLiked],
	noSee: [noSee],
	saved: [saved],
});

module.exports = mongoose.model("Post", createPost);
