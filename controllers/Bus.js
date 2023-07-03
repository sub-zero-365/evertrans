const Bus = require("../models/Bus")
const {
    NotFoundError
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
    const { id, seat_number } = req.params;
    console.log(id, seat_number);
    const updatedid = await Bus.findOneAndUpdate({
        _id: id, 
        "seat_positions._id": seat_number
    
    }
    ,
        {
            $set: {
                "seat_details.seat_positions.$._id": seat_number
            }
        }
    )
    console.log(updatedid)
    res.send("hello usser")


}
const getAllBus = async (req, res) => {
    const buses = await Bus.find({});
    res.status(200).json({ buses })
}
module.exports = {

    create, deleteBus, updateBus, getBus, getAllBus, updateBusSeat
}