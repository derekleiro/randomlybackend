const admin = require("firebase-admin");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Post = require("../models/create");

exports.getPost = async (req, res, next) => {
	const pid = req.query.pid;
	const token = req.query.token;

	if (pid && token && mongoose.Types.ObjectId.isValid(pid)) {
		let _uid = admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError(
					"Could not find the uid of the token received",
					401
				);
				return next(error);
			});

		let post;
		if (_uid) {
			try {
				post = await Post.findOne({ _id: pid }, "-timestamp");
			} catch (e) {
				console.log(e);
				const error = new HttpError("Error retrieving post", 500);
				return next(error);
			}
		}

		if (post) {
			return res.json(post);
		} else {
			const error = new HttpError("Post does not exist", 404);
			return next(error);
		}
	} else {
		const error = new HttpError("Invalid request body", 422);
		return next(error);
	}
};
