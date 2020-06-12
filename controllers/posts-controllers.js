const admin = require("firebase-admin");

const HttpError = require("../models/http-error");
const Post = require("../models/create");

exports.getMainUserPosts = async (req, res, next) => {
	const uid = req.query.u;
	const token = req.query.token;

	if (uid && token) {

		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError(
					"Could not find the uid of the token received", 404
				);
				return next(error);
			});

		let posts;
		let postCount;
		if (_uid === uid) {
			try {
				await Post.createIndexes({ uid: 1 });
				posts = await Post.find({ uid }, "-rawContent -timestamp -likedBy -noSee -saved").sort("-rawTime").limit(10);
				postCount = await Post.find({ uid }).countDocuments()
			} catch (e) {
				const error = new HttpError(
					"Couldn't find any posts for the requested user", 404
				);
				return next(error);
			}
		} else {
			const error = new HttpError("Unauthorized", 401);
			return next(error);
		}

		if (posts && postCount) {
			return res.json({ posts, postCount });
		} else {
			return res.json({ message: "User doesn't have posts", empty: true });
		}
	} else {
		const error = new HttpError("Request query did not include uid & token", 500);
		return next(error);
	}
};


exports.getUserPosts = async (req, res, next) => {
	const uid = req.query.u;
	const token = req.query.token;

	if (uid && token) {

		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch(function (e) {
				console.log(e);
				const error = new HttpError(
					"Could not find the uid of the token received", 404
				);
				return next(error);
			});

		let posts;
		if (_uid && uid) {
			try {
				await Post.createIndexes({ uid: 1 });
				posts = await Post.find({ uid }, "-rawContent -timestamp -likedBy -noSee -saved").sort("-rawTime").limit(10);
			} catch (e) {
				const error = new HttpError(
					"Couldn't find any posts for the requested user", 404
				);
				return next(error);
			}
		} else {
			const error = new HttpError("Unauthorized", 401);
			return next(error);
		}

		if (posts) {
			return res.json({ posts });
		} else {
			return res.json({ message: "User doesn't have posts", empty: true });
		}
	} else {
		const error = new HttpError("Request query did not include uid & token", 500);
		return next(error);
	}
};
