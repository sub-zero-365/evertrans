const Admin = require("../models/Admin")

const login = async(req, res, next) => {

    const user = await Admin.findOne({...req.body });
    if (!user) {
        throw require("../error").BadRequestError("login fail")
    }
    const token = await user.createJWT();
    res.status(200).json({ token })
}
module.exports = login