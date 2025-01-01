
const User = require("../models/User");
// const Assistant = require("../models/Assistant");
const { BadRequestError, UnethenticatedError, NotFoundError } = require("../error");
const { StatusCodes } = require("http-status-codes");
const cookies = require("../utils/COOKIES");
const { createJWT } = require("../utils/tokenUtils");
const { USER_ROLES, USER_ROLES_STATUS } = require("../utils/constants");
const Register = async (req, res) => {
    // console.log("hit the registe route here")
    // const { userRole } = req.query
    // if (userRole)

    // const isAdmin_id = req?.admin?._id && req?.admin?.role == "user";
    // if (!isAdmin_id) throw BadRequestError("not allowed to perform this action now");
    const isUserWithPhone = await User.findOne({ phone: req.body.phone });
    if (isUserWithPhone) {
        throw BadRequestError("user exist with the phone  number");
    }
    req.body.createdBy = req.user.userId;
    // if (req.body.role) req.body.role req.body.role = req.body.role
    if (!req.body.role) req.body.role = USER_ROLES_STATUS.ticketer
    const user = await User.create({ ...req.body });
    const token = await user.createJWT();
    res.status(200).json({
        fullname: user.fullname,
        // token,
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
    let user = await User.findOne({ phone, password });
    if (!user) throw NotFoundError(`password or phone number is incorrect`)
    // const { userId: _id } = user;
    console.log(user)
    const token = createJWT({
        userId: user._id,
        role: user.role
    });
   



    res.cookie('token', token,
        cookies(oneDay)

    );
    res.status(StatusCodes.OK).json({
        msg: 'user logged in',
        user: { role: user.role }
        // user
    });
};
const logout = (req, res) => {
    res.cookie('token', 'logout',
        cookies()
    );
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};
module.exports = {
    Register,
    Login,
    logout
}