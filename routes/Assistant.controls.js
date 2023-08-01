const router = require("express").Router()
const adminauth = require("../middlewares/Admin.auth");
const { verifyJWT } = require("../utils/tokenUtils")
const checkPermissions = require("../utils/checkPermission")

const validation = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader)
    if (!authHeader) {
        throw UnathorizedError("please provide an auth header")
    }
    if (!authHeader.startsWith(process.env.jwtSecret)) {
        throw UnathorizedError("please provide a valid auth  header")
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyJWT(token, process.env.jwtSecret);
        console.log(payload, "everthing ok here")
        req.user = {
            id: payload._id,

        }
        next()
    } catch (err) {
        console.log(err)
        res.send("internals erver error").status(500)
    }

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
router.route("/user").get(
    // validateIdParam,
    validation,
    getStaticAssistant)
router.route("/:id").delete(adminauth, DeleteAssistant);
router.route("/ticket/:id").get(
    validation,
    async function (req, res, next) {
        await checkPermissions(req.user.id)
        
        next()
    }
    ,
    // [checkPermissions],
    getTicket)

router.route("/edit/:id").post(
    validation,
    edit)
// router.route("")
// router.route("/ticket/:id").
// router.route("")

module.exports = router