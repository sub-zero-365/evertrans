const express = require("express");
const router = express.Router();
const {
    getAlluser,
    getStaticUser
} = require("../controllers/User");
const {getTickets,getTicket} =require("../controllers/Ticket");
const {getContact,getAllContact} =require("../controllers/Contact")
router.route("/allusers").get(getAlluser);
router.route("/alltickets").get(getTickets);
router.route("/staticuser/:id").get(getStaticUser)
router.route("/staticticket/:id").get(getTicket)
router.route("/allcontacts").get(getAllContact)
router.route("/staticcontact/:id").get(getContact)
// router.get("/unique/:search", uniqueUsers)


module.exports = router