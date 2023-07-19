const router = require("express").Router();
const {
    create, deleteBus, updateBus, getBus, getAllBus, updateBusSeat, resetBusData,
    downloadboarderaux, setActive

} = require("../controllers/Bus");
const { busValidtionInput } = require("../middlewares/validationMiddleware")
const Admin_auth = require("../middlewares/Admin.auth")
router.route("/").post(Admin_auth,
    busValidtionInput,
    create).get(getAllBus)
router.route("/:id").get(getBus)
    .delete(Admin_auth, deleteBus).
    patch(Admin_auth, updateBus)
router.route("/:id/:seat_number").
    put(updateBusSeat)
router.route("/reset/:id").patch(Admin_auth, resetBusData)
router.route("/active/:id").patch(Admin_auth, setActive);
router.route("/download/:id").get(downloadboarderaux)

module.exports = router