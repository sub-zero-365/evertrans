const mongoose = require('mongoose');

const User = require("../models/User")
const qrcode = require("qrcode");
const path = require("path")
const checkPermissions = require("../utils/checkPermission")
const fs = require("fs")
const { PDFDocument, degrees, StandardFonts, rgb } = require("pdf-lib");
const { readFile, writeFile } = require("fs/promises");
const Seat = require("../models/Seat")
const day = require("dayjs")

const {
  BadRequestError,
  NotFoundError,
  UnethenticatedError
} = require("../error");
const toJson = require("../utils/toJson");
const dayjs = require("dayjs")
const Ticket = require("../models/Ticket");
const { toString } = require('express-validator/src/utils');
const { USER_ROLES_STATUS } = require('../utils/constants');
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

    const isUser = await User.findOne({ _id: req.user?.userId });
    if (!isUser) throw BadRequestError("coudnot find user please login again");
    req.body.createdBy = req.user?.userId
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
  const demo_id = "64ce0086f793d0001861d076";

  if (!user) throw BadRequestError("Login as Assistant to validate tickets")
  // const { fullname,
  //   _id: assistant_id
  // } = await checkPermissions(user.id)
  const { fullname, _id: assistant_id } = req?.user &&
    await User.findOne({ _id: user?.userId })


  let isString = req.isString || false;
  // let searchQuery = isString ? { id: req.params.id } : { _id: req.params.id }
  const { id } = req.params
  const { index } = req.query
  console.log({ [isString ? "id" : "_id"]: id })
  var isTicket = await Ticket.findOne({
    // ...searchQuery
    [isString ? "id" : "_id"]: id
  });
  // console.log("ticket seatid ", isTicket.seat_id, demo_id)
  if (toString(isTicket.seat_id) === demo_id) throw BadRequestError("This ticket does not have a bus seat ,please go get a bus seat before validating the ticket");

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
          [isString ? "id" : "_id"]: id

        }
        , {
          // ...tempObj,
          $set: {
            doubletripdetails: arr,
            active: index == 2 ? false : true

          },
          $push: {
            editedBy: {
              full_name: fullname,
              user_id: assistant_id,
              date: new Date(),
              action: index == 1 ? "Remove first trip from ticket " : "remove second trip from ticket and makes the ticket invalide"
            }
          }
        }

        , { new: true })
      // await Assistant.findOne({})
      return res.status(200).json({ updateTicket: updatevalue })
    }
    catch (err) {
      console.log(err)
      throw BadRequestError("fail to update ")

    }
  }


  const isEdited = await Ticket.findOneAndUpdate(
    { [isString ? "id" : "_id"]: id },

    {
      $set: {
        active: false,
      },
      $push: {
        editedBy: {
          full_name: fullname,
          user_id: assistant_id,
          date: new Date(),
          action: "Remove validity from ticket  makes the ticket invalid"
        }
      }
    },
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
  let isString = req.isString || false;

  const {
    params: { id },
  } = req;
  if (isString) {
    ticket = await Ticket.findOne({
      id
    });

  } else {
    ticket = await Ticket.findOne({
      _id: id
    });
  }

  if (!ticket) {
    throw BadRequestError("please send a valid for to get the ticket");
  }
  // this get all ticket if you didnit create it 
  const createdBy = (await User.findOne({ _id: ticket.createdBy })
    .select("fullname"))?.fullname || "n/a";
  let busname = await Seat.findOne({
    _id: ticket?.seat_id
  }).select("bus")
  busname = busname?.bus || "n/a"
  // console.log("this is the bus name associated with the seat ", busname)
  const usernameticket = ticket?.toJSON();
  const { id: ticket_id, _id } = usernameticket
  usernameticket.username = createdBy;
  usernameticket.busdetails = busname
  usernameticket._id = ticket_id ?? _id
  let url = null;
  if (process.env.NODE_ENV === "production") {
    url = `${process.env.clientBaseUrl}/assistant/${usernameticket._id}`
  } else {
    url = `http://192.168.43.68:3000/assistant/${usernameticket._id}`

  }
  res.status(200).json({
    ticket: usernameticket,
    scanUrl: url
  });

};

// 

