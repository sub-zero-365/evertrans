
const User = require("../models/User")
const qrcode = require("qrcode");
const path = require("path")
const checkPermissions = require("../utils/checkPermission")
const fs = require("fs")
const { PDFDocument, degrees, StandardFonts, rgb } = require("pdf-lib");
const { readFile, writeFile } = require("fs/promises");
const Bus = require("../models/Bus")
const Seat = require("../models/Seat")
const Assistant = require("../models/Assistant")
const {
  BadRequestError,
  NotFoundError
} = require("../error");
const toJson = require("../utils/toJson");
const dayjs = require("dayjs")
const Ticket = require("../models/Ticket");
function formatDate(date = new Date()) {
  const formateDate = new Date(date);
  return {
    date: formateDate.toLocaleDateString('en-ZA'),
    time: formateDate.toLocaleTimeString('en-ZA'),
  }
}
const createTicket = async (req, res) => {
  var seat_id = null
  try {
    const { seatposition: seat_number, seat_id: id } = req.body;
    const isSeat = await Seat.findOne({
      _id: id
    })
    if (!isSeat) {
      throw BadRequestError("invalid Seat id")
    }
    console.log(req.userInfo)
    const isUser = await User.findOne({ _id: req.userInfo });
    if (!isUser) throw BadRequestError("coudnot find user please login again");
    req.body.createdBy = req.userInfo._id
    req.body.seat_id = isSeat._id
    const ticket = await Ticket.create(req.body);
    seat_id = ticket.toJSON()._id
    const seat = await Seat.findOne({
      "seat_positions._id": Number(seat_number),
      _id: id
    })
    if (!seat) throw BadRequestError("couldnot found bus with id " + id)
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
          "seat_positions.$.isTaken": true,
          // "seat_positions.$.ticket_id": buscreatedid,
        }
      }
      , {
        new: true
      }
    )
    console.log("updated value", updatedid?.seat_positions)
    res.status(200)
      .json({ state: true })

  } catch (err) {
    console.log(err.message,
      err.statuscode)
    Ticket.findOneAndDelete({ _id: seat_id }).
      then((data) => {
        console.log("every thing ok")
        return res.status((err.statuscode || 500)).send(
          err.message
        )
      }).catch(err => {
        console.log(err)
        return res.status(500).send("something went wrong try again")
      })

  }
};

