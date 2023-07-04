const Bus = require("../models/Bus")
const {
    NotFoundError, BadRequestError
} = require("../error")
const create = async (req, res) => {
    console.log(req.body)
    const bus = await Bus.create(req.body)
    res.status(201).
        json({ bus })
}

const deleteBus = async (req, res) => {
    const bus = await Bus.findOneAndDelete({ _id: req.params.id });
    if (!bus) {
        throw NotFoundError("fail to delete bus with id " + req.params.id)
    }
    res.status(200).json({ status: true })
}


const getBus = async (req, res) => {

    const bus = await Bus.findOne({ _id: req.params.id })
    if (!bus) {
        throw NotFoundError("couldnot found bus with this " + req.params.id)
    }
    res.status(200).json({ bus })
}

const updateBus = async (req, res) => {
    res.send("update bus route  here")
}
const updateBusSeat = async (req, res) => {
    // await Bus.deleteMany()

    const { id, seat_number } = req.params;
    const bus = await Bus.findOne({
        "seat_positions._id": Number(seat_number),
        _id: id
    })
    if (!bus) throw BadRequestError("couldnot found bus with id " + id)
    if (bus.seat_positions[Number(seat_number)].isTaken == true) {
        throw BadRequestError("oops seat is already taken,please choose another seat thanks")

    }
    console.log(bus.seat_positions[Number(seat_number)])
    const updatedid = await Bus.findOneAndUpdate({
        "seat_positions._id": Number(seat_number),
        _id: id
    }
        ,
        {
            $set: {
                "seat_positions.$.isTaken": true
            }
        }
        , {

            new: true
        }
    )
    console.log("updated value", updatedid?.seat_positions)
    res.status(200)
        .json({ state: true })


}
const getAllBus = async (req, res) => {
    const buses = await Bus.find({});
    res.status(200).json({ buses })
}
module.exports = {

    create, deleteBus, updateBus, getBus, getAllBus, updateBusSeat
}