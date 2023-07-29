const router = require("express").Router();
const { validcreateAssistant } = require("../middlewares/validationMiddleware")
const { LoginAssistant,
    createAssistant } = require("../controllers/AssistantAuth");
const adminauth = require("../middlewares/Admin.auth")
router.route("/register").post(
    adminauth,
    validcreateAssistant
    , createAssistant)
router.route("/login").post(LoginAssistant)
module.exports = router;

