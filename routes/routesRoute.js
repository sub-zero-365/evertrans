const router = require("express").Router();
const admin_auth = require("../middlewares/Admin.auth")
const {
    createRoutes,
    updateRoutes,
    getAllRoutes,
    deleteRoutes,
    getStaticRoute,
    getRoute
} = require("../controllers/RouteController")
router.route("/new").post(admin_auth,
    createRoutes)
router.route("/").get(getAllRoutes)
router.route("/:id")
    .delete(admin_auth, deleteRoutes)
router.route("/get")
.get(getRoute)

module.exports = router
