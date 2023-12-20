const router = require("express").Router()
const { createMail, getStaticMail, getAllMeals, downloadsoftcopy, editMail, showStats, getRankUsersMails } = require("../controllers/mailsController")
const { upload } = require("../utils/multerMiddleware")
const { mailsPermission, mailsOrticketPermission } = require("../utils/ticketPermission")
const IsUserRestricted = require("../middlewares/IsUserRestricted")
const { validateMailInput,
    validateGetSingleMail } = require("../middlewares/validationMiddleware")
const userauth = require("../middlewares/Auth.User")
router.route("/new").post(
    upload.single("imgUrl"),
    validateMailInput
    , userauth,
    IsUserRestricted,
    mailsPermission,
    createMail, editMail)
router.route("/showstats").get(
    userauth,
    showStats)
router.route("/ranked-users").get(getRankUsersMails)
router.route("/:id").get(
    userauth,
    mailsOrticketPermission,
    validateGetSingleMail,
    getStaticMail)
router.route("/edit/:id").patch(
    userauth,
    mailsOrticketPermission,
    editMail)
router.route("/").get(
    userauth,//protect this route from invaders 
    mailsPermission,
    getAllMeals)


router.route("/download/:id").get(downloadsoftcopy)
module.exports = router