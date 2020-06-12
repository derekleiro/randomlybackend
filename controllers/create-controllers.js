const { validationResult } = require("express-validator");
const admin = require("firebase-admin");
const moment = require("moment");

const Post = require("../models/create");
const User = require("../models/user");
const HttpError = require("../models/http-error");

exports.create = async (req, res, next) => {
	const { uid, rawContent, token } = req.body;
	const errors = validationResult(req);

	let _uid = await admin
		.auth()
		.verifyIdToken(token)
		.then(async (decodedToken) => decodedToken.uid)
		.catch((e) => {
			const error = new HttpError("Invalid token", 401);
			return next(error);
		});

	let user;
	try {
		if (_uid === uid) {
			user = await User.findOne({ uid: _uid });
		} else {
			const error = new HttpError("Unauthorized", 401);
			return next(error);
		}
	} catch (e) {
		const error = new HttpError(
			"Could not retrive user information for the given token",
			404
		);
		return next(error);
	}

	const sanitize = (content) => {
		if (content) {
			if (content.split(/\r\n|\r|\n/).length > 10) {
				const sanitized = content.replace(/(\r\n|\n|\r)/gm, "");
				return sanitized;
			} else {
				return content;
			}
		}
	};

	if (errors.isEmpty() && req.body.rawContent.trim() !== "") {
		if (user) {
			const createdPost = new Post({
				author: user.name,
				profileURL: user.photoURL,
				uid: user.uid,
				content: sanitize(rawContent),
				rawTime: Date.parse(moment.utc(Date.now()).format()),
				likeCount: 0,
				commentCount: 0,
			});

			try {
				const result = await createdPost.save();
				if (result) {
					console.log(result);
					res.status(201).json({
						message: "Post was sent successfully",
						sent: true,
					});
				}
			} catch (e) {
				const error = new HttpError("Post was not sent", 500);
				return next(error);
			}
		} else {
			res.status(404).json({
				message: "Could not retrive user information for the given token",
				sent: false,
			});
		}
	} else {
		const error = new HttpError("Invalid request body", 422);
		return next(error);
	}
};
