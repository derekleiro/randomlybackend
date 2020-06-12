const express = require("express");

const post = require("../controllers/save-controllers");
const get = require("../controllers/save-controllers");

const router = express.Router();

router.post("/save", post.save);
router.get("/save", get.saves);

module.exports = router;