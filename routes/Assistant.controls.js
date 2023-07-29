const router = require("express").Router()
const adminauth = require("../middlewares/Admin.auth");
const {
    GetAllAssistant,
    DeleteAssistant,
    getStaticAssistant } = require("../controllers/Assistant");
router.route("/").get(adminauth, GetAllAssistant)
router.route("/:id").get(getStaticAssistant).delete(DeleteAssistant);
// router.route("")

module.exports = router