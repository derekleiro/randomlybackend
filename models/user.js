const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const user = new mongoose.Schema({
	uid: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	photoURL: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true, lowercase: true },
	providerID: { type: String, required: true },
	createdAt: { type: Number, required: true },
	interests: { type: String, required: false },
	bio: { type: String, required: false },
});

user.plugin(uniqueValidator);

module.exports = mongoose.model("User", user);
