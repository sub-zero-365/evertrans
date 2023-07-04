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
    var bus = await Bus.findOne({ _id: req.params.id });
    if (!bus) {
        throw NotFoundError("no  bus with id " + req.params.id)
    }
    const isActiveSeat = bus.toJSON().seat_positions.every((x) => x.isTaken == false);

    if (isActiveSeat) {
        bus = await Bus.findOneAndDelete({ _id: req.params.id });
        if (!bus) {
            throw BadRequestError("fail to delete bus with id " + req.params.id)
        }
        return res.status(200).json({ status: true })

    }
    const isAllFilled = bus.toJSON().seat_positions.every((x) => x.isTaken == true);
    if (!isAllFilled) {
        throw BadRequestError("you cannot delete a bus untill full or reset!!");
    }
    bus = await Bus.findOneAndDelete({ _id: req.params.id });
    if (!bus) {
        throw BadRequestError("fail to delete bus with id " + req.params.id)
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
const resetBusData = async (req, res) => {
    const { id } = req.params;
    const bus = await Bus.findOne({
        _id: id
    })
    if (!bus) {
        throw BadRequestError("couldnt  find bus with id " + id)
    }
    const isAllFilled = bus.toJSON().seat_positions.every((x) => x.isTaken == true);
    if (!isAllFilled) {
        throw BadRequestError("wait admin bus is not yet full")
    }
    const n_seats = bus.number_of_seats;
    const seat_positions =
        Array.from({ length: n_seats }, (arr, index) => {
            return ({
                _id: index,
                isTaken: false,
            })
        })
    const updateBus = await Bus.findOneAndUpdate({
        _id: id
    }
        , {
            seat_positions
        }

    )

    if (!updateBus) {
        console.log("fail to update bus")
    }
    res.status(200).json({ status: true })

}
const updateBusSeat = async (req, res) => {
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
    const { search, feature } = req.query;
    const queryObject = {}
    if (search) {
        queryObject.$or = [
            {
                name: {
                    $regex: search, $options: "i"
                }
            },
        ]
        // console.log("search here : ",search)
    }
    if (feature&&feature!=="all") {
    
    console.log("feature here ",feature)
        queryObject.feature = feature
    }
    const buses = await Bus.find(queryObject);
    res.status(200).json({ buses })
}
module.exports = {
    create,
    deleteBus,
    updateBus, getBus,
    getAllBus, updateBusSeat,
    resetBusData
}