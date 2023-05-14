const {
    Login,
    Register,userInfo
} = require("../controllers/User");
const admin = require("../controllers/Admin")
// const admin = require("../middlewares/")
const userAuth = require("../middlewares/Auth.User")
const express = require("express")
const router = express.Router()
router.route("/login").post(Login)
router.route("/register").post(Register);
router.route("/userinfo").get(userAuth,userInfo);
router.route("/admin").post(admin)
module.exports = router