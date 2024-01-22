const router = require("express").Router();
const admin_auth = require("../middlewares/Admin.auth")
const { authenticateUser } = require("../middlewares/Auth.User")
const { updatePassword, deleteUser } = require("../controllers/User")

router.route("/updatepassword").post(authenticateUser, updatePassword)
router.route("/delete-user/:id").delete(
    admin_auth,
    deleteUser
)

module.exports = router
