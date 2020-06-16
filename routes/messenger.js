const express = require("express");
const { check } = require("express-validator");

const messenger = require("../controllers/messenger-controllers");

const router = express.Router();

router.post(
	"/messenger",
	[check("message").not().isEmpty().isLength({ max: 320, min: 1 })],
	messenger.send
);
router.get("/messenger", messenger.receive);
router.get("/chatrooms", messenger.chatrooms);

module.exports = router;
