
const {
    UnathorizedError, UnethenticatedError } = require("../error")
const jwt = require("jsonwebtoken");

const Auth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) throw UnethenticatedError('authentication invalid');
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