const editTicket = async (req, res) => {
  const user = req.user;
  // console.log("user id", user)
  if (!user) throw BadRequestError("Login as Assistant to validate tickets")
  await checkPermissions(user.id)


  const { id } = req.params
  const { index } = req.query
  var isTicket = await Ticket.findOne({
    _id: id,

  });
  if (!isTicket) {
    throw NotFoundError("cannot find ticket with this id " + id);
  }
  if (isTicket.active == false) {
    throw BadRequestError("this ticket is already redeem  " + id)
  }
  const lettodaydate = formatDate(new Date()).date
  const ticketTravelDate = formatDate(isTicket.traveldate).date;

  if ((dayjs(ticketTravelDate).diff(lettodaydate, "day")) > 0) {
    throw BadRequestError(`This errors cause you are trying to validate a ticket on the ${formatDate(new Date()).date}  when the  travel date is 
      ${formatDate(isTicket.traveldate).date}   please come back on the ${formatDate(isTicket.traveldate).date} date to travel thanks `)
  }
  // prevent further action
  if (isTicket && isTicket.type &&
    isTicket.type === "roundtrip" &&
    isTicket?.doubletripdetails &&
    typeof (isTicket?.doubletripdetails) === "object" && [1, 2]
      .some(x => x == index)) {
    var tempObj = JSON.parse(JSON.stringify(isTicket))
    const arr = tempObj?.doubletripdetails
    if (index == 1 && arr[0]) {
      const { active } = arr[0]
      if (active !== true) {
        throw BadRequestError(`fail to update ticket cause ticket was updated at ${arr[0].updatedAt} and the active status is ${arr[0].active} `)
      }
      if (active == true) {
        arr[0].active = false;
        arr[0].updatedAt = new Date()
      }
      tempObj = {
        ...tempObj,
        doubletripdetails: arr
      }
    }
    if (index == 2 && arr[1]) {
      if (arr[0].active == true) {
        throw BadRequestError(`please you cant validate the return trip without validating the start trip `)
      }
      const { active } = arr[1]
      if (active !== true) {
        throw BadRequestError(`fail to update ticket cause ticket was updated at ${arr[1].updatedAt} and the active status is ${arr[1].active} `)
      }
      if (active == true) {
        arr[1].active = false;
        arr[1].updatedAt = new Date();

      }
      // is active is set to false cause the trip was successfully 
      tempObj = {
        ...tempObj,
        doubletripdetails: arr,
        active: false
      }
    }
    try {
      const updatevalue = await Ticket.findOneAndUpdate(
        {
          _id: id,

        }
        , {
          ...tempObj
        }, { new: true })
      // await Assistant.findOne({})
      return res.status(200).json({ updateTicket: updatevalue })
    }
    catch (err) {
      console.log(err)
      throw BadRequestError("fail to update ")

    }
  }


  const isEdited = await Ticket.findOneAndUpdate(
    { _id: id },
    { active: false },
    { new: true }
  );
  if (!isEdited) {
    throw BadRequestError("fail to update ticket");
  }

  res.status(200).json({
    status: true,
    updateTicket: isEdited
  });
};
const getTicket = async (req, res) => {
  // new implentation here//change the code to make  please the client
  var ticket = null;
  const {
    params: { id },
  } = req;

  if (!req.userInfo) {

    // the user is the admn of the pagge let him get the user information
    // any register person can read and write the ticket
    ticket = await Ticket.findOne({
      _id: id,
    });
    if (!ticket) {
      console.log()
      throw BadRequestError("please send a valid for to get the ticket");
    }
    const createdBy = (await User.findOne({ _id: ticket.createdBy }).select("fullname")).fullname;
    // console.log(createdBy)
    const usernameticket = ticket?.toJSON();
    usernameticket.username = createdBy;
    res.status(200).json({
      ticket: usernameticket
    });
    return
  }
  ticket = await Ticket.findOne({
    // createdBy: req.userInfo._id,
    _id: id,
  });
  if (!ticket) {
    throw BadRequestError("please send a valid for to get the ticket");
  }

  // this get all ticket if you didnit create it 
  const createdBy = (await User.findOne({ _id: ticket.createdBy })
    .select("fullname")).fullname;
  const usernameticket = ticket?.toJSON();
  usernameticket.username = createdBy;
  res.status(200).json({
    ticket: usernameticket
  });
  return
};

const userTickets = async (req, res) => {
  const { userInfo } = req
  const {
    createdBy,
    sort,
    ticketStatus,
    daterange,
    triptype,
    traveltime

  }
    =
    req.query;

  const queryObject = {
    createdBy: req.userInfo._id
  }
  if (ticketStatus && ticketStatus !== "all") {
    if (ticketStatus == "active") {
      queryObject.active = true
    }
    if (ticketStatus == "inactive") {
      queryObject.active = false
    }
  }
  if (triptype && triptype !== "all" && ["roundtrip", "singletrip"].some(x => x == triptype)) {
    queryObject.type = triptype
  }
  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    new_traveldate: "-traveldate",
    old_traveldate: "traveldate",

  }

  const sortKey = sortOptions[sort] || sortOptions.newest;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const skip = (page - 1) * limit;
  const tickets = await Ticket.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit)
  const totalTickets = await Ticket.countDocuments(queryObject);
  const alltickets = await Ticket.countDocuments({ createdBy: req.userInfo._id });
  const totalActiveTickets = await Ticket.countDocuments({
    ...queryObject,
    active: true
  });

  const totalInActiveTickets = await Ticket.countDocuments({
    ...queryObject,
    active: false
  });
  // const totalPrice=await Ticket.find(queryObject).select("price").
  const numberOfPages = Math.ceil(totalTickets / limit);

  res.
    status(200).json({
      totalTickets,
      alltickets,
      numberOfPages,
      currentPage: page,
      tickets,
      totalActiveTickets,
      totalInActiveTickets
    })


};

