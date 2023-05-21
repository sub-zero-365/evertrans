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
  const isEdited = await Ticket.findOneAndUpdate(
    {},
    { isActive: req.body.isActive },
    { new: true }
  );
  if (!isEdited) {
    throw BadRequestError("fail to update ticket");
  }
  res.status(200).json({
    edited: isEdited,
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
   return  res.status(200).json({
        ticket,
        admin:true
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
  const {
    userInfo: { _id },
  } = req;

  const tickets = await Ticket.find(
    {
      createdBy: _id,
    },
    {
      isActive: 0,
    }
  ).sort({ createdAt: -1 });
  res.status(200).json({
    tickets,
    nHits: tickets.length,
  });
};

const getTickets = async (req, res) => {
  const tickets = await Ticket.find({ ...req.query }, {}).sort({
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
