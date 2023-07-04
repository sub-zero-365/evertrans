const router = require("express").Router();
const {
    create, deleteBus, updateBus, getBus, getAllBus, updateBusSeat, resetBusData
} = require("../controllers/Bus");
const Admin_auth = require("../middlewares/Admin.auth")
router.route("/").post(Admin_auth, create).get(getAllBus)
router.route("/:id").get(getBus)
    .delete(Admin_auth, deleteBus).
    patch(Admin_auth, updateBus)
router.route("/:id/:seat_number").put(updateBusSeat)
router.route("/reset/:id").patch(Admin_auth, resetBusData)


module.exports = router