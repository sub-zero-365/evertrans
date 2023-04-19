const {
    User: {
        Login,
        Register
    }
} = require("../controllers");

const express = require("express")
const router = express.Router()
router.route("/login").post(Login)
router.route("/register").post(Register)
module.exports = router