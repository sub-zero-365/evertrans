const { BadRequestError } = require("../error");
const Ticket = require("../models/Ticket");
const moment = require("moment")
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
  // const {
  //   userInfo: { _id },
  //   query: { filter }
  // } = req;
  // const obj = {};
  // if (filter) {
  //   const canSplitFilter = filter.split(",")
  //   if (canSplitFilter.length != 2) {
  //     console.log("invalid filter option ");
  //     throw BadRequestError("please send a valid date ")
  //   }
  //   else {
  //     const [startdate, endDate] = canSplitFilter;
  //     obj.createdAt = {
  //       $gte: new Date(startdate),
  //       $lte: new Date(endDate),
  //     }
  //   }
  // }
  // const queryObject = {
  //   createdBy: _id,
  //   ...obj
  // }

  // console.log(queryObject)

  // const tickets = await Ticket.find(
  //   {
  //     ...queryObject
  //   },
  //   {
  //     isActive: 0,
  //   }
  // ).sort({ createdAt: -1 });
  // res.status(200).json({
  //   tickets,
  //   nHits: tickets.length,
  // });
  const {
    createdBy,
    sort,
    ticketStatus }
    =
    req.query;
  const queryObject = {
  createdBy:req.userInfo._id
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
  const alltickets = await Ticket.countDocuments({createdBy:req.userInfo._id});
  const totalActiveTickets = await Ticket.countDocuments({
    ...queryObject,
    active: true
  });
  const totalInActiveTickets = await Ticket.countDocuments({
    ...queryObject,
    active: false
  });
  const numberOfPages = Math.ceil(totalTickets / limit);
  res.
    status(200).json({
      totalTickets,
      alltickets
      ,
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
    daterange }
    =
    req.query;
  const queryObject = {
  }
  if (createdBy) {
    // get specific data about a user when pass createdBy
    queryObject.createdBy = createdBy;
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
  const totalActiveTickets = await Ticket.countDocuments({
    ...queryObject,
    active: true
  });
  const totalInActiveTickets = await Ticket.countDocuments({
    ...queryObject,
    active: false
  });
  const numberOfPages = Math.ceil(totalTickets / limit);
  res.
    status(200).json({
      totalTickets,
      numberOfPages,
      currentPage: page,
      tickets,
      totalActiveTickets,
      totalInActiveTickets
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
