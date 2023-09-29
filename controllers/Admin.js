const Admin = require("../models/Admin");
const { comparePassword, hashPassword } = require('../utils/passwordUtils.js');
const { UnethenticatedError, BadRequestError } = require('../error');
const { StatusCodes } = require("http-status-codes")

const login = async (req, res) => {
  const oneDay = 1000 * 60 * 60 * 24;

  const {
    body: { phone, password },
  } = req;
  if (!phone || !password) {
    throw UnethenticatedError("please password or phone number is require");
  }
  let user = await Admin.findOne({ phone: phone })
  const isValidUser =
    user && (await comparePassword(req.body.password, user.password));
  if (!isValidUser) throw UnethenticatedError("invalid credentials")
  const token = await user.createJWT();
  res.status(200)
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    sameSite: "none",
  }).json({ msg: "user logged in success!!!" });

};
const register = async (req, res) => {

  const isFirstAccount = (await Admin.countDocuments()) === 0;
  // if (!isFirstAccount && req?.admin.role == "user") {

  // }
  const isPhone = await Admin.findOne({ phone: req.body.phone })
  if (isPhone) throw BadRequestError("phone number already exist")
  req.body.role = isFirstAccount ? 'admin' : 'user';
  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;
  const user = await Admin.create(req.body);
  res.status(200).json({ msg: 'user created' });
};
const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: "none",
    secure: process.env.NODE_ENV === 'production',
    
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

module.exports = {
  login,
  register,
  logout
};
