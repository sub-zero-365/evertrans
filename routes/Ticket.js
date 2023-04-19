const {
    Ticket: {
        create
    }
} = require("../controllers");

const express = require("express")
const router = express.Router()
router.route("/").post(create)

module.exports = router