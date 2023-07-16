const Route = require("../models/Routes")
const Seat = require("../models/Seat")
const { BadRequestError, NotFoundError } = require("../error")
const dayjs = require("dayjs")
const createSeat = async (req, res) => {
    res.send("create seat route here")
}

const getStaticSeat = async (req, res) => {
    const { from, to, traveldate, traveltime } = req.query;
    const queryObject = {}
    console.log(req.params)
    const getNextDay = (date = new Date()) => {
        const next = new Date(date.getTime());
        next.setDate(date.getDate() + 1);
        return next.toLocaleDateString("en-CA")// name if ghe fuke abx ghe  jde abd neami  gfhef u abekx ghe  jde abd 
    }

    if (from) {
        queryObject.from = {
            $regex: from, $options: "i"
        }

    }
    if (to) {
        queryObject.to = {
            $regex: to, $options: "i"
        }

    }
    if (traveltime) {
        queryObject.traveltime = {
            $regex: traveltime, $options: "i"
        }

    }
    if (traveldate) {
        var date_ = {
            $gte: new Date(traveldate).toLocaleDateString("en-CA"),
            $lte: getNextDay(new Date(traveldate)),
        }
        queryObject.traveldate = date_
    }
    if (traveldate) {
        if (dayjs(new Date(traveldate).toLocaleDateString("en-CA")).diff(new Date().toLocaleDateString("en-CA"), "day") > 7) {
            throw BadRequestError(`No Bus Traveling on the ${new Date(traveldate).toLocaleDateString("en-CA")} `)
        }

    }
    let isSeat = await Seat.find({ ...queryObject })
    if (isSeat.length == 0 && from && to && traveldate && traveltime) {
        isSeat = await Seat.create({
            from,
            to,
            traveldate,
            traveltime
        })
        if (!isSeat) throw BadRequestError("fail to create a seats");
        isSeat = await Seat.find(queryObject);
    }
    res.status(200).json({
        seats: isSeat,
        nHits: isSeat.length,
    })
}
const updateSeat = async (req, res) => {
    const { id, seat_number } = req.params;
    const seat = await Seat.findOne({
        "seat_positions._id": Number(seat_number),
        _id: id
    })
    if (!seat) throw BadRequestError("couldnot found seat with id " + id)


    if (seat.seat_positions[Number(seat_number)].isTaken == true) {
        throw BadRequestError("oops seat is already taken,please choose another seat thanks")
    }
    const updatedid = await Seat.findOneAndUpdate({
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
    if (!updatedid) throw BadRequestError("something went wrong try again later")

    res.status(200)
        .json({ state: true })


}
const getAllSeats = async (req, res) => {
    const getNextDay = (date = new Date()) => {
        const next = new Date(date.getTime());
        next.setDate(date.getDate() + 1);
        return next.toLocaleDateString("en-CA")
    }
    const { search,
        feature,
        from,
        to, status,
        date,
        traveltime } = req.query;
    const queryObject = {}

    if (from) {
        queryObject.from = {
            $regex: from, $options: "i"
        }
    }
    if (to) {
        queryObject.to = {
            $regex: to, $options: "i"
        }

    }
    if (search) {
        queryObject.$or = [
            {
                name: {
                    $regex: search, $options: "i"
                }
            },
        ]
    }
    const seats = await Seat.find(queryObject).sort({ "traveldate": -1 })
    const distinc_field = await Seat.aggregate([
        {
            $match: {

            }
        },
        {
            $group: {
                "_id": {
                    from: "$from",
                    to: "$to"
                }

            }
        },

    ])
    res.status(200).json({
        seats,
        nHits: seats.length,
        routes: distinc_field,
        routes_count: distinc_field?.length
    })
}
const updateSeatBus = async (req, res) => {
    // update route here
    const { id: _id, bus_id } = req.params
    const isSeat = await Seat.findOne({ _id })
    if (!isSeat) throw NotFoundError("cound find seat with id " + _id);
    const update = await Seat.findOneAndUpdate({

        _id
    }, {

        $set: {
            bus: {
                name: "rose",
                _id: bus_id
            }
        }
    })

    if (!update) throw BadRequestError("something went wrong try gain later")
    res.status(200).json({ seat: update })
}
module.exports = {
    createSeat,
    getStaticSeat,
    getAllSeats,
    updateSeat,
    updateSeatBus
}