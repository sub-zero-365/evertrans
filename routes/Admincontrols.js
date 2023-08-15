const express = require("express");
const router = express.Router();
const { getStatic, getAllUsers } = require("../controllers/Admin.Controller");

const {
    getAlluser,
    getStaticUser,
    getUserAndTicketLength
} = require("../controllers/User");
const { addCity,
    getCitys,
    updateCity,
    removeCity } = require("../controllers/City")
const { getTickets, getTicket, edit } = require("../controllers/Ticket");
const { getContact,
    getAllContact } = require("../controllers/Contact")
router.route("/allusers").get(getAlluser);
router.route("/alltickets")
    .get(getTickets);
router.route("/edit/:id").post(edit);
router.route("/userticketlength")
    .get(getUserAndTicketLength);

router.route("/staticuser/:id").get(getStaticUser)
router.route("/staticticket/:id").get(getTicket)
router.route("/allcontacts").get(getAllContact)
router.route("/allcities").get(getCitys)
router.route("/user").get(getStatic)
router.route("/alladmins").get(getAllUsers)
router.route("/city/:id")
    .delete(removeCity)
    .put(updateCity)
router.route("/city").post(addCity)
router.route("/staticcontact/:id").get(getContact)


module.exports = router