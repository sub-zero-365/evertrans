const router = require("express").Router()
const adminauth = require("../middlewares/Admin.auth");
const { verifyJWT } = require("../utils/tokenUtils")
const validation = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader) {
        throw UnathorizedError("please provide an auth header")
    }
    if (!authHeader.startsWith(process.env.jwtSecret)) {
        throw UnathorizedError("please provide a valid auth  header")
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyJWT(token, process.env.jwtSecret);
        console.log(payload, "payload her")
        req.user = {
            id: payload._id
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
    DeleteAssistant,
    getStaticAssistant } = require("../controllers/Assistant");
router.route("/").get(adminauth, GetAllAssistant)
router.route("/:id").get(
    validateIdParam,
    getStaticAssistant).delete(DeleteAssistant);
router.route("/ticket/:id").get(
    validation,
    getTicket)

router.route("/edit/:id").post(
    validation,
    edit)
// router.route("/ticket/:id").
// router.route("")

module.exports = router