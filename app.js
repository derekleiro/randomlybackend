const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const admin = require("firebase-admin");

const feed_route = require("./routes/feed");
const discover_route = require("./routes/discover");
const create_route = require("./routes/create");
const comments_route = require("./routes/comment");
const login_route = require("./routes/login");
const user_route = require("./routes/user");
const posts_route = require("./routes/posts");
const like_route = require("./routes/like");
const post_route = require("./routes/post");
const save_route = require("./routes/save");
const notifications_route = require("./routes/notifications");

const HttpError = require("./models/http-error");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());

admin.initializeApp({
	credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT)),
});

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", process.env.SERVER); // In the second argument, you can limit it to your domain or set it to * for access by everyone
	res.setHeader("Access-Control-Allow-Method", "POST, GET, PUT, PATH, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

app.use(feed_route);
app.use(discover_route);
app.use(create_route);
app.use(comments_route);
app.use(login_route);
app.use(user_route);
app.use(posts_route);
app.use(like_route);
app.use(post_route);
app.use(save_route);
app.use(notifications_route);

app.use((req, res, next) => {
	const error = new HttpError("Could not find this route", 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}

	res
		.status(error.code || 500)
		.json({ Error: error.message || "An unkown error has occurred" });
});

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then((result) => {
		app.listen(5000, () => {
			console.log("Server is running at localhost:5000");
		});
	})
	.catch((e) => {
		console.log(e);
	});
