const {
    create,
    edit,
    userTickets,
    getTicket,getTickets,downloadsoftcopyticket
} = require("../controllers/Ticket");
const IsUserRestricted=require("../middlewares/IsUserRestricted")
const express = require("express")
const router = express.Router()
router.route("/").post(IsUserRestricted,create).get(getTickets)
router.route("/:id").get(getTicket)
router.route("/download/:id").get(downloadsoftcopyticket)
router.route("/edit/:id").post(require("../middlewares/Admin.auth"), edit)

module.exports = router