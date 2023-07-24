const {
    create,
    edit,
    getTicket,
    getTickets
    , downloadsoftcopyticket, editTicketMeta
} = require("../controllers/Ticket");
const { validateTicketInput,
    validateupdateTicket,
    validateIdParam,
    validateEditTicket
} = require("../middlewares/validationMiddleware")
const IsUserRestricted = require("../middlewares/IsUserRestricted")
const express = require("express")
const router = express.Router()
router.route("/").post(IsUserRestricted,
    validateTicketInput, create).get(getTickets)
router.route("/:id").get(
    validateIdParam,
    getTicket)
router.route("/download/:id").
    get(validateIdParam,
        downloadsoftcopyticket)
router.route("/edit/:id").
    post(
        validateIdParam,
        validateupdateTicket,
        validateEditTicket,
        edit)
router.
    route("/updateticket/:id").
    patch(
        validateIdParam,
        editTicketMeta)

module.exports = router