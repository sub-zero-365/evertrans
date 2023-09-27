
const User = require("../models/User");
const Assistant = require("../models/Assistant");
const { BadRequestError, UnethenticatedError } = require("../error");
const { StatusCodes } = require("http-status-codes")
const Register = async (req, res) => {
    const isAdmin_id = req?.admin?._id && req?.admin?.role == "user";
    if (!isAdmin_id) throw UnethenticatedError("not allowed to perform this action now");
    const isUserWithPhone = await User.findOne({ phone: req.body.phone });
    if (isUserWithPhone) {
        throw BadRequestError("user exist with the phone  number");
    }
    req.body.createdBy = req.admin._id;
    const user = await User.create({ ...req.body });
    const token = await user.createJWT();
    res.status(200).json({
        fullname: user.fullname,
        token,
    });
};
const Login = async (req, res) => {
    const oneDay = 1000 * 60 * 60 * 24;
    const {
        body: { password, phone },
    } = req;
    if (!password || !phone) {
        throw BadRequestError("please phone  or password needed");
    }
    let user = await User.findOne({ ...{ phone, password } });
    let token = null
    if (user) token = await user.createJWT();

    if (!user) {
        // search assistant user
        user = await Assistant.findOne({ ...{ phone, password } }, { password: 0 });
        if (!user) throw BadRequestError("please check your login details");

        user = {
            redirect: true
        }
        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + oneDay),
            secure: process.env.NODE_ENV === 'production',
        });
        res.status(StatusCodes.OK).json({ msg: 'user logged in', user });
    }

   

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged in', user });
};
const logout = (req, res) => {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
  };
module.exports = {
    Register,
    Login,logout
}