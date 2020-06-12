const mongoose = require("mongoose");

const Notification = new mongoose.Schema({
    notificationText: {type: String, required: true},
    notificationUserID: {type: String, required: true},
    notificationUserInfo:{
        profilePicture: {type: String, required: true},
        profileName: {type: String, required: true}
    },
    uid: {type: String, required: true},
    interactedID: {type: mongoose.Types.ObjectId, required: true},
    interactedPost: {
        profilePicture: {type: String, required: true},
        profileName: {type: String, required: true},
        postDate: {type: Number, required: true},
        postContent: {type: String, required: true}
    },
    notificationDate: {type: Number, required: true},
    notificationType: {type: String, required: true},
    new: {type: Boolean, required: true},
    count: {type: Number, required: false}
});

module.exports = mongoose.model("Notification", Notification);
