const { BadRequestError } = require("../error");
const Ticket = require("../models/Ticket");
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
    throw BadRequestError("cannot find ticket with this id " + id)
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
    // userInfo: { _id },
    params: { id },
  } = req;
  console.log(req.userInfo)
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
  const getPreviousDay = (day_offset = 1, date = new Date()) => {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - day_offset);
    return previous;
  }
  const {
    userInfo: { _id },
    query: { createdAt }
  } = req;
  console.log(createdAt)
  const queryObject = {
    createdBy: _id
  }
  if (createdAt) {
    queryObject.createdAt = {
      $gte: getPreviousDay(createdAt),
    }
  }
  console.log(queryObject, createdAt)

  const tickets = await Ticket.find(
    {
      ...queryObject
    },
    {
      isActive: 0,
    }
  ).sort({ createdAt: -1 });
  console.log(tickets.length)
  res.status(200).json({
    tickets,
    nHits: tickets.length,
  });
};

const getTickets = async (req, res) => {
  const getPreviousDay = (day_offset = 1, date = new Date()) => {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - day_offset);
    return previous;
  }
  const {
    createdAt, createdBy,
  } = req.query
  console.log(createdAt, createdBy, 1)

  const queryObject = {
  }

  if (createdBy) {
    queryObject.createdBy = createdBy
  }
  if (createdAt !== "null" && createdAt !== undefined) {
    console.log("dont need to enter here")
    queryObject.createdAt = {
      $gte: getPreviousDay(createdAt),
    }
  }
  console.log(queryObject, createdAt)

  const tickets = await Ticket.find({
    ...queryObject

  }, {}).sort({
    createdAt: -1,
  });
  res.status(200).json({
    tickets,
    nHits: tickets.length,
  });
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
