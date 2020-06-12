const admin = require("firebase-admin");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const moment = require("moment");

const User = require("../models/user");
const Comment = require("../models/comment");
const Reply = require("../models/reply");
const Post = require("../models/create");
const HttpError = require("../models/http-error");
const Notification = require("../models/notification");

const shuffle = (array) => {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};

exports.comment = async (req, res, next) => {
	const { token, pid, uid, commentText, postUID } = req.body;
	const errors = validationResult(req);

	if (
		token &&
		pid &&
		uid &&
		commentText &&
		errors.isEmpty() &&
		postUID &&
		commentText.trim() !== "" &&
		mongoose.Types.ObjectId.isValid(pid)
	) {
		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError("Invalid token", 401);
				return next(error);
			});

		if (_uid === uid) {
			let user;
			let commentUserID;

			try {
				user = await User.findOne({ uid });
				commentUserID = await User.findOne({ uid: postUID });
			} catch (e) {
				const error = new HttpError("Error retrieving user", 500);
				return next(error);
			}

			let saveComment;
			let saveEditedPost;
			if (user) {
				try {
					const createdComment = new Comment({
						commentText,
						timestamp: Date.parse(moment.utc(Date.now()).format()),
						pid,
						authorUID: uid,
						authorName: user.name,
						authorPhotoURL: user.photoURL,
						hasReplies: false,
						replyCount: 0,
						likeCount: 0,
					});

					saveComment = await createdComment.save();

					if (saveComment) {
						const editPost = await Post.findOne({ _id: saveComment.pid });
						editPost.commentCount = editPost.commentCount + 1;
						saveEditedPost = await editPost.save();

						if (saveEditedPost) {
							if (uid !== postUID) {
								const new_notification = new Notification({
									notificationText: commentText,
									notificationUserID: uid,
									notificationUserInfo: {
										profilePicture: user.photoURL,
										profileName: user.name,
									},
									uid: postUID,
									interactedID: pid,
									interactedPost: {
										profilePicture: commentUserID.photoURL,
										profileName: commentUserID.name,
										postDate: editPost.rawTime,
										postContent: editPost.content,
									},
									notificationDate: Date.parse(moment.utc(Date.now()).format()),
									notificationType: "comment",
									new: true,
								});

								try {
									await new_notification.save();
								} catch (e) {
									const error = new HttpError(
										"Error saving the notification",
										500
									);
									return next(error);
								}
							}
						}
					}
				} catch (e) {
					const error = new HttpError("Error creating and saving comment", 500);
					return next(error);
				}
			} else {
				const error = new HttpError(
					"Could not find the associated user with the uid",
					404
				);
				return next(error);
			}

			if (saveComment && saveEditedPost) {
				console.log(saveComment);
				return res.status(201).json({
					message: "Comment was sent successfully",
					sent: true,
					comment: saveComment,
				});
			} else {
				return res.status(500).json({
					Error: "Comment was NOT sent successfully",
					sent: false,
				});
			}
		} else {
			const error = new HttpError("Unathorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Invalid request body", 422);
		return next(error);
	}
};

exports.reply = async (req, res, next) => {
	const {
		replyText,
		authorUID,
		replyingToUID,
		pid,
		cid,
		token,
		replyType,
		id,
	} = req.body;

	if (
		token &&
		pid &&
		cid &&
		replyText &&
		authorUID &&
		replyingToUID &&
		replyType &&
		id &&
		mongoose.Types.ObjectId.isValid(pid) &&
		mongoose.Types.ObjectId.isValid(cid)
	) {
		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError("Invalid token", 401);
				return next(error);
			});

		if (authorUID === _uid) {
			let author;
			let replyToAuthor;

			try {
				author = await User.findOne({ uid: authorUID });
				replyToAuthor = await User.findOne({ uid: replyingToUID });
			} catch (e) {
				const error = new HttpError("Error retrieving users", 500);
				return next(error);
			}

			let saveReply;
			let saveEditedComment;
			if (author && replyToAuthor) {
				const createdReply = new Reply({
					replyText,
					timestamp: Date.parse(moment.utc(Date.now()).format()),
					pid,
					cid,
					authorUID,
					authorName: author.name,
					authorPhotoURL: author.photoURL,
					likeCount: 0,
					replyToUID: replyingToUID,
					replyToName: replyToAuthor.name,
					replyType,
				});

				try {
					saveReply = await createdReply.save();

					if (saveReply) {
						const editComment = await Comment.findOne({ _id: saveReply.cid });
						editComment.hasReplies = true;
						editComment.replyCount = editComment.replyCount + 1;
						saveEditedComment = await editComment.save();

						if (saveEditedComment) {
							if (authorUID !== replyingToUID) {
								const new_notification = new Notification({
									notificationText: replyText,
									notificationUserID: authorUID,
									notificationUserInfo: {
										profilePicture: author.photoURL,
										profileName: author.name,
									},
									uid: replyingToUID,
									interactedID: id,
									interactedPost: {
										profilePicture: replyToAuthor.photoURL,
										profileName: replyToAuthor.name,
										postDate: editComment.timestamp,
										postContent: editComment.commentText,
									},
									notificationDate: Date.parse(moment.utc(Date.now()).format()),
									notificationType: "reply",
									new: true,
								});

								try {
									await new_notification.save();
								} catch (e) {
									const error = new HttpError(
										"Error saving the notification",
										500
									);
									return next(error);
								}
							}
						}
					}
				} catch (e) {
					const error = new HttpError("Error creating reply", 500);
					return next(error);
				}
			} else {
				const error = new HttpError("Could not find the requested users", 404);
				return next(error);
			}

			if (saveReply && saveEditedComment) {
				console.log(saveReply);
				return res.status(201).json({
					message: "Reply was sent successfully",
					sent: true,
					reply: saveReply,
				});
			} else {
				return res.status(500).json({
					Error: "Reply was NOT sent successfully",
					sent: false,
				});
			}
		} else {
			const error = new HttpError("Unathorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Invalid request body", 422);
		return next(error);
	}
};

exports.comments = async (req, res, next) => {
	const { token, pid, uid } = req.query;

	if (token && pid && uid && mongoose.Types.ObjectId.isValid(pid)) {
		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError("Invalid token", 401);
				return next(error);
			});

		if (_uid && uid) {
			let comments;
			let commentCount;
			try {
				comments = await Comment.find({ pid }).sort("-likeCount").limit(10);
				commentCount = await Comment.find({ pid }).countDocuments();
			} catch (e) {
				const error = new HttpError("Error fetching comments", 500);
				return next(error);
			}

			if (comments && commentCount) {
				return res.json({ comments: shuffle(comments), commentCount });
			} else {
				return res.json({ comments: [], commentCount });
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

exports.replies = async (req, res, next) => {
	const { uid, token, cid } = req.query;

	if (uid && token && cid && mongoose.Types.ObjectId.isValid(cid)) {
		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError("Invalid token", 401);
				return next(error);
			});

		if (uid && _uid) {
			let replies;

			try {
				replies = await Reply.find({ cid }).sort("timestamp").limit(5);
			} catch (e) {
				const error = new HttpError("Error fetching replies", 500);
				return next(error);
			}

			if (replies) {
				return res.json({ replies });
			} else {
				return res.json({ message: "No replies found for this comment" });
			}
		} else {
			const error = new HttpError("Unauthorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Inavlid request body", 422);
		return next(error);
	}
};
