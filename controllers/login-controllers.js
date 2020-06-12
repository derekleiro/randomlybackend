const moment = require("moment");

const User = require("../models/user");
const HttpError = require("../models/http-error");

exports.login = async (req, res, next) => {
	const uid = req.body.user.uid;
	const name = req.body.user.displayName;
	const email = req.body.user.email;
	const photoURL = req.body.user.photoURL;
	const providerID = req.body.user.providerData[0].providerId;

	const token = req.body.token;

	if (uid && name && email && photoURL && providerID && req.body && token) {
		let existingUser;

		try {
			existingUser = await User.findOne({ email: email });
		} catch (e) {
			const error = new HttpError("Unable to find existing user", 500);
			return next(error);
		}

		if (existingUser) {
			return res.json({
				message: "User already exists. Logging in...",
				success: true,
				token: token,
				user: existingUser,
			});
		} else {
			try {
				const createdUser = new User({
					uid,
					name,
					photoURL,
					email,
					providerID,
					bio: "",
					interests: "",
					createdAt: Date.parse(moment.utc(Date.now()).format()),
				});

				const result = await createdUser.save();
				if (result) {
					return res.status(201).json({
						message: "User was successfully created. Logging in...",
						success: true,
						token: token,
						user: result,
					});
				} else {
					return res.status(500).json({
						Error: "Something went wrong when creating user",
						success: false,
					});
				}
			} catch (e) {
				const error = new HttpError("Unable to create user", 500);
				return next(error);
			}
		}
	} else {
		return res
			.status(422)
			.json({ Error: "request body invalid", success: false });
	}
};
