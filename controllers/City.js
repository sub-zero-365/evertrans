const Cities = require("../models/Cities");
const { BadRequestError } = require("../error");
const addCity = async (req, res) => {
  const { value } = req.body;
  const isCity = await Cities.findOne({ value });
  if (isCity) {
    throw BadRequestError("Cities already exist try again");
  }
  const city = await Cities.create({ ...req.body });

  res.status(200).json({ status: true });
};
const removeCity = async (req, res) => {
  const {
    params: { id: _id },
  } = req;
  const isDeleted = await Cities.findOneAndDelete({
    _id,
  });
  if (!isDeleted) {
    throw BadRequestError("fail to delete city");
  }
  res.status(200).json({ status: true });
};
const getCitys = async (req, res) => {
  const cities = await Cities.find({}).sort({value:1});
  res.status(200).json({ cities,nHits:cities.length });
};
const updateCity = async (req, res) => {
  const {
    params: { id: _id },
    body: { value },
  } = req;
  if (!value) {
    throw BadRequestError("please value is need for the update");
  }
  const isUpdated = await Cities.findOneAndUpdate(
    {
      _id,
    },
    { value, label: value },
    { new: true, runValidators: true }
  );
  if (!isUpdated) {
    throw BadRequestError("fail to delete city");
  }
  res.status(200).json({ status: true });
};
module.exports = {
  addCity,
  getCitys,
  updateCity,
  removeCity,
};
