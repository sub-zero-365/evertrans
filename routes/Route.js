const router = require("express").Router();
const admin_auth = require("../middlewares/Admin.auth")
const {
    createRoutes, getAllRoutes, deleteRoutes
} = require("../controllers/Route")
router.route("/").post(admin_auth, createRoutes).get(getAllRoutes)
router.route("/:id").delete(admin_auth, deleteRoutes)
module.exports = router