const getTickets = async (req, res) => {
  const { search,
    createdBy,
    sort,
    ticketStatus,
    daterange,
    boardingRange,
    triptype,
    traveltime,
    paymenttype
  }
    =
    req.query;
  const queryObject = {
  }
  if (paymenttype && paymenttype !== "all") {
    queryObject.paymenttype = paymenttype
  }
  if (triptype && triptype !== "all") {
    queryObject.type = triptype
  }
  if (traveltime) {
    queryObject.traveltime = traveltime
  }
  if (search) {
    // console.log(decodeURIComponent(search).split("+").join(" "))
    queryObject.$or = [
      {
        fullname:
        {
          $regex: decodeURIComponent(search).split("+").join(" ").trim(), $options: "i"
        }

      },

    ]

  }
  if (createdBy && ["admin", "sub_admin"].some(role => role.includes(req?.user?.role))) {
    queryObject.createdBy = new mongoose.Types.ObjectId(createdBy)
  }
  if (req?.user?.role == "ticket") queryObject.createdBy = new mongoose.Types.ObjectId(req?.user?.userId)


  if (req?.user?.role === "sub_admin" && !createdBy) {
    let users_ids = await User.find({ createdBy: req.user.userId }).select("_id");

    users_ids = users_ids.map(({ _id }) => _id.toString());


    delete queryObject.createdBy
    queryObject.ticket_id = {
      $in: [...users_ids
      ]
    }

  }

  // if (createdBy && req?.admin?.role === "admin") {
  //   queryObject.createdBy = new mongoose.Types.ObjectId(createdBy)
  //   // queryObject.$expr = {
  //   //   $eq: ['$createdBy', { $toObjectId: createdBy }]
  //   // }
  // }
  // if (createdBy && req?.admin?.role === "user") {
  //   // use is in here after implentation
  //   queryObject.createdBy = new mongoose.Types.ObjectId(createdBy)


  // }
  // if (req?.admin?.role === "user" && !createdBy) {

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
    // console.log(ticketStatus)
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
  console.log("this is the queryobject here", queryObject)
  const removeticket_id = {
    ...queryObject

  }
  if (removeticket_id.ticket_id) {
    delete removeticket_id.ticket_id;
    let users_ids = await User.find({ createdBy: req.user.userId }).select("_id");
    users_ids = users_ids.map(({ _id }) => new mongoose.Types.ObjectId(_id));
    removeticket_id.createdBy = {
      $in: [
        ...users_ids
      ]
    }

  }
  console.log("this is the queryobject for tickets", req.query, queryObject)
  const sortKey = sortOptions[sort] || sortOptions.newest;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const skip = (page - 1) * limit;
  const tickets = await Ticket.find(removeticket_id)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  if (queryObject?.sort) delete deleteTicket.sort

  const nDoc = await Ticket.countDocuments(removeticket_id);

  var [totalActivePrice, totalInActivePrice,] = (await Ticket.aggregate([
    {
      $addFields: {
        customerPhone: {
          $toString: "$phone"
        }
      }
    },
    {
      $addFields: {
        ticket_id: {
          $toString: "$createdBy"
        }
      }
    }
    , {

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
  ))?.sort((a, b) => b._id - a._id);
  // this help for calculating the updated price when a user update a ticket from normal class to vip class
  if (createdBy && req.admin === true) {
    delete queryObject.$expr
    queryObject.updatedBy = new mongoose.Types.ObjectId(createdBy)

  }

  // if (queryObject.$expr && req.userInfo?._id && !createdBy) {
  //   delete queryObject.$expr
  //   queryObject.updatedBy = new mongoose.Types.ObjectId(req.userInfo._id)
  // }

  const _tmp = queryObject.daterange
  if (queryObject.boardingRange) delete queryObject.boardingRange;
  if (queryObject.daterange) delete queryObject.daterange;
  queryObject.updatedDate = _tmp

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

  // ticket start here



  var createdBy_ = {}
  if (queryObject.createdBy) createdBy_.createdBy = queryObject.createdBy

  else {
    if ((USER_ROLES_STATUS.sub_admin === req?.user?.role)&& !createdBy) {
      let users_ids = await User.find({ createdBy: req.user.userId }).select("_id");
      users_ids = users_ids.map(({ _id }) => _id.toString());
      createdBy_.createdBy = {
        $in: [...users_ids]
      }
    }
  }
  // console.log("checking if the is a createdby",quer)
  console.log("this is the created by here", createdBy_)
  let monthlyApplications = await Ticket.aggregate([
    { $match: { ...createdBy_ } },

    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);
  console.log("tickets stats here", monthlyApplications)

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format('MMM YY');

      return { date, count };
    })
    .reverse();
  console.log("this is the multiplicatio data here", monthlyApplications)

  // endhere



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
      monthlyApplications

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
    url = `https://evertrans.vercel.app/assistant/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`
  } else {
    url = `http://192.168.43.68:3000/assistant/${id}?sound=true&xyz=secret&readonly=7gu8dsutf8asdf&render_9368&beta47`

  }
  const _path = path.resolve(__dirname, "../tickets")

  const createdBy = (await User.findOne({ _id: ticket.createdBy }).select("fullname"))?.fullname || "n/a";
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
      const { fullname, traveldate, traveltime, seatposition, from, to, type, _id, id, bus, price, updatePrice } = ticket.toJSON()
      try {
        // console.log(fileNames)
        form.getTextField("fullname").
          setText(fullname)
        form.getTextField("traveldate").
          setText(dayjs(traveldate || new Date()).format("dddd, MMMM D, YYYY"))
        form.getTextField("seatposition").
          setText(`${seatposition + 1}`)
        form.getTextField("createdby").
          setText(createdBy)
        form.getTextField("bookingId").
          setText(`${id}`)
        form.getTextField("from").
          setText(from)
        form.getTextField("to").
          setText(to)
        form.getTextField("price").
          setText(`${price + (updatePrice ? updatePrice : 0)} frs`)
        if (type == "singletrip") {
          form.getTextField("triptype").
            setText(`singletrip`)
        }
        if (type == "roundtrip") {
          form.getTextField("triptype").
            setText(`roundtrip`)
        }
        const fontSize = 40
        page.drawText(`${id ? id : _id}`, {
          x: width - 30,
          y: (height / 2) - (fontSize * 8) / 2,
          size: fontSize,
          color: rgb(0, 1, 0),
          rotate: degrees(90)
        })
        form.flatten()
      } catch (err) {
        console.log(err)
      }

      let img = fs.readFileSync(path.join(_path, "qr2.png"));
      let logo = fs.readFileSync(path.join(_path, "logo.png"))
      img = await pdfDoc.embedPng(img)
      logo = await pdfDoc.embedPng(logo)
      img.scaleToFit(100, 100)
      img.scale(1)
      logo.scaleToFit(100, 100)
      logo.scale(1)
      page.drawImage(img, {
        x: (width / 2) - 155,
        y: height - 340,
        width: 310,
        height: 310
      })
      // page.drawImage(logo, {
      //   x: (width / 2) - 155,
      //   y: height - 140,
      //   width: 310,
      //   height: 310
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

  // if (!req?.userInfo?._id) {
  //   throw UnethenticatedError("you are not authorized to perform this operation ")
  // }
  const requestedUser = await User.findOne({ _id: req?.user?.userId })
  if (!requestedUser) {
    throw BadRequestError("fail to find user")
  }
  const {
    fullname,
    _id: user_id
  } = requestedUser;
  const {
    traveldate,
    traveltime,
    seatposition,
    seat_id,
    from,
    to
  } = req.body

  // console.log(req.body)
  const { id: _id } = req.params;
  let ticket_seatposition = null;
  let ticket_id = null
  let ticket_updatedPrice = null
  const isTicket = await Ticket.findOne({
    _id,
    active: true
  })
  // console.log("this is the seat id here", seat_id)
  if (!isTicket) {
    throw BadRequestError(`cannot find ticket with ${_id} and status ${active} `)
  }
  ticket_seatposition = isTicket.toJSON().seatposition
  ticket_id = isTicket.toJSON().seat_id
  const ticket_bus = isTicket?.bus?.bus
  console.log("this is ticket seat position here", ticket_seatposition)

  console.log("seat position", ticket_seatposition, Number(ticket_seatposition), seat_id)
  let seat = await Seat.findOne({
    // "seat_positions._id": Number(ticket_seatposition),
    _id: seat_id
  })
  if (!seat) throw BadRequestError("coudnot find seat");
  // return res.send("ok")
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


  if (!seat) {
    console.log("seat not found", seat)
  }
  const updateObj = {};


  console.log("this is the ticket here",
    isTicket, "this is the seatposition here ",
    seatposition, ticket_updatedPrice)
  // const condition = ticket_seatposition < 20 && seatposition < 19 && isTicket?.price <= 6500 && (ticket_updatedPrice != null || ticket_updatedPrice == 0)

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


  const isUpdate = await Ticket.findOneAndUpdate({ _id }, {
    ...updateObj,
    $push: {
      editedBy: {
        full_name: fullname,
        user_id,
        date: new Date(),
        action: ` ${fullname} Transfer Ticket From ---seat_id ||${ticket_id}|| --  to seat_id ||${seat_id}||`,
        transferseatdetail: {
          previousSeatId: ticket_id,
          currentSeatId: seat_id
        }
      }
    }
  });
  console.log("updated ticket", isUpdate)
  if (!isUpdate) throw BadRequestError("fail to update ticket");
  res.status(200).
    json({ status: true })
}

