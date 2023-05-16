const Contact = require("../models/Contact");
const { BadRequestError } = require("../error");
const createContact = async (req, res) => {
  await Contact.create({ ...req.body });
  res.json({ status: true });
};
const getContact = async (req, res) => {
  const {
    params: { id: _id },
  } = req;
  const contact = await Contact.findOne({ _id });
  if (!contact) {
    throw BadRequestError("fail to lookup contact with id : " + _id);
  }
  res.status(200).json({ contact });
};

const getAllContact = async (req, res) => {
  const contacts = await Contact.find({});
  res.status(200).json({ contacts ,nHits:contacts.length});
};
module.exports = { createContact, getContact,getAllContact };
