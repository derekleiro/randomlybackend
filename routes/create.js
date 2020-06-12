const express = require("express");
const { check } = require("express-validator");

const createPostControllers = require("../controllers/create-controllers");

const router = express.Router();

router.post("/create", [
    check("rawContent").not().isEmpty().isLength({max: 320, min: 1})
], createPostControllers.create);

module.exports = router;
