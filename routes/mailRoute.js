const router = require("express").Router()
const { createMail, getStaticMail, getAllMeals } = require("../controllers/mailsController")
const { upload } = require("../utils/multerMiddleware")
const { validateMailInput } = require("../middlewares/validationMiddleware")
const userauth = require("../middlewares/Auth.User")
router.route("/new").post(
    upload.single("avatar"),
    validateMailInput, userauth,
    createMail)
router.route("/:id").get(getStaticMail)
router.route("/").get(getAllMeals)
module.exports = router