const express = require("express");

const discoverControllers = require("../controllers/discover-controllers");

const router = express.Router();

router.get("/discover", discoverControllers.getFeed);

module.exports = router;