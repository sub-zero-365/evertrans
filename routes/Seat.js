const router = require("express").Router();
const { validateIdParam, validatecreateseat } = require("../middlewares/validationMiddleware")
const { createSeat,
    getStaticSeat, updateSeat, getSpecificSeat,
    getAllSeats,
    specificTicketId, ticketassociatedWithBus
    , downloadboarderaux, editSeat } = require("../controllers/Seat")
router.route("/").
    post(validatecreateseat, createSeat)
    .get(getAllSeats);
router.route("/updateseat/:id/:seat_number")
    .patch(updateSeat)
router.route("/getstatic")
    .get(getStaticSeat)
router.route("/specific/:id").get(validateIdParam, getSpecificSeat)
router.route("/ticket/:id/:index").get(specificTicketId)
router.route("/download/:id").get(downloadboarderaux)
router.route("/seatdetails/:id").get(ticketassociatedWithBus)
router.route("/update/:id").patch(editSeat)
module.exports = router