const Admin = require("../models/Admin");

const login = async (req, res, next) => {
  const {
    body: { phone, password },
  } = req;
  if (!phone || !password) {
    throw require("../error").BadRequestError("phone or password needed");
  }
  const obj = {
    phone,
    password,
  };
  const user = await Admin.findOne({ ...obj });
  if (!user) {
    throw require("../error").BadRequestError("login fail");
  }
  const token = await user.createJWT();
  res.status(200).json({ token });
};
module.exports = login;
