const { mongoose, Mongoose } = require("mongoose")

const { BadRequestError } = require("../error");
const Ticket = require("../models/Ticket");
const moment = require("moment");
// const { Schema } = require("mongoose");
const createTicket = async (req, res) => {
  const {
    body,
    userInfo: { _id },
  } = req;
  const obj = {
    createdBy: _id,
    ...body,
  };
  const ticket = await Ticket.create({ ...obj });
  res.status(200).json({
    ticket,
  });
};
const editTicket = async (req, res) => {
  const { id } = req.params
  const isTicket = await Ticket.findOne({
    _id: id
  });
  if (!isTicket) {
    throw BadRequestError("cannot find ticket with this id " + id);
  }
  var isTicketAlreadyRedeem = await Ticket.findOne({
    _id: id,
    active: false
  })
  if (isTicketAlreadyRedeem) {
    throw BadRequestError("this ticket is already redeem  " + id)
  }
  const isEdited = await Ticket.findOneAndUpdate(
    { _id: id },
    { active: false },
    { new: true }
  );
  if (!isEdited) {
    throw BadRequestError("fail to update ticket");
  }
  console.log(isEdited)
  res.status(200).json({
    status: true,
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
      console.log("the user send an inv")
      throw BadRequestError("please send a valid for to get the ticket");
    }
    return res.status(200).json({
      ticket,
      admin: true
    });
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
    ticket,
  });
};

const userTickets = async (req, res) => {
  const { userInfo } = req
  const {
    createdBy,
    sort,
    ticketStatus, daterange }
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

  // const getPrices = (arr) => {
  //   if (arr?.length == 0) return 0
  //   return arr?.
  //     map(({ price }) => price)
  //     .reduce((acc, next) => {
  //       return acc ? acc + next : next
  //     })
  // }

  const { search,
    createdBy,
    sort,
    ticketStatus, daterange, price }
    =
    req.query;
  const queryObject = {
  }


  if (search) {
    console.log("searching here and the code for the code ", search)
    queryObject.$or = [
      {
        fullname: {
          $regex: search, $options: "i"
        }
      },
      // {
      //   from: {
      //     $regex: search, $options: "i"
      //   },
      // }
    ]
  }
  var delCreatetBy = {}
  if (price) {
    delCreatetBy.price = {
      $eq: Number(price) || 0
    }
    queryObject.price = {
      $eq: Number(price) || 0
    }
  }
  if (createdBy && req.admin === true) {


    delCreatetBy = {
      ...queryObject
    }
    queryObject.createdBy = createdBy;

    delCreatetBy.$expr = {
      $eq: ['$createdBy', { $toObjectId: createdBy }]
    }
    console.log(delCreatetBy)

  }
  if (req.userInfo?._id && !createdBy) {
    queryObject.createdBy = req.userInfo._id
  }
  if (daterange) {
    const [startdate, endDate] = daterange.
      split(",").
      map(arr => arr.split("="))
      .map(([v, t]) => {
        return {
          [v]: t
        }
      })
    if ("start" in startdate && "end" in endDate) {
      const getPreviousDay = (date) => {
        const previous = new Date(date.getTime());
        previous.setDate(date.getDate() + 1);
        return previous
      }
      if (startdate.start != "null" && endDate.end != "null") {
        // console.log("date in correct format: ", endDate.end || "no enddate passed")
        // console.log(endDate.end)
        try {
          var createdAt = {
            $gte: new Date(startdate.start),
            $lte: getPreviousDay(new Date(endDate.end)),
          }
          delCreatetBy.createdAt = createdAt
          queryObject.createdAt = createdAt
          // console.log(delCreatetBy,"enter here")

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


  // const totaltickets = await Ticket.find(queryObject,
  //   { _id: 0, price: 1, active: 1 });
  // console.log(queryObject)
  if (delCreatetBy?.sort) delete deleteTicket.sort
  const nDoc = await Ticket.countDocuments(queryObject);

  var [totalActivePrice, totalInActivePrice] = (await Ticket.aggregate([{
    $match: {
      ...delCreatetBy,
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
  // console.log(totalActivePrice, totalInActivePrice, "this is here")
  if (totalActivePrice) {
    // console.log("active price")
    const { _id } = totalActivePrice;
    // console.log(temp, "temp here")
    if (_id == false) {
      var temp = totalActivePrice
      totalActivePrice = {}
      totalInActivePrice = temp

    }


  }
  // if (totalActivePrice && "_id" in totalActivePrice) {
  //   totalActivePrice = totalActivePrice
  // }
  // const totalActiveTickets = totaltickets.filter(({ active }) => active === true);
  // const totalActivePrice = getPrices(totalActiveTickets);
  // const totalInActiveTickets = totaltickets.filter(({ active }) => active === false);
  // const totalInActivePrice = getPrices(totalInActiveTickets)
  console.log(totalActivePrice, "jihf safh giugfiu gui")
  const _length = (totalActivePrice?.total || 0) + (totalInActivePrice?.total || 0)
  const numberOfPages = Math.ceil(_length / limit);

  console.log(nDoc, totalActivePrice, totalInActivePrice)

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
module.exports = {
  create: createTicket,
  edit: editTicket,
  getTickets,
  userTickets,
  getTicket,
  deleteTicket,
};
