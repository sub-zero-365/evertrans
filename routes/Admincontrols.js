const express = require("express");
const router = express.Router();
const {
    getAlluser,
    uniqueUsers,userInfo
} = require("../controllers/User");
const {getTickets} =require("../controllers/Ticket");
router.route("/allusers").get(getAlluser);
router.route("/alltickets").get(getTickets);

// router.route("/user/:id").get(userInfo)
router.get("/unique/:search", uniqueUsers)


module.exports = router