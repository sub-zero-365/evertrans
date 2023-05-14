const Ticket = require("../models/Ticket");
const createTicket = async (req, res, next) => {
  const {
    body,
    userInfo: { _id },
  } = req;
  const obj = {
    createdBy: _id,
    ...body,
  };
  console.log(obj)
  const ticket = await Ticket.create({ ...obj })
  res.status(200).json({
    ticket,
  });
};
const editTicket = async (req, res, next) => {
  const isEdited = await Ticket.findOneAndUpdate(
    {
      
    },
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
  const {
    userInfo: { _id },
    params: {id},
  } = req;
  const ticket = await Ticket.findOne({
    createdBy: _id,
    _id: id,
  });
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
  ).sort({createdAt:-1});
  res.status(200).json({
    tickets,
    nHits: tickets.length,
  });
};

const getTickets = async (req, res) => {
  const tickets = await Ticket.find({ ...req.query });
  res.status(200).json({
    tickets,
    nHits: tickets.length,
  });
};
module.exports = {
  create: createTicket,
  edit: editTicket,
  getTickets,
  userTickets,
  getTicket
};