const getTicketForAnyUser = async (req, res) => {
  const queryObject = {}
  const {
    id,

  } = req.body
  var ticket = null;
  let isString = req.isString || false;
  console.log("isString", isString)
  if (!id) throw BadRequestError("no id")
  if (req.isString) {
    if (id) {
      queryObject.id = id?.trim()

    }


  } else {
    if (id) {
      queryObject.$expr = {
        $eq: ['$_id', { $toObjectId: id }]
      }
    }
  }


  ticket = await Ticket.findOne(queryObject);
  if (ticket) {
    res.status(200).json({
      ticket
    })
  }
  if (!ticket) throw NotFoundError(`No ticket with information ${id}`)
}

const removeSeatIdFromTicket = async (req, res) => {

  const { seatposition, seat_id } = req.body;
  // const { id: _id } = req.params;
  let ticket = await Ticket.findOne({
    seat_id,
    seatposition,
    active: true
  })
  if (!ticket) throw BadRequestError("fail top update ticket")
  const demo_id = "64ce0086f793d0001861d076";
  console.log("user edited box", req.body)
  let seat = await Seat.findOneAndUpdate({
    "seat_positions._id": Number(seatposition),
    _id: seat_id
  }
    ,
    {
      $set: {
        "seat_positions.$.isReserved": false,
        "seat_positions.$.isTaken": false,
      }
    }
    , {

      new: true
    }
  )
  if (!seat) throw BadRequestError("fail to update seat")

  await Ticket.findOneAndUpdate({
    seat_id,
    seatposition
  },
    {
      "$set": {
        seat_id: demo_id
      }
    }
  )

  res.status(200).json({ status: true })
}

