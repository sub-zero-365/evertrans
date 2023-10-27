const router = require("express").Router()
const { createMail, getStaticMail, getAllMeals, downloadsoftcopy, editMail, showStats } = require("../controllers/mailsController")
const { upload } = require("../utils/multerMiddleware")
const { mailsPermission, mailsOrticketPermission } = require("../utils/ticketPermission")

const { validateMailInput,
    validateGetSingleMail } = require("../middlewares/validationMiddleware")
const userauth = require("../middlewares/Auth.User")
router.route("/new").post(
    upload.single("imgUrl"),
    validateMailInput, userauth, mailsPermission,
    createMail, editMail)
    router.route("/showstats").get(
        userauth,
        showStats)
router.route("/:id").get(
    userauth,
    mailsOrticketPermission,
    validateGetSingleMail,
    getStaticMail)
router.route("/edit/:id").patch(
    userauth,
    mailsOrticketPermission,
    editMail)
router.route("/").get(getAllMeals)

router.route("/download/:id").get(downloadsoftcopy)
module.exports = router