const getTickets = async (req, res) => {

  const { search,
    createdBy,
    sort,
    ticketStatus,
    daterange,
    boardingRange,
    triptype,
    traveltime,
  }
    =
    req.query;
  const queryObject = {
  }

  if (triptype && triptype !== "all") {
    queryObject.type = triptype
  }
  if (traveltime) {
    queryObject.traveltime = traveltime
  }
  if (search) {
    // console.log(decodeURIComponent(search).split("+").join(" "))
    queryObject.fullname =
    {
      $regex: decodeURIComponent(search).split("+").join(" ").trim(), $options: "i"
    }

  }

  if (createdBy && req.admin === true) {
    queryObject.$expr = {
      $eq: ['$createdBy', { $toObjectId: createdBy }]
    }

  }
  if (req.userInfo?._id && !createdBy) {
    queryObject.$expr = {
      $eq: ['$createdBy', { $toObjectId: req.userInfo?._id }]
    }
  }
  if (daterange) {
    const decoded = decodeURIComponent(daterange)
    const [startdate, endDate] = decoded.
      split(",").
      map(arr => arr.split("="))
      .map(([v, t]) => {
        return {
          [v]: t
        }
      });

    if ("start" in startdate && "end" in endDate) {
      const getPreviousDay = (date) => {
        const previous = new Date(date.getTime());
        previous.setDate(date.getDate() + 1);
        return previous
      }
      if (startdate.start != "null" && endDate.end != "null") {
        try {
          var createdAt = {
            $gte: new Date(startdate.start),
            $lte: getPreviousDay(new Date(endDate.end)),
          }
          queryObject.createdAt = createdAt

        } catch (err) {
          console.log(err)
        }


      }
      if (startdate.start != "null" && endDate.end == "null") {

        var createdAt = {
          $gte: new Date(startdate.start),
          $lte: getPreviousDay(new Date(startdate.start)),
        }
        queryObject.createdAt = createdAt
      }
    }

  }
  if (boardingRange) {
    const decoded = decodeURIComponent(boardingRange)
    const [startdate, endDate] = decoded.
      split(",").
      map(arr => arr.split("="))
      .map(([v, t]) => {
        return {
          [v]: t
        }
      });
    if ("start" in startdate && "end" in endDate) {
      const getPreviousDay = (date) => {
        const previous = new Date(date.getTime());
        previous.setDate(date.getDate() + 1);
        return previous
      }
      if (startdate.start != "null" && endDate.end != "null") {
        try {
          var traveldate = {
            $gte: new Date(startdate.start),
            $lte: getPreviousDay(new Date(endDate.end)),
          }
          queryObject.traveldate = traveldate;

        } catch (err) {
          console.log(err)
        }

      }
      if (startdate.start != "null" && endDate.end == "null") {
        var traveldate = {
          $gte: new Date(startdate.start),
          $lte: getPreviousDay(new Date(startdate.start)),
        }
        queryObject.traveldate = traveldate
      }
    }

  }
  if (ticketStatus && ticketStatus !== "all") {
    console.log(ticketStatus)
    if (ticketStatus == "active") {
      queryObject.active = true
    }
    if (ticketStatus == "inactive") {
      queryObject.active = false
    }
  }
  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    new_traveldate: "-traveldate",
    old_traveldate: "traveldate",
  }

  const sortKey = sortOptions[sort] || sortOptions.newest;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const tickets = await Ticket.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);


  if (queryObject?.sort) delete deleteTicket.sort
  const nDoc = await Ticket.countDocuments(queryObject);

  var [totalActivePrice, totalInActivePrice] = (await Ticket.aggregate([{
    $match: {
      ...queryObject,
    }
  }, {
    $group: {
      _id: "$active",
      sum: { $sum: "$price" },
      total: { $sum: 1 },
    }
  }, {
    $project: {
      sum: 1,
      total: 1,
      _id: 1,
      percentage: {
        $cond: [
          { $eq: [nDoc, 0] }, 1, {
            $multiply: [
              { $divide: [100, nDoc || 1] }, "$total"
            ]
          }],

      }
    }
  }]
  ))?.sort((a, b) => b._id - a._id)
  if (totalActivePrice) {
    const { _id } = totalActivePrice;
    if (_id == false) {
      var temp = totalActivePrice
      totalActivePrice = {}
      totalInActivePrice = temp
    }


  }
  const _length = (totalActivePrice?.total || 0) + (totalInActivePrice?.total || 0)
  const numberOfPages = Math.ceil(_length / limit);


  res.
    status(200).json({
      totalPrice: (totalActivePrice?.sum || 0) + (totalInActivePrice?.sum || 0),
      totalActivePrice: totalActivePrice?.sum || 0,
      totalInActivePrice: totalInActivePrice?.sum || 0,
      totalTickets: _length,
      numberOfPages,
      percentageActive: totalActivePrice?.percentage || 0,
      percentageInActive: totalInActivePrice?.percentage || 0,
      currentPage: page,
      totalActiveTickets: totalActivePrice?.total || 0,
      totalInActiveTickets: totalInActivePrice?.total || 0,
      tickets,

    })

};



