const admin = require("firebase-admin");

const Post = require("../models/create");
const Notification = require("../models/notification");
const HttpError = require("../models/http-error");

exports.getFeed = async (req, res, next) => {
	const token = req.query.token;

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

	let _uid = await admin
		.auth()
		.verifyIdToken(token)
		.then(async (decodedToken) => decodedToken.uid)
		.catch((e) => {
			const error = new HttpError("Invalid token", 401);
			return next(error);
		});

	let feedPosts;
	let notificationCount;
	if (_uid) {
		try {
			feedPosts = await Post.find({"noSee.uid": { $ne: _uid }}, "-rawContent -timestamp -likedBy -noSee -saved").limit(15);
			notificationCount = await Notification.find({uid: _uid, new: true}).countDocuments();
		} catch (e) {
			const error = new HttpError("Couldn't retrieve feed", 500);
			return next(error);
		}

		if (feedPosts) {
			return res.status(200).json({feedPosts: shuffle(feedPosts), notificationCount});
		} else {
			const error = new HttpError("Could not find any posts", 404);
			return next(error);
		}
	} else {
		const error = new HttpError("Unauthorized", 401);
		return next(error);
	}
};
