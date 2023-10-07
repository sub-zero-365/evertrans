const router = require("express").Router()
const { createMail, getStaticMail, getAllMeals, downloadsoftcopy, editMail } = require("../controllers/mailsController")
const { upload } = require("../utils/multerMiddleware")
const { validateMailInput } = require("../middlewares/validationMiddleware")
const userauth = require("../middlewares/Auth.User")
router.route("/new").post(
    upload.single("imgUrl"),
    validateMailInput, userauth,
    createMail, editMail)
router.route("/:id").get(getStaticMail)
router.route("/edit/:id").patch(editMail)
router.route("/").get(getAllMeals)
router.route("/download/:id").get(downloadsoftcopy)
module.exports = router