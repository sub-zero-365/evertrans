const {
    create,
    edit,
    getTicket,
    getTickets
    ,downloadsoftcopyticket,
} = require("../controllers/Ticket");
const {validateTicketInput,
validateupdateTicket,
validateIdParam
}=require("../middlewares/validationMiddleware")
const IsUserRestricted=require("../middlewares/IsUserRestricted")
const express = require("express")
const router = express.Router()
router.route("/").post(IsUserRestricted,validateTicketInput,create).get(getTickets)
router.route("/:id").get(
validateIdParam,
getTicket)
router.route("/download/:id").
get(validateIdParam,
downloadsoftcopyticket)
router.route("/edit/:id").
post(require("../middlewares/Admin.auth"),
validateupdateTicket,
edit)

module.exports = router