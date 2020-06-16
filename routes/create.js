const express = require("express");
const { check } = require("express-validator");

const Post = require("../controllers/create-controllers");

const router = express.Router();

router.post(
	"/create",
	[check("rawContent").not().isEmpty().isLength({ max: 320, min: 1 })],
	Post.create
);

module.exports = router;