const deleteTicket = async (req, res) => {

  res.send("delete ticket routes");
};


const downloadsoftcopyticket = async (req, res) => {
  const id = req.params.id;
  const ticket = await Ticket.findOne({
    _id: id,
  });
  if (!ticket) {
    throw BadRequestError("please send a valid for to get the ticket");
  }
  let url = null;
  if (process.env.NODE_ENV === "production") {
    url = `https://ntaribotaken.vercel.app/assistant/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`
  } else {
    url = `http://192.168.43.68:3000/assistant/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`

  }
  const _path = path.resolve(__dirname, "../tickets")
  const createdBy = (await User.findOne({ _id: ticket.createdBy }).select("fullname")).fullname;
  qrcode.toFile(path.join(_path, "qr2.png"),
    url, {
    type: "terminal",
    size: 4
  }, async function (err, code) {
    if (err) return console.log(err)
    try {
      const pdfDoc = await PDFDocument.load(await readFile(path.resolve(__dirname, "../tickets", "sampleticket.pdf")));
      const page = pdfDoc.getPage(0)
      const { width, height } = page.getSize()

      // const fileNames = pdfDoc.getForm().getFields().map(f => f.getName())
      const form = pdfDoc.getForm()
      const { fullname, traveldate, traveltime, seatposition, from, to, type, _id, bus, price } = ticket.toJSON()
      try {
        // console.log(fileNames)
        form.getTextField("fullname").
          setText(fullname)
        form.getTextField("traveldate").
          setText(formatDate(traveldate).date)
        form.getTextField("seatposition").
          setText(`${seatposition + 1}`)
        form.getTextField("createdby").
          setText(createdBy)
        form.getTextField("traveltime").
          setText(traveltime)
        form.getTextField("from").
          setText(from)
        form.getTextField("to").
          setText(to)
        form.getTextField("price").
          setText(`${price} frs`)
        if (type == "singletrip") {
          form.getTextField("triptype").
            setText(`singletrip`)
        }
        if (type == "roundtrip") {
          form.getTextField("triptype").
            setText(`roundtrip`)
        }

        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        let fontSize = 25


        form.flatten()
      } catch (err) {
        console.log(err)
      }

      let img = fs.readFileSync(path.join(_path, "qr2.png"));
      img = await pdfDoc.embedPng(img)
      img.scaleToFit(100, 100)
      console.log(width)
      page.drawImage(img, {
        x: (width / 2) - 155,
        y: height - 340,
        width: 310,
        height: 310
      })
      // page.drawImage(img, {
      //   x: width - 40,
      //   y: height - 40,
      //   width: 40,
      //   height: 40
      // })

      const pdfBytes = await pdfDoc.save()
      await writeFile(path.join(_path, ticket._id + ".pdf"), pdfBytes);
      await res.sendFile(path.join(_path, ticket._id + ".pdf"),
        null,
        function (err) {
          res.end()
          if (err) {
            console.log(err, "391 ticket download")

            // throw err
          }
          else {
            if (fs.existsSync(path.join(_path, "qr2.png")) && fs.existsSync(path.join(_path, ticket._id + ".pdf"))) {
              try {
                fs.unlinkSync(path.join(_path, "qr2.png"));
                fs.unlinkSync(path.join(_path, ticket._id + ".pdf"));
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

  })
}
const editTicketMeta = async (req, res) => {
  const {
    traveldate,
    traveltime,
    seatposition,
    seat_id,
    from,
    to
  } = req.body
  console.log(req.body)
  const { id: _id } = req.params;
  console.log("id of the icket or bus", _id)
  let ticket_seatposition = null;
  let ticket_id = null
  const isTicket = await Ticket.findOne({
    _id,
    active: true
  })
  if (!isTicket) {
    throw BadRequestError(`cannot find ticket with ${_id} and status ${active} `)
  }
  ticket_seatposition = isTicket.toJSON().seatposition
  ticket_id = isTicket.toJSON().seat_id
  console.log("seat position", ticket_seatposition, ticket_id, seatposition)
  let seat = await Seat.findOne({
    "seat_positions._id": Number(ticket_seatposition),
    _id: seat_id
  })
  if (!seat) throw BadRequestError("coudnot find seat");
  if (seat.seat_positions[Number(seatposition)].isTaken == true
    ||
    seat.seat_positions[Number(seatposition)].isReserved == true) {
    throw BadRequestError("oops seat is already taken,please choose another seat thanks")
  }
  seat = await Seat.findOneAndUpdate({
    "seat_positions._id": Number(seatposition),
    _id: seat_id
  }
    ,
    {
      $set: {
        "seat_positions.$.isReserved": true,
        "seat_positions.$.isTaken": false,
      }
    }
    , {

      new: true
    }
  )
  // console.log(ticket_seatposition)
  if (!seat) {
    console.log("seat not found 1", seat)
  }
  seat = await Seat.findOneAndUpdate({
    "seat_positions._id": Number(ticket_seatposition),
    _id: ticket_id
  },
    {
      $set: {
        "seat_positions.$.isTaken": false,
        "seat_positions.$.isReserved": false
      }
    })
  // .catch((err) => console.log("update seat err", err))


  if (!seat) {
    console.log("seat not found", seat)
  }
  const updateObj = {};
  if (traveldate) {
    updateObj.traveldate = traveldate
  }
  if (traveltime) {
    updateObj.traveltime = traveltime
  }
  if (seatposition == Number(0) || seatposition) {
    updateObj.seatposition = seatposition;
  }
  if (seat_id) {
    updateObj.seat_id = seat_id
  }
  if (from) {
    updateObj.from = from
  }
  if (to) {
    updateObj.to = to
  }
  const isUpdate = await Ticket.findOneAndUpdate({ _id }, updateObj);
  if (!isUpdate) throw BadRequestError("fail to update ticket");
  res.status(200).json({ status: true })
}

const getTicketForAnyUser = async (req, res, next) => {
  const queryObject = {}
  const {
    id,
    from,
    to
  } = req.body

  if (id) {
    queryObject.$expr = {
      $eq: ['$_id', { $toObjectId: id }]
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
  const ticket = await Ticket.findOne(queryObject);
  console.log(from, to)
  if (ticket) {
    res.status(200).json({
      ticket
    })
  }
  if (!ticket) throw NotFoundError(`No ticket with information ${id}---${from}---${to}`)

}
module.exports = {
  getTicketForAnyUser,
  create: createTicket,
  edit: editTicket,
  getTickets,
  userTickets,
  getTicket,
  deleteTicket,
  downloadsoftcopyticket,
  editTicketMeta
};
