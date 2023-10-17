const Assistant = require("../models/Assistant");
const User = require("../models/User");
const { createJWT, } = require("../utils/tokenUtils")
const toJson = require("../utils/toJson")
const { BadRequestError, NotFoundError } = require("../error")
const { StatusCodes } = require("http-status-codes")

const createAssistant = async (req, res) => {
    const { phone, password } = req.body;
    if (!phone, !password) throw BadRequestError("Phone and password is needed")
    const isUserWithPhone = (await Assistant.findOne({ phone })) || (await User.findOne({ phone }));
    if (isUserWithPhone) throw BadRequestError("User already exist with phone number")
    const assistant = await Assistant.create(req.body);
    if (!assistant) throw BadRequestError("fail to create assistant")
    const token = createJWT(
        {
            _id: assistant._id,
            phone: assistant.phone
        })

    res.status(201).json({
        assistant: toJson("password", assistant),
        token
    });

}
const LoginAssistant = async (req, res) => {
    const { phone, password } = req.body;
    if (!phone, !password) throw BadRequestError("Phone and password is need to login")

    const assistant = await Assistant.findOne({ password, phone });
    if (!assistant) throw NotFoundError(`No user with credentials`)
    const token = createJWT(
        {
            _id: assistant._id,
            phone: assistant.phone
        },
        process.env.jwtAssistant
    )
    console.log("toeknn", token,"hiofhuisahgdfiugashdiugfiuasggu")
    res.status(201).json({
        assistant: toJson("password", assistant),
        token,
        redirect: true
    });


}
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
    LoginAssistant,
    createAssistant,
    logout
}