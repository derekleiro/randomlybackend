const express = require("express");

const get = require("../controllers/notifications-controllers");

const router = express.Router();

router.get("/notifications", get.notifications);

module.exports = router;
