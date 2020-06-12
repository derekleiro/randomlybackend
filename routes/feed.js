const express = require("express");

const feedControllers = require("../controllers/feed-controllers");

const router = express.Router();

router.get("/feed", feedControllers.getFeed);

module.exports = router;
