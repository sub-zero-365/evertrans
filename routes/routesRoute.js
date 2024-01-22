const router = require("express").Router();
// const admin_auth = require("../middlewares/Admin.auth")
const { authorizePermissions } = require("../middlewares/Auth.User")
const {
    createRoutes,
    updateRoutes,
    getAllRoutes,
    deleteRoutes,
    getStaticRoute,
    getRoute
} = require("../controllers/RouteController");
const { USER_ROLES_STATUS } = require("../utils/constants");
router.route("/new").post(authorizePermissions(USER_ROLES_STATUS.admin,
    USER_ROLES_STATUS.sub_admin),
    createRoutes)
router.route("/").get(getAllRoutes)
router.route("/:id")
    .delete(authorizePermissions(USER_ROLES_STATUS.admin,
        USER_ROLES_STATUS.sub_admin), deleteRoutes)
router.route("/get")
    .get(getRoute)
router.route("/update/:id").patch(authorizePermissions(USER_ROLES_STATUS.admin,
    USER_ROLES_STATUS.sub_admin),
    updateRoutes)

module.exports = router
