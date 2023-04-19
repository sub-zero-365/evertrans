const { Ticket } = require("../models")
const createTicket = async(req, res) => {
        const { body } = req
        const ticket = await Ticket.create({...body })
        res.status(200)
            .send("create ticket route here ")
    }
    // if()
module.exports = {
    create: createTicket
}