const router = require("express").Router();
const { Login, Register, logout } = require("../controllers/authController")
const { authorizePermissions, authenticateUser } = require("../middlewares/Auth.User");

const { login: AdminLogin, logout: adminLogout,
    register: AdminRegister
} = require("../controllers/Admin")
// const Admin_auth = require("../middlewares/Admin.auth");
const { USER_ROLES_STATUS } = require("../utils/constants");
router.route("/login").post(Login)
router.route("/logout").get(logout)
// router.route("/admin/register").post(AdminRegister)
// router.route("/admin/login").post(AdminLogin)
// router.route("/admin/logout").get(adminLogout)
// router.route("/register").post(Admin_auth, Register)
router.route("/register").post(authenticateUser,
authorizePermissions(USER_ROLES_STATUS.admin,USER_ROLES_STATUS.sub_admin), Register)
module.exports = router