const { BadRequestError } = require("../error");
const Admin = require("../models/Admin.js")
const jwt = require("jsonwebtoken")
const auth = async (req, _, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw BadRequestError("please provide an auth header");
    }
    if (!authHeader.startsWith(process.env.jwtSecret)) {
        throw BadRequestError("please provide a valid auth  header")
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.jwtAdminSecret,);
        const isAdmin = await Admin.findOne({
            _id: payload._id,
            phone: payload.phone
        })
        if (!isAdmin) {
            const error = new Error("Fail to find Admin");
            error.status = 1234
            throw error

        }else {
            req.user = true
            next()
        }
    } catch (err) {
        if (err.status === 1234) {
            throw BadRequestError("fail to find user")
        }
        throw BadRequestError("bad token")
    }

}
module.exports = auth