
const {
    UnathorizedError } = require("../error")
const jwt = require("jsonwebtoken");

const Auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw UnathorizedError("please provide an auth header")
    }
    if (!authHeader.startsWith(process.env.jwtSecret)) {
        throw UnathorizedError("please provide a valid auth  header")
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.jwtSecret);
        req.userInfo = {
            _id: payload._id,
            phone: payload.phone,
            role: "user"
        }
        next()
    } catch (err) {
        console.log(err)
        throw err
    }

}

module.exports = Auth