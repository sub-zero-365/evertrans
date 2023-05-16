const {
    Login,
    Register,userInfo, getAlluser
} = require("../controllers/User");
const admin = require("../controllers/Admin")
const userAuth = require("../middlewares/Auth.User")
const express = require("express")
const router = express.Router()
router.route("/login").post(Login)
router.route("/register").post(Register);
router.route("/userinfo").get(userAuth,userInfo);
router.route("/users").get(getAlluser)
router.route("/admin").post(admin)
module.exports = router