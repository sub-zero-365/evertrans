const router = require("express").Router();
const { createSeat,
    getStaticSeat, updateSeat,
    getAllSeats } = require("../controllers/Seat")
router.route("/").
    post(createSeat)
    .get(getAllSeats);
router.route("/updateseat/:id/:seat_number")
    .patch(updateSeat)
router.route("/getstatic")
.get(getStaticSeat)
module.exports = router