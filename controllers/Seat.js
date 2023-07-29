const Ticket = require("../models/Ticket")
const Bus = require("../models/Bus")
const Seat = require("../models/Seat")
const fs = require("fs")
const { PDFDocument, rgb, degrees } = require("pdf-lib");
const { readFile, writeFile } = require("fs/promises");
const path = require("path")
const { BadRequestError, NotFoundError } = require("../error")
// const dayjs = require("dayjs")
const createSeat = async (req, res) => {
    res.send("create seat route here")
}
const getSpecificSeat = async (req, res) => {
    const { id: _id } = req.params;

    const seat = await Seat.findOne({ _id })
    if (!seat) throw NotFoundError("fail to get seat with id " + _id)
    res.status(200).json({ seat })

}
const getStaticSeat = async (req, res) => {
    const { from, to, traveldate, traveltime } = req.query;
    console.log(req.query)
    const queryObject = {}
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
            $gte: traveldate,
            $lte: getNextDay(new Date(traveldate)),
        }
        queryObject.traveldate = date_
    }
    // if (traveldate) {
    //     if (dayjs(new Date(traveldate).toLocaleDateString("en-CA")).diff(new Date().toLocaleDateString("en-CA"), "day") > 7) {
    //         throw BadRequestError(`No Bus Traveling on the
    //          ${new Date(traveldate).toLocaleDateString("en-CA")} please chose a new previous date and try again `)
    //     }

    // }

    let isSeat = await Seat.find({ ...queryObject });
    // console.log("all seats here",isSeat.length)
    if (isSeat.length == 0 && from && to && traveldate && traveltime) {
        console.log("enter her where seat ==0")
        try {
            isSeat = await Seat.create({
                from,
                to,
                traveldate,
                traveltime
            })
            console.log("seat in try block", isSeat)
        } catch (err) {
            console.log("fail to create seat err", err)
        }
        console.log("newlyseasr", isSeat)
        if (!isSeat) {
            console.log("fail to create seat")
            throw BadRequestError("fail to create a seats")
        };
        isSeat = await Seat.find(queryObject);
    }
    console.log(isSeat, queryObject)

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
const specificTicketId = async (req, res) => {
    const { id: _id, index } = req.params;
    // console.log(await Ticket.find({
    //     seat_id: _id,

    // }))
    
    
    const ticket = await Ticket.findOne({
        seat_id: _id,
        seatposition: index
    }).select("_id")
    if (!ticket) {
        console.log("no ticket found")

    }
    res.status(200).json({ id: ticket._id })



}
const getAllSeats = async (req, res) => {

    const {
        from,
        to,
        traveltime,
        daterange,
        sort
    } = req.query;
    console.log("date range", daterange, req.query)
    const queryObject = {}
    if (daterange) {
        const decoded = decodeURIComponent(daterange)
        console.log("dcoded", decoded)
        const [startdate, endDate] = decoded.
            split(",").
            map(arr => arr.split("="))
            .map(([v, t]) => {
                return {
                    [v]: t
                }
            });
        console.log("date range : ", decodeURIComponent(daterange))

        if ("start" in startdate && "end" in endDate) {
            const getNextDay = (date = new Date()) => {
                const next = new Date(date.getTime());
                next.setDate(date.getDate() + 1);
                return next.toLocaleDateString("en-CA")
            }
            if (startdate.start != "null" && endDate.end != "null") {
                try {
                    var createdAt = {
                        $gte: startdate.start,
                        // $lt: getNextDay(new Date(endDate.end)),
                        $lte: endDate.end
                    }
                    console.log("nextday", getNextDay(new Date(endDate.end)))
                    queryObject.traveldate = createdAt

                } catch (err) {
                    console.log(err)
                }


            }
            if (startdate.start != "null" && endDate.end == "null") {
                var createdAt = {
                    $gte: startdate.start,
                    // $lt: getNextDay(new Date(startdate.start)),
                    $lte: startdate.start
                }
                queryObject.traveldate = createdAt
            }
        }
        console.log(queryObject)
    }
    if (traveltime) {
        queryObject.traveltime = {
            $regex: traveltime, $options: "i"
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
    const sortOptions = {
        newest: "-createdAt",
        oldest: "createdAt",
    }
    const sortKey = sortOptions[sort] || sortOptions.newest;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const nDoc = await Seat.countDocuments(queryObject)
    const seats = await Seat.find(queryObject)
        .sort(sortKey)
        .skip(skip)
        .limit(limit);

    if (queryObject?.sort) delete deleteTicket.sort
    const numberOfPages = Math.ceil(nDoc / limit);
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
        seats: seats.sort((a, b) => b.traveltime - a.traveltime),
        numberOfPages,
        currentPage: page,
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
const ticketassociatedWithBus = async (req, res, next) => {
    const { id } = req.params
    let currentSeat = await Seat.findOne(
        {
            _id: id,

        }
    )
    if (!currentSeat) throw NotFoundError(`No Seat found with id ${id}`)
    let tickets = null;

    tickets = await Ticket.find({
        seat_id: currentSeat._id,

    })

    tickets = tickets.filter((ticket) => {
        if (ticket.type === "roundtrip") {
            if (ticket.doubletripdetails[1].active === false) {
                return true
            }
            if (ticket.doubletripdetails[0].active === false) {
                return true
            }
            return false
        }
        if (ticket.type === "singletrip") {
            if (ticket.active === false) return true
        }

    })

    res.status(200).json({
        tickets,
        nHits: tickets.length,
        bus_id: id
    })
}


const downloadboarderaux = async (req, res) => {
    const { id } = req.params;
    ;
    console.log("bus_id", req.query)
    const { bus_id } = req.query;
    const  currentBus  =await Bus.findOne({ _id: bus_id })
    console.log("currentbus",currentBus)
    const currentSeat = await Seat.findOne(
        {
            _id: id,

        }
    )
    if (!currentSeat) throw NotFoundError("coudnot find seat with id " + id);
    const updates = await Seat.findOneAndUpdate({
    _id:id
    },
        {
            $set: {
                bus: {
                    bus: currentBus?.name,
                    _id: req.query.bus_id
                }
            }
        })
    console.log("updates", updates)
    let tickets = null;

    tickets = await Ticket.find({
        seat_id: currentSeat._id,

    })

    tickets = tickets.filter((ticket) => {
        if (ticket.type === "roundtrip") {
            console.log("enter here")
            if (ticket.doubletripdetails[1].active === false) {
                return true
            }
            if (ticket.doubletripdetails[0].active === false) {
                return true
            }
            return false
        }
        if (ticket.type === "singletrip") {
            if (ticket.active === false) return true
        }



    })
    const _path = path.resolve(__dirname, "../boarderaux");
    const file = path.join(_path, "boarderauxafriquecon.pdf")

    try {
        const pdfDoc = await PDFDocument.load(await readFile(file));
        // const fileNames = pdfDoc.getForm().getFields().map(f => f.getName())
        // console.log(fileNames)
        const arr = [];
        for (let i = 0; i < currentSeat?.seat_positions.length; ++i) {
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
                setText((currentSeat.from || "n/a"))
        } catch (err) {
            console.log(err)
        }
        try {
            form.getTextField(`bus_number`).
                setText((String(currentSeat._id) || "n/a"))
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
        const pdfBytes = await pdfDoc.save()
        // error here 
        await writeFile(path.join(_path, id + ".pdf"), pdfBytes);
        try {

            await res.sendFile(path.join(_path, id + ".pdf"),
                null,

                function (err) {
                    res.end();
                    if (err) {

                        console.log(err, "391")
                        // throw err
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
        } catch (err) {
            console.log("causes the server to stop : ", err)

        }
    }
    catch (err) {
        console.log(err)
    }

}

module.exports = {
    createSeat,
    getStaticSeat,
    getAllSeats,
    updateSeat,
    updateSeatBus,
    getSpecificSeat,
    specificTicketId,
    downloadboarderaux,
    ticketassociatedWithBus
}