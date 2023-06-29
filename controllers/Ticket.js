const qrcode = require("qrcode");
const path = require("path")
const fs = require("fs")
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { readFile, writeFile } = require("fs/promises");
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

  const {
    body,
    userInfo: { _id },
  } = req;
  const obj = {
    createdBy: _id,
    ...body,
  };


  const lettodaydate = formatDate(new Date()).date
  const ticketTravelDate = formatDate(req.body.traveldate).date;
  // since we dont trust the client when need to check the two dates
  if ((dayjs(ticketTravelDate).diff(lettodaydate, "day")) < 0) {
    throw BadRequestError(`fail cause the user is trying to back date the date`)
  }

  const ticket = await Ticket.create({ ...obj });
  res.status(200).json({
    ticket,
  });
};
const editTicket = async (req, res) => {
  const { id } = req.params
  const { index } = req.query
  if (index && !([1, 2].some(x => x == index))) {
    throw BadRequestError("something went wrong try again later ");
  }
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
  var ticket = null;
  const {
    params: { id },
  } = req;
  if (!req.userInfo) {
    // the user is the admn of the pagge let him get the user information
    ticket = await Ticket.findOne({
      _id: id,
    });
    if (!ticket) {
      throw BadRequestError("please send a valid for to get the ticket");
    }

    res.status(200).json({
      ticket
    });
    return
  }
  ticket = await Ticket.findOne({
    createdBy: req.userInfo._id,
    _id: id,
  });
  if (!ticket) {
    console.log("the user send an invalid id to get a ticket");
    throw BadRequestError("please send a valid for to get the ticket");
  }

  res.status(200).json({
    // ticket: toJson("doubletripdetails", ticket)
    ticket
  });
  return
};

const userTickets = async (req, res) => {
  const { userInfo } = req
  const {
    createdBy,
    sort,
    ticketStatus, daterange,
    triptype

  }
    =
    req.query;

  const queryObject = {
    createdBy: req.userInfo._id
  }
  consol.log(triptype, "hijgijoagsdf a som cod h")
  if (ticketStatus && ticketStatus !== "all") {
    if (ticketStatus == "active") {
      queryObject.active = true
    }
    if (ticketStatus == "inactive") {
      queryObject.active = false
    }
  }
  if (triptype && triptype !== "all") {
    queryObject.type = triptype
    console.log("hoahdfa 9pidsohfoijhasd ifuiadsgiou da")
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
    daterange, price,
    boardingRange,
    triptype
  }
    =
    req.query;
  const queryObject = {
  }

  if (triptype && triptype !== "all") {
    queryObject.type = triptype
  }
  var delCreatetBy = {}

  if (search) {

    queryObject.$or = [
      {
        fullname: {
          $regex: decodeURIComponent(search), $options: "i"
        }
      },
    ]
    delCreatetBy.$or = [
      {
        fullname: {
          $regex: decodeURIComponent(search), $options: "i"
        }
      },
    ]

  }
  if (price) {
    delCreatetBy.price = {
      $eq: Number(price) || 0
    }
    queryObject.price = {
      $eq: Number(price) || 0
    }
  }
  if (createdBy && req.admin === true) {
    console.log("enter in here ok")

    delCreatetBy = {
      ...queryObject
    }

    delCreatetBy.$expr = {
      $eq: ['$createdBy', { $toObjectId: createdBy }]
    }
    queryObject.$expr = {
      $eq: ['$createdBy', { $toObjectId: createdBy }]
    }
    console.log(delCreatetBy)

  }
  if (req.userInfo?._id && !createdBy) {
    queryObject.$expr = {
      $eq: ['$createdBy', { $toObjectId: req.userInfo?._id }]
    }

    delCreatetBy.$expr = {
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
          delCreatetBy.createdAt = createdAt
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
        delCreatetBy.createdAt = createdAt
      }
    }

  }
  if (boardingRange) {
    const decoded = decodeURIComponent(boardingRange)
    console.log(decoded)
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
          delCreatetBy.traveldate = traveldate
          queryObject.traveldate = traveldate

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
        delCreatetBy.traveldate = traveldate
      }
    }

  }
  if (ticketStatus && ticketStatus !== "all") {
    if (ticketStatus == "active") {
      queryObject.active = true
      delCreatetBy.active = true
    }
    if (ticketStatus == "inactive") {
      queryObject.active = false
      delCreatetBy.active = false
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
  const ticket = await Ticket.findOne({ _id: req.params.id });
  if (ticket) {
    await ticket.deleteOne();
  }
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


  const url = `https://ntaribotaken.vercel.app/dashboard/${id}?admin=true&sound=true`

  const _path = path.resolve(__dirname, "../tickets")
  try {
    const pdfDoc = await PDFDocument.load(await readFile(path.join(_path, "sample.pdf")));
    const fileNames = pdfDoc.getForm().getFields().map(f => f.getName())
    const form = pdfDoc.getForm()
    form.getTextField("Name").setText(ticket.fullname)
    form.getTextField("Address").setText(ticket.from)
    const pdfBytes = await pdfDoc.save();
    await writeFile(path.join(_path, ticket._id + ".pdf"), pdfBytes);
  } catch (err) {
    console.log(err);
  }
  qrcode.toFile(path.join(_path, "qr2.png"),
    url, {
    type: "terminal"
  }, async function (err, code) {
    if (err) return console.log(err)
    try {


      const pdfDoc = await PDFDocument.load(await readFile(path.join(_path, "sample.pdf")));
  
      const page = pdfDoc.getPage(0)
      // const { width, height } = page.getSize()
      let img = fs.readFileSync(path.join(_path, "qr2.png"));
      img = await pdfDoc.embedPng(img)
      img.scale(1)
      page.drawImage(img, {
        x: 100,
        y: 200,

      })
      const pdfBytes = await pdfDoc.save()
      await writeFile(path.join(__dirname, "ticket._id " + ".pdf"), pdfBytes);


      // console.log(code)
      res.sendFile(path.join(_path, ticket._id + ".pdf"), {}, function (err) {
        if (err) {
        console.log(err)
          throw err
        }
        else {
          if (fs.existsSync(path.join(_path, "qr2.png"))) {
            try {
              fs.unlinkSync(path.join(_path, "qr2.png"))
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
module.exports = {
  create: createTicket,
  edit: editTicket,
  getTickets,
  userTickets,
  getTicket,
  deleteTicket,
  downloadsoftcopyticket
};
