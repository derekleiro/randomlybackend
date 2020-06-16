const admin = require("firebase-admin");
const { validationResult } = require("express-validator");
const moment = require("moment");

const HttpError = require("../models/http-error");
const Message = require("../models/message");
const ChatRoom = require("../models/chat-room");
const User = require("../models/user");

exports.send = async (req, res, next) => {
	const { uid, token, message, r_uid } = req.body;
	const errors = validationResult(req);

	if (
		uid &&
		token &&
		message &&
		r_uid &&
		errors.isEmpty() &&
		message.trim() !== ""
	) {
		let _uid = await admin
			.auth()
			.verifyIdToken(token)
			.then(async (decodedToken) => decodedToken.uid)
			.catch((e) => {
				const error = new HttpError("Invalid token", 401);
				return next(error);
			});

		if (uid === _uid) {
			let chatroom_exists;
			try {
				chatroom_exists = await ChatRoom.findOne({
					$or: [{ recieverUID: uid }, { senderUID: r_uid }],
					$or: [{ recieverUID: r_uid }, { senderUID: uid }],
				});
			} catch (e) {
				const error = new HttpError("Error retrieving chatroom", 500);
				return next(error);
			}

			if (chatroom_exists) {
				let new_message;
				try {
					new_message = new Message({
						chatRoomID: chatroom_exists._id,
						message,
						uid,
					});

					await new_message.save();
				} catch (e) {
					const error = new HttpError("Error creating message", 500);
					return next(error);
				}

				if (new_message) {
					try {
						await ChatRoom.findOneAndUpdate(
							{
								$or: [{ recieverUID: uid }, { senderUID: r_uid }],
								$or: [{ recieverUID: r_uid }, { senderUID: uid }],
							},
							{
								$inc: {
									senderUnread: chatroom_exists.senderUID === uid ? 0 : 1,
									recieverUnread: chatroom_exists.receiverUID === uid ? 0 : 1,
								},
								lastMessage: message,
								accepted: true,
							}
						);
					} catch (e) {
						const error = new HttpError("Error updating chatroom", 500);
						return next(error);
					}
				}
			} else {
				let sendersInfo;
				let receiversInfo;

				try {
					sendersInfo = await User.findOne({ uid });
					receiversInfo = await User.findOne({ uid: r_uid });
				} catch (e) {
					const error = new HttpError("Error retrieving users info", 500);
					return next(error);
				}

				if (receiversInfo && sendersInfo) {
					let new_chatroom;
					try {
						new_chatroom = new ChatRoom({
							senderUID: sendersInfo.uid,
							receiverUID: receiversInfo.uid,
							createdAt: Date.parse(moment.utc(Date.now()).format()),
							senderInfo: {
								profilePicture: sendersInfo.photoURL,
								profileName: sendersInfo.name,
							},
							recieverInfo: {
								profilePicture: receiversInfo.photoURL,
								profileName: receiversInfo.name,
							},
							lastMessage: message,
							senderUnread: 0,
							recieverUnread: 1,
							accepted: false,
						});

						await new_chatroom.save();
					} catch (e) {
						const error = new HttpError("Error saving chatroom", 500);
						return next(error);
					}

					if (new_chatroom) {
						let new_message;
						try {
                            new_message = new Message({
                                chatRoomID: chatroom_exists._id,
                                message,
                                uid,
                            });
        
                            await new_message.save();
                        } catch (e) {
                            const error = new HttpError("Error creating message", 500);
                            return next(error);
                        }
					}
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

exports.receive = async (req, res, next) => {};

exports.chatrooms = async (req, res, next) => {
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
			let chatrooms;
			try {
				chatrooms = await ChatRoom.find({
					$or: [{ recieverUID: uid }, { senderUID: uid }],
				});
			} catch (e) {
				const error = new HttpError("Error retrieving chatrooms", 500);
				return next(error);
			}

			if (chatrooms) {
				return res.json({ chatrooms });
			} else {
				return res.json({ Message: "User does not have chat rooms" });
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
