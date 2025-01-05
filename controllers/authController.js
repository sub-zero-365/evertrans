
const User = require("../models/User");
const { BadRequestError, UnethenticatedError, NotFoundError } = require("../error");
const { StatusCodes } = require("http-status-codes");
const cookies = require("../utils/COOKIES");
const { createJWT } = require("../utils/tokenUtils");
const { USER_ROLES, USER_ROLES_STATUS } = require("../utils/constants");
const dayjs =require("dayjs")
const Register = async (req, res) => {
   const isUserWithPhone = await User.findOne({ phone: req.body.phone });
    if (isUserWithPhone) {
        throw BadRequestError("user exist with the phone  number");
    }
    req.body.createdBy = req.user.userId;
    if (!req.body.role) req.body.role = USER_ROLES_STATUS.ticketer
    const user = await User.create({ ...req.body });
    const token = await user.createJWT();
    res.status(200).json({
        fullname: user.fullname,
        // token,
    });
};
const Login = async (req, res) => {
    const {
        body: { password, phone },
    } = req;
    if (!password || !phone) {
        throw BadRequestError("please phone  or password needed");
    }
    let user = await User.findOne({ phone, password });
    if (!user) throw NotFoundError(`password or phone number is incorrect`)
    console.log(user)
    const token = createJWT({
        userId: user._id,
        role: user.role
    });




    res.cookie('token', token,
        cookies

    );
    res.status(StatusCodes.OK).json({
        msg: 'user logged in',
        user: { role: user.role }
    });
};
const logout = (_req, res) => {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
  };
module.exports = {
    Register,
    Login,
    logout
}