const getRankUsers = async (req, res) => {
  const { quickdatesort, search, numberFilter } = req.query
  const queryObject = {}
  if (numberFilter) {
    queryObject.customerPhone = { $regex: decodeURIComponent(numberFilter).split("+").join(" ").trim(), $options: "i" }
  }
  if (search) {
    // console.log(decodeURIComponent(search).split("+").join(" "))
    queryObject.$or = [
      {
        fullname: {
          $regex: decodeURIComponent(search).split("+").join(" ").trim(), $options: "i"
        }
      },

    ]

  }
  if (quickdatesort) {
    queryObject.createdAt = {
      $gte: new Date(quickdatesort),
      // $lte: getPreviousDay(new Date(endDate.end)),
    }


  }
  console.log("this i quick date sort", quickdatesort,
    queryObject, req.query)
  const uniqueNumbers = await Ticket.distinct("phone", queryObject)
  const rankUsers = await Ticket.aggregate([
    {
      $addFields: {
        customerPhone: {
          $toString: "$phone"
        }
      }
    }
    ,
    {

      $match: {
        ...queryObject
      }
    }, {
      $group: {
        _id: "$phone",
        sum: { $sum: "$price" },
        total: { $sum: 1 },
        fullname: {
          $first: "$fullname"
        },
        age: {
          $first: "$age"
        },
        sex: {
          $first: "$sex"
        },
        phone: {
          $first: "$phone"
        },
        idcardnumber: {
          $first: "$email"
        },
      }
    },
    {
      $project: {
        sum: 1,
        total: 1,
        _id: 1,
        idcardnumber: 1,
        fullname: 1, age: 1, sex: 1,
        phone: 1
      }
    },
    { $sort: { total: -1 } }]).limit(10)
  console.log("this is the most ranked users of all times ", rankUsers)
  res.status(200).json({
    rankUsers,
    nHits: uniqueNumbers.length
  })

}
const showStats = async (req, res) => {
  let stats = await Mail.aggregate([
    { $match: {/* createdBy: new mongoose.Types.ObjectId(req.userInfo?._id) */ } },
    { $group: { _id: '$ticketStatus', count: { $sum: 1 } } },
  ]);
  console.log("this is the user query here ,", stats)

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});
  console.log("this is the reduce stat here", stats)

  const defaultStats = {
    pending: stats.pending || 0,
    sent: stats.sent || 0,
    recieved: stats.recieved || 0,
  };

  let monthlyApplications = await Ticket.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.userInfo?._id) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);
  console.log("this  multiplication stats here", monthlyApplications)

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format('MMM YY');

      return { date, count };
    })
    .reverse();
  console.log("this is the multiplicatio data here", monthlyApplications)

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
module.exports = {
  getTicketForAnyUser,
  create: createTicket,
  edit: editTicket,
  getTickets,
  getTicket,
  deleteTicket,
  downloadsoftcopyticket,
  editTicketMeta,
  removeSeatIdFromTicket,
  getRankUsers
};
