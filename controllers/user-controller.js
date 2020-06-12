const admin = require("firebase-admin");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Notification = require("../models/notification");

exports.getMainUser = async (req, res, next) => {
	const uid = req.query.u;
	const token = req.query.token;

	if (token && uid) {
		let user;
		let notificationCount;

		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError(decodedToken.uid, 404);
				return next(error);
			});

		if (uid === _uid) {
			try {
				user = await User.findOne({ uid }, "name photoURL bio interests -_id");
				notificationCount = await Notification.find({
					uid: _uid,
					new: true,
				}).countDocuments();
			} catch (e) {
				const error = new HttpError(
					"There was an error retrieving user info",
					500
				);
				return next(error);
			}

			if (user) {
				return res.json({ user, notificationCount });
			} else {
				const error = new HttpError("User not found", 404);
				return next(error);
			}
		} else {
			const error = new HttpError("Unathorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Inavalid request query", 500);
		return next(error);
	}
};

exports.getUser = async (req, res, next) => {
	const uid = req.query.u;
	const token = req.query.token;

	if (token && uid) {
		let user;

		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError(decodedToken.uid, 404);
				return next(error);
			});

		if (uid && _uid) {
			try {
				user = await User.findOne({ uid }, "name photoURL bio interests -_id");
			} catch (e) {
				const error = new HttpError(
					"There was an error retrieving user info",
					500
				);
				return next(error);
			}

			if (user) {
				return res.json(user);
			} else {
				const error = new HttpError("User not found", 404);
				return next(error);
			}
		} else {
			const error = new HttpError("Unathorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Inavalid request query", 500);
		return next(error);
	}
};
