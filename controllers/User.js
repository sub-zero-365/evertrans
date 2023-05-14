const User = require("../models/User");
const { BadRequestError } = require("../error");

const Register = async (req, res) => {
  const isUserWithPhone = await User.findOne({ phone: req.body.phone });
  if (isUserWithPhone) {
    throw BadRequestError("user exist with the phone  number");
  }
  const user = await User.create({ ...req.body });
  const token = await user.createJWT();
  res.status(200).json({
    fullname: user.fullname,
    token,
  });
};
const Login = async (req, res) => {
  const user = await User.findOne({ ...req.body });
  if (!user) {
    throw BadRequestError("please check your login details");
  }
  const token = await user.createJWT();
  res.status(200).json({
    fullname: user.fullname,
    token,
  });
};
const getUsers = async (req, res) => {
  console.log(req.query);
  const users = await User.find({ ...req.query });
  res.status(200).json({
    users,
    nHits: users.length,
  });
};
const userInfo = async (req, res) => {
  const {
    userInfo: { _id },
  } = req;
  const user = await User.findOne(
    {
      _id,
    },
    { password: 0 }
  );
  if (!user) throw BadRequestError("couldnot find user");
  res.json({
    user,
  });
};
const uniqueUsers = async (req, res) => {
  const unique = await User.distinct(req.params.search);
  res.status(200).json({ unique });
};
module.exports = {
  Register,
  Login,
  getAlluser: getUsers,
  uniqueUsers,
  userInfo
};
