const {
    create,
    edit,
    getTicket,
    getTickets
    , downloadsoftcopyticket,
    editTicketMeta, removeSeatIdFromTicket
} = require("../controllers/Ticket");
const { authorizePermissions } = require("../middlewares/Auth.User");


const { validateTicketInput,
    validateupdateTicket,
    validateIdParam,
    validateGetTicket,
    validateEditTicket,
} = require("../middlewares/validationMiddleware")
const IsUserRestricted = require("../middlewares/IsUserRestricted")
const express = require("express");
const { USER_ROLES_STATUS } = require("../utils/constants");
const router = express.Router()
// const { ticketPermission } = require("../utils/ticketPermission")
router.route("/").post(
    IsUserRestricted,
    authorizePermissions("ticket"),
    validateTicketInput,
    create).get(
        // ticketPermission,
        authorizePermissions(
            USER_ROLES_STATUS.ticketer,
            USER_ROLES_STATUS.admin,
            USER_ROLES_STATUS.sub_admin),
        getTickets)
router.route("/:id").get(
    validateGetTicket,
    authorizePermissions(
        USER_ROLES_STATUS.ticketer,
        USER_ROLES_STATUS.admin,
        USER_ROLES_STATUS.sub_admin,
        USER_ROLES_STATUS.scanner),
    getTicket)
router.route("/download/:id").
    get(validateIdParam,
        authorizePermissions(USER_ROLES_STATUS.ticketer,
            USER_ROLES_STATUS.admin,
            USER_ROLES_STATUS.sub_admin),
        downloadsoftcopyticket)
router.route("/edit/:id").
    post(
        validateGetTicket,
        validateupdateTicket,
        validateEditTicket
        ,
        authorizePermissions( USER_ROLES_STATUS.scanner),
        edit)
router.
    route("/updateticket/:id").
    patch(
        validateIdParam,
        authorizePermissions(USER_ROLES_STATUS.ticketer,
            USER_ROLES_STATUS.admin),
        editTicketMeta)
router.route("/removeticketfrombus").post(removeSeatIdFromTicket)

module.exports = router