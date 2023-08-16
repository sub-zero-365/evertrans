const {
    Login,
    Register, userInfo, getAlluser
} = require("../controllers/User");
const { login, register } = require("../controllers/Admin")
const { validateRegisterInput, validateCreateAdmin } = require("../middlewares/validationMiddleware")
const userAuth = require("../middlewares/Auth.User")
const adminAuth = require("../middlewares/Admin.auth")
const express = require("express")
const router = express.Router()
router.route("/login").post(Login)
router.route("/register").post(validateRegisterInput,

    adminAuth,

    Register);
router.route("/userinfo").get(userAuth, userInfo);
router.route("/users").get(getAlluser)
router.route("/admin/login").post(login)
router.route("/admin/register").post(
    validateCreateAdmin,
    register)
module.exports = router