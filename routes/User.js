const {
  userInfo: getCurrentUser
} = require("../controllers/User");

const express = require("express")
const router = express.Router()
router.route("/current-user").get(getCurrentUser)

module.exports = router