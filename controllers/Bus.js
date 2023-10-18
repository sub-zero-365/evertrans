const Bus = require("../models/Bus");
const Ticket = require("../models/Ticket");
const Seat = require("../models/Seat")
const fs = require("fs")
const { PDFDocument, rgb, degrees } = require("pdf-lib");
const { readFile, writeFile } = require("fs/promises");
const path = require("path")
const {
    NotFoundError, BadRequestError
} = require("../error")
const { v4: uuid } = require("uuid");
// const { findOneAndUpdate } = require("../models/Routes");
const validateBus = async (id) => {
    const bus = await Bus.findOne({ _id: id });
    if (!bus) throw NotFoundError("Fail to get ticket with id " + id)
    return bus
}
const create = async (req, res) => {
    const bus = await Bus.create(req.body)
    res.status(201).
        json({ bus })
}

const deleteBus = async (req, res) => {

    var bus = await Bus.findOneAndDelete({ _id: req.params.id });
    if (!bus) {
        throw BadRequestError("fail to delete bus with id " + req.params.id)
    }
    res.status(200).json({ status: true })
}


const getBus = async (req, res) => {
    const { id: _id } = req.params;
    const bus = await validateBus(_id)
    const assiocatedSeat = await Seat.countDocuments({
        "bus._id": _id
    }).select("_id")
    console.log(assiocatedSeat, "eee", _id)
    res.status(200).json({
        bus,
        seats: assiocatedSeat
    })
}

const updateBus = async (req, res) => {
    const { body: { name }, params: { id: _id } } = req;

    const updatebus = await Bus.findOneAndUpdate({ _id }, {
        $set: {
            name
        }
    }, { new: true })
    if (!updatebus) throw BadRequestError("fail to update  bus")

    res.status(200).json({ bus: updatebus })
}
const resetBusData = async (req, res) => {
    return res.send("reset bus route here")
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
    if (!updatedid) throw BadRequestError("something went wrong try again later")
    res.status(200)
        .json({ state: true })


}

const setActive = async (req, res) => {
    const { id: _id } = req.params
    const isBus = await Bus.findOne({ _id });
    if (!isBus) throw NotFoundError("invalid bus id");

    const bus = await Bus.findOneAndUpdate({
        _id: req.params.id
    }, {
        active: isBus.active == true ? false : true
    }, { new: true })
    if (bus) {
        // console.log(bus)
        return res.status(200).json({ status: true })
    }
    return BadRequestError("something went wrong")


}
const getAllBus = async (req, res) => {
    const getNextDay = (date = new Date()) => {
        const next = new Date(date.getTime());
        next.setDate(date.getDate() + 1);
        return next.toLocaleDateString("en-CA")
    }

    const { search, feature, from, to, status, date } = req.query;
    const queryObject = {}
    if (date) {
        var date_ = {
            $gte: new Date(date).toLocaleDateString("en-CA"),
            $lte: getNextDay(new Date(date)),
        }
        console.log(date_)
        queryObject.date = date_
    }
    if (status && status != "all") {
        if (status == "active") {
            queryObject.active = true
        }
        if (status == "inactive") {
            queryObject.active = false
        }

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
    if (search) {
        queryObject.$or = [
            {
                name: {
                    $regex: search, $options: "i"
                }
            },
        ]
    }
    if (feature && feature !== "all") {
        queryObject.feature = feature
    }

    const buses = await Bus.find(queryObject);
    if (buses.length === 0 && queryObject.from && queryObject.to) {
        const clonequery = { ...queryObject };
        delete clonequery.from
        delete clonequery.to
        const _buses = await Bus.find(clonequery).limit(10)
        res.status(200).
            json({ buses, avalaibe_buses: _buses, nHits: buses.length })
        return
    }
    res.status(200).json({ nHits: buses.length, buses })
}

const downloadboarderaux = async (req, res) => {
    const { id } = req.params
    const currentBus = await Bus.findOne(
        {
            "trips.tracking_id": id,
        }
    )
    const tickets = await Ticket.find({
        bus_id: id?.trim()
    }).select("fullname sex email seatposition")

    const _path = path.resolve(__dirname, "../boarderaux");
    const file = path.join(_path, "boarderauxafriquecon.pdf")

    try {
        const pdfDoc = await PDFDocument.load(await readFile(file));
        const fileNames = pdfDoc.getForm().getFields().map(f => f.getName())
        console.log(fileNames)
        const arr = [];
        for (let i = 0; i < currentBus?.number_of_seats; ++i) {
            if (tickets.some(({ seatposition }) => seatposition === i)) {
                arr.push(tickets.find(elm => elm.seatposition == i))
            } else {
                arr.push({ seatposition: i })
            }
        }
        arr.sort((a, b) => a.seatposition - b.seatposition);
        const form = pdfDoc.getForm()
        try {
            form.getTextField(`destination`).
                setText((currentBus.from || "n/a"))
        } catch (err) {
            console.log(err)
        }
        try {
            form.getTextField(`bus_number`).
                setText((String(currentBus._id) || "n/a"))
        } catch (err) {
            console.log(err)
        }
        try {
            form.getTextField(`date`).
                setText((new Date().toLocaleDateString()))
        } catch (err) {
            console.log(err)
        }
        try {
            form.getTextField(`passenger_count`).
                setText((String(tickets.length) || "n/a"))
        } catch (err) {
            console.log(err)
        }

        for (let i = 0; i < arr.length; ++i) {
            try {
                if ((arr[i].seatposition + 1) == 8) {
                    form.getTextField(`fullname ${i + 1}`).
                        setText((arr[i]?.fullname ? arr[i]?.fullname.trim()?.split(" ").map((name) => `${name[0]?.toUpperCase()}${name.slice(1)}`).join(" ") : ""))
                } else {
                    form.getTextField(`fullname${i + 1}`).
                        setText((arr[i]?.fullname ? arr[i]?.fullname.trim()?.split(" ").map((name) => `${name[0]?.toUpperCase()}${name.slice(1)}`).join(" ") : ""))

                }
                form.getTextField(`id${i + 1}`).
                    setText((arr[i]?.email || ""))
                form.getTextField(`sex${i + 1}`).
                    setText((arr[i]?.sex || ""))
            } catch (err) {
                console.log(err)
            }

        }

        form.flatten()
        // console.log(fileNames)

        const pdfBytes = await pdfDoc.save()
        // const date = Date.now()
        await writeFile(path.join(_path, id + ".pdf"), pdfBytes);
        res.sendFile(path.join(_path, id + ".pdf"), {}, function (err) {
            if (err) {
                console.log(err)
                throw err
            }
            else {
                if (fs.existsSync(path.join(_path, id + ".pdf"))) {
                    try {
                        fs.unlinkSync(path.join(_path, id + ".pdf"));
                    }
                    catch (err) {
                        console.lg(err)
                    }
                }
            }

        })
    }
    catch (err) {
        console.log(err)
    }

}
const editBus = async (req, res) => {
    const id = req.params.id
    var bus = await validateBus(id);
    //   all good here
    bus = await Bus.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!bus) throw BadRequestError("fail to update bus")
    res.
        json({ status: "success" }).
        status(200)
}

module.exports = {
    create,
    deleteBus,
    updateBus,
    getBus,
    getAllBus,
    updateBusSeat,
    resetBusData,
    downloadboarderaux,
    setActive,
    editBus
}