const mongoose = require("mongoose");
const admin = require("firebase-admin");

const HttpError = require("../models/http-error");
const Post = require("../models/create");

exports.save = async (req, res, next) => {
	if (
		req.body.token &&
		req.body.uid &&
		req.body.pid &&
		mongoose.Types.ObjectId.isValid(req.body.pid)
	) {
		const { token, uid, pid } = req.body;

		let _uid = await admin
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
		if (uid === _uid) {
			try {
				post = await Post.findOne(
					{
						_id: pid,
						"saved.uid": { $eq: uid },
					},
					"-likedBy -noSee -saved"
				);
			} catch (e) {
				const error = new HttpError("Could not find the post of the pid", 404);
				return next(error);
			}

			if (!post) {
				try {
					const update = await Post.findOneAndUpdate(
						{ _id: pid },
						{ $push: { saved: { uid } } }
					);

					if (update) {
						return res.json({ success: true });
					}
				} catch (e) {
					console.log(e);
					const error = new HttpError(
						"There was an error updating the like count",
						500
					);
					return next(error);
				}
			} else {
				try {
					const update = await Post.findOneAndUpdate(
						{ _id: pid },
						{ $pull: { saved: { uid } } }
					);

					if (update) {
						return res.json({ success: true });
					}
				} catch (e) {
					const error = new HttpError("Could not update the post", 500);
					return next(error);
				}
			}
		} else {
			const error = new HttpError("Unathorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Invalid request", 422);
		return next(error);
	}
};

exports.saves = async (req, res, next) => {
	const { token, uid } = req.query;

	if (token && uid) {
		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch(function (e) {
				console.log(e);
				const error = new HttpError(
					"Could not find the uid of the token received",
					401
				);
				return next(error);
			});

		let savedPosts;
		let savedPostsCount;
		if (uid === _uid) {
			savedPosts = await Post.find({ "saved.uid": { $eq: _uid } }, "-rawContent -timestamp -likedBy -noSee -saved")
				.sort("-rawTime") // TODO change to the saved array not post
				.limit(10);
			savedPostsCount = await Post.find({
				"saved.uid": { $eq: _uid },
			}).countDocuments();
		} else {
			const error = new HttpError("Unathorized", 401);
			return next(error);
		}

		if (savedPosts) {
            return res.json({ savedPosts, savedPostsCount });
		} else {
			return res.json({ message: "User doesn't have any saved posts", empty: true });
		}
	} else {
		const error = new HttpError("Invalid request", 422);
		return next(error);
	}
};
