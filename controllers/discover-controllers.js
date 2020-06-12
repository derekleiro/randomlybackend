const admin = require("firebase-admin");

const User = require("../models/user");
const HttpError = require("../models/http-error");
const Notification = require("../models/notification");

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
		.catch(function (e) {
			const error = new HttpError("Invalid token", 401);
			return next(error);
		});

	let users;
	let notificationCount;
	if (_uid) {
		try {
			users = await User.find({}, "name photoURL bio interests -_id uid").limit(15);
			notificationCount = await Notification.find({uid: _uid, new: true}).countDocuments();
		} catch (e) {
			const error = new HttpError("Unable to fetch users", 500);
			return next(error);
		}

		if (users) {
			return res.status(200).json({users: shuffle(users), notificationCount});
		} else {
			const error = new HttpError("Could not find any users", 500);
			return next(error);
		}
	} else {
		const error = new HttpError("Unauthorized", 401);
		return next(error);
	}
};
