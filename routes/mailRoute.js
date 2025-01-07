const router = require("express").Router()
const admin_auth = require("../middlewares/Admin.auth")
const { createMail, getStaticMail, getAllMeals, downloadsoftcopy, editMail, showStats, getRankUsersMails } = require("../controllers/mailsController")
const { upload } = require("../utils/multerMiddleware")
const IsUserRestricted = require("../middlewares/IsUserRestricted")
const { validateMailInput,
    validateGetSingleMail } = require("../middlewares/validationMiddleware")
const { authorizePermissions } = require("../middlewares/Auth.User")
const { USER_ROLES_STATUS } = require("../utils/constants");

router.route("/new").post(
    upload.single("imgUrl"),
    validateMailInput,
    IsUserRestricted,
    authorizePermissions(USER_ROLES_STATUS.mailer)
    ,
    // mailsPermission,
    createMail)
router.route("/showstats").get(
    authorizePermissions(USER_ROLES_STATUS.mailer,
        USER_ROLES_STATUS.admin
        , USER_ROLES_STATUS.sub_admin,),

    showStats)
router.route("/ranked-users").
    get(authorizePermissions(USER_ROLES_STATUS.mailer,
        USER_ROLES_STATUS.admin
        , USER_ROLES_STATUS.sub_admin),
        getRankUsersMails)
router.route("/:id").get(
    authorizePermissions(USER_ROLES_STATUS.mailer,
        USER_ROLES_STATUS.admin
        , USER_ROLES_STATUS.sub_admin,),

    validateGetSingleMail,
    getStaticMail)
router.route("/edit/:id").patch(

    authorizePermissions(USER_ROLES_STATUS.mailer,
    ),
    editMail)
router.route("/").get(
    authorizePermissions(USER_ROLES_STATUS.mailer,
        USER_ROLES_STATUS.admin
        , USER_ROLES_STATUS.sub_admin,),
    getAllMeals)


router.route("/download/:id").get(downloadsoftcopy)
module.exports = router