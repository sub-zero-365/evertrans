const express = require("express");
const router = express.Router();
const { getStatic } = require("../controllers/Admin.Controller");

router.route("/user").get(getStatic)
module.exports = router