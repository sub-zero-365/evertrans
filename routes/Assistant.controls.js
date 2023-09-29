const router = require("express").Router()
const adminauth = require("../middlewares/Admin.auth");
const userauth = require("../middlewares/Auth.User");

const { verifyJWT } = require("../utils/tokenUtils")
const checkPermissions = require("../utils/checkPermission")

const validation = async (req, res, next) => {
    const user = {
        id: req.userInfo._id,
        password: req.userInfo.password
    }
    req.user = user
    next()

}
const {
    validateIdParam
} = require("../middlewares/validationMiddleware")
const { getTicket, edit } = require("../controllers/Ticket")
const {
    GetAllAssistant,
    DeleteAssistant
    , updatePassword,
    getStaticAssistant } = require("../controllers/Assistant");
router.route("/").get(adminauth
    , GetAllAssistant).
    patch(validation,
        updatePassword)
router.route("/current-user").get(
    userauth, validation,
    getStaticAssistant)
router.route("/:id").delete(adminauth, DeleteAssistant);
router.route("/ticket/:id").get(
    userauth,
    validation,
    async function (req, res, next) {
        await checkPermissions(req.user.id)
        next()
    }
    ,
    getTicket)

router.route("/edit/:id").post(
    userauth,validation,
    edit)


module.exports = router