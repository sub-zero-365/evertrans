const router = require("express").Router();
const {
    create, deleteBus, updateBus, getBus, getAllBus, updateBusSeat, resetBusData,
    downloadboarderaux, setActive, editBus

} = require("../controllers/Bus");
const { authorizePermissions } = require("../middlewares/Auth.User")
const { busValidtionInput } = require("../middlewares/validationMiddleware")
const Admin_auth = require("../middlewares/Admin.auth");
const { USER_ROLES_STATUS } = require("../utils/constants");
router.route("/").post(authorizePermissions(USER_ROLES_STATUS.admin,),
    busValidtionInput,
    create).get(getAllBus)
router.route("/:id").get(getBus)
    .delete(Admin_auth, deleteBus).
    patch(Admin_auth, updateBus)
router.route("/:id/:seat_number").
    put(updateBusSeat)
// router.route("/reset/:id").patch(Admin_auth, resetBusData)
// router.route("/active/:id").patch(Admin_auth, setActive);
router.route("/download/:id").get(downloadboarderaux)
router.route("/edit/:id")
    .patch(authorizePermissions(USER_ROLES_STATUS.admin,
        USER_ROLES_STATUS.sub_admin),
        editBus)

module.exports = router