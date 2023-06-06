const User = require("../models/User");
const Ticket = require("../models/Ticket");
const { BadRequestError } = require("../error");

const Register = async (req, res) => {
  const isUserWithPhone = await User.findOne({ phone: req.body.phone });
  if (isUserWithPhone) {
    throw BadRequestError("user exist with the phone  number");
  }
  console.log(req.body)
  const user = await User.create({ ...req.body });
  const token = await user.createJWT();
  res.status(200).json({
    fullname: user.fullname,
    token,
  });
};
const Login = async (req, res) => {
  const {
    body: { password, phone },
  } = req;
  if (!password || !phone) {
    throw BadRequestError("please phone  or password needed");
  }
  const user = await User.findOne({ ...{ phone, password } });
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
  const obj = {};
  const {
    query: { fullname, password, phone },
  } = req;
  if (fullname) {
    obj.fullname = {
      $regex: fullname,
      $options: "i",
    };
  }
  if (password) {
    obj.password = password;
  }
  if (phone) {
    obj.phone = {
      $regex: phone,
      $options: "i",
    };
  }

  const users = await User.find({ ...obj });
  res.status(200).json({
    users,
    nHits: users.length,
  });
};

const getUserAdmin = async () => {

  const {
    params: { id },
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

}


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
const getStaticUser = async (req, res) => {
  const {
    params: { id: _id },
  } = req;
  const user = await User.findOne({ _id });
  if (!user) {
    throw BadRequestError("user id is incorrect please try again");
  }
  res.status(200).json({ user });
};




module.exports = {
  Register,
  Login,
  getAlluser: getUsers,
  uniqueUsers,
  userInfo,
  getStaticUser,
  
};
