const {
    create,
    edit,
    getTicket,
    getTickets
    , downloadsoftcopyticket,
    editTicketMeta, removeSeatIdFromTicket
} = require("../controllers/Ticket");
const { validateTicketInput,
    validateupdateTicket,
    validateIdParam,
    validateGetTicket,
    validateEditTicket,
} = require("../middlewares/validationMiddleware")
const IsUserRestricted = require("../middlewares/IsUserRestricted")
const express = require("express")
const router = express.Router()
const { ticketPermission } = require("../utils/ticketPermission")
router.route("/").post(
    IsUserRestricted,
    ticketPermission,
    validateTicketInput,
    create).get(
        ticketPermission,
        getTickets)
router.route("/:id").get(
    validateIdParam,
    ticketPermission,
    getTicket)
router.route("/download/:id").
    get(validateIdParam,
        downloadsoftcopyticket)
router.route("/edit/:id").
    post(
        validateIdParam,
        validateupdateTicket,
        validateEditTicket
        ,
        edit)
router.
    route("/updateticket/:id").
    patch(
        validateIdParam,
        editTicketMeta)
router.route("/removeticketfrombus").post(removeSeatIdFromTicket)

module.exports = router