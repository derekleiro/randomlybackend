const express = require("express");
const { check } = require("express-validator");

const send = require("../controllers/comment-controllers");
const get = require("../controllers/comment-controllers");

const router = express.Router();

router.post("/comments", [
	check("commentText").not().isEmpty().isLength({ max: 320, min: 1 }),
	send.comment,
]);
router.post("/replies", [
	check("replyText").not().isEmpty().isLength({ max: 320, min: 1 }),
	send.reply,
]);

router.get("/comments", get.comments);

router.get("/replies", get.replies);

module.exports = router;
