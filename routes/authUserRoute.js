const router = require("express").Router();
const { Login, Register, logout } = require("../controllers/authController")
const { login: AdminLogin,logout:adminLogout } = require("../controllers/Admin")

const Admin_auth = require("../middlewares/Admin.auth")
router.route("/login").post(Login)
router.route("/logout").get(logout)
router.route("/admin/login").post(AdminLogin)
router.route("/admin/logout").get(adminLogout)
router.route("/register").post(Admin_auth, Register)
module.exports = router