const express = require("express");

const UserControllers = require("../controllers/user-controller");

const router = express.Router();

router.get("/user", UserControllers.getMainUser);
router.get("/u", UserControllers.getUser);

module.exports = router;
