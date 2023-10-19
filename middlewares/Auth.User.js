
const { UnethenticatedError } = require("../error")
const jwt = require("jsonwebtoken");

const Auth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) throw UnethenticatedError('authentication invalid');
    try {
        const payload = jwt.verify(token,
            process.env.jwtSecret);
        req.userInfo = {
            _id: payload._id,
            phone: payload.phone,
            role: payload.role
        }
        console.log(req.userInfo)
        next()
    } catch (err) {
        console.log("this is the error in the auth middleware", err)
        throw UnethenticatedError('authentication invalid');
    }

}

module.exports = Auth