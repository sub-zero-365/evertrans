const router = require("express").Router();

const { LoginAssistant,
    createAssistant } = require("../controllers/AssistantAuth");
    const adminauth=require("../middlewares/Admin.auth")
router.route("/register").post(adminauth,createAssistant)
router.route("/login").post(LoginAssistant)
module.exports = router;

