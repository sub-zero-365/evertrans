const {
  userInfo: getCurrentUser, getUserAndTicketLength
} = require("../controllers/User");
const { authorizePermissions } = require("../middlewares/Auth.User");
const { updatePassword, deleteUser, getAllSubAdminUsers } = require("../controllers/User")
const IsUserRestricted = require("../middlewares/IsUserRestricted")

const express = require("express");
const { USER_ROLES_STATUS } = require("../utils/constants");
const router = express.Router()
router.route("/user-stats").get(authorizePermissions(USER_ROLES_STATUS.admin,
  USER_ROLES_STATUS.sub_admin), IsUserRestricted,getUserAndTicketLength)
router.route("/current-user").get(IsUserRestricted,getCurrentUser)
router.route("/current-user/:userId").get(authorizePermissions(USER_ROLES_STATUS.admin,
  USER_ROLES_STATUS.sub_admin), getCurrentUser)
router.route("/delete-user/:id").delete(authorizePermissions(USER_ROLES_STATUS.admin,
  USER_ROLES_STATUS.sub_admin),
  deleteUser
)
router.route("/security").get(authorizePermissions(USER_ROLES_STATUS.admin), getAllSubAdminUsers)
module.exports = router