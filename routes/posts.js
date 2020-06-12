const express = require("express");

const postControllers = require("../controllers/posts-controllers");

const router = express.Router();

router.get("/posts", postControllers.getMainUserPosts);
router.get("/posts_u", postControllers.getUserPosts);

module.exports = router;