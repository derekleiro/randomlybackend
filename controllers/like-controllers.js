const admin = require("firebase-admin");
const mongoose = require("mongoose");
const moment = require("moment");

const HttpError = require("../models/http-error");
const Post = require("../models/create");
const Notification = require("../models/notification");
const User = require("../models/user");

exports.like = async (req, res, next) => {
	if (
		req.body.token &&
		req.body.uid &&
		req.body.pid &&
		req.body.post_uid &&
		mongoose.Types.ObjectId.isValid(req.body.pid)
	) {
		const { token, uid, pid, post_uid } = req.body;

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
		let likedBy;
		let author;

		if (uid === _uid) {
			try {
				post = await Post.findOne(
					{
						_id: pid,
						"likedBy.uid": { $eq: uid },
					},
					"-likedBy -noSee"
				);
				likedBy = await Notification.findOne({
					uid: post_uid,
					interactedID: pid,
					notificationType: "liked-by",
				});
				author = await User.findOne({ uid });
			} catch (e) {
				console.log(e);
				const error = new HttpError(
					"Could not find the post of the pid or the likedBy document",
					404
				);
				return next(error);
			}

			console.log(likedBy)

			if (!post) {
				try {
					const update = await Post.findOneAndUpdate(
						{ _id: pid },
						{ $push: { likedBy: { uid } }, $inc: { likeCount: 1 } }
					);

					if (update && !likedBy && update.uid !== uid) {
						let replyToAuthor;
						try {
							replyToAuthor = await User.findOne({ uid: update.uid });
						} catch (e) {
							console.log(e);

							const error = new HttpError("User does nt exist", 404);
							return next(error);
						}

						const new_notification = new Notification({
							notificationText: `liked your post`,
							notificationUserID: uid,
							notificationUserInfo: {
								profilePicture: author.photoURL,
								profileName: author.name,
							},
							uid: update.uid,
							interactedID: pid,
							interactedPost: {
								profilePicture: replyToAuthor.photoURL,
								profileName: replyToAuthor.name,
								postDate: update.rawTime,
								postContent: update.content,
							},
							notificationDate: Date.parse(moment.utc(Date.now()).format()),
							notificationType: "liked-by",
							new: true,
							count: 0,
						});

						try {
							const saved = await new_notification.save();

							if (saved) {
								return res.json({ success: true });
							}
						} catch (e) {
							console.log(e);

							const error = new HttpError(
								"There was saving the like notification",
								500
							);
							return next(error);
						}
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
						{ $pull: { likedBy: { uid } }, $inc: { likeCount: -1 } }
					);

					if (update && likedBy && update.uid !== uid) {
						try {
							const new_notification = await Notification.findOneAndUpdate(
								{
									uid: post_uid,
									interactedID: pid,
									notificationType: "liked-by",
								},
								{
									$inc: { count: 1 },
									new: true,
									"notificationUserInfo.profileName": author.name,
									"notificationUserInfo.profilePicture": author.photoURL,
									notificationUserID: author.uid,
									notificationText: ` + `,
									notificationDate: Date.parse(moment.utc(Date.now()).format()),
								}
							);

							if (new_notification) {
								return res.json({ success: true });
							}
						} catch (e) {
							console.log(e);
							const error = new HttpError(
								"There was saving the like notification",
								500
							);
							return next(error);
						}
					}
				} catch (e) {
					console.log(e);

					const error = new HttpError("Could not update the post", 500);
					return next(error);
				}
			}
		} else {
			const error = new HttpError("Unauthorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Invalid request body", 422);
		return next(error);
	}
};
