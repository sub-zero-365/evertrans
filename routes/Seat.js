const router = require("express").Router();
const { createSeat,
    getStaticSeat, updateSeat, getSpecificSeat,
    getAllSeats, 
    specificTicketId
    ,downloadboarderaux } = require("../controllers/Seat")
router.route("/").
    post(createSeat)
    .get(getAllSeats);
router.route("/updateseat/:id/:seat_number")
    .patch(updateSeat)
router.route("/getstatic")
    .get(getStaticSeat)
router.route("/specific/:id").get(getSpecificSeat)
router.route("/ticket/:id/:index").get(specificTicketId)
router.route("/download/:id").get(downloadboarderaux)
module.exports = router