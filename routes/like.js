const express = require("express");

const post = require("../controllers/like-controllers");

const router = express.Router();

router.post("/like", post.like);

module.exports = router;