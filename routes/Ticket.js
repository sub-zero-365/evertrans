const {
    create,
    edit,
    userTickets,getTicket,getTickets
} = require("../controllers/Ticket");

const express = require("express")
const router = express.Router()
router.route("/").post(create).get(getTickets)
router.route("/:id").get(getTicket)

router.route("/edit/:id").post(require("../middlewares/Admin.auth"), edit)

module.exports = router