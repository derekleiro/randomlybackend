const admin = require("firebase-admin");

const HttpError = require("../models/http-error");
const Notification = require("../models/notification");

exports.notifications = async (req, res, next) => {
	const { uid, token } = req.query;

	if (uid && token) {
		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError("Invalid token", 401);
				return next(error);
            });

		if (uid === _uid) {
            let notifications;
            try{
                notifications = await Notification.find({uid}, "-uid -notificationUserID -_id").sort("-notificationDate").limit(10);
            }catch(e){
                const error = new HttpError("Error fetching notifications", 500);
			    return next(error);
            }

            if(notifications){
                const updatedNotifications = await Notification.updateMany({uid}, {new: false});
                if(updatedNotifications){
                    return res.json({notifications});
                }
            }else{
                return res.json({Error: "No notifications found"})
            }

		} else {
			const error = new HttpError("Unathorized", 401);
			return next(error);
		}
	} else {
		const error = new HttpError("Invalid Query", 422);
		return next(error);
	}
};
