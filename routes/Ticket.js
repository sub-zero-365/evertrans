const {
    create,
    edit,
    getTickets,userTickets,getTicket
} = require("../controllers/Ticket");
// require("../middlewares/Admin.auth")
const userAuth=require("../middlewares/Auth.User")

const express = require("express")
const router = express.Router()
router.route("/").post(userAuth,create).get(userAuth,userTickets)
router.route("/:id").get(userAuth,getTicket);

router.route("/edit/:id").post(require("../middlewares/Admin.auth"), edit)

module.exports = router