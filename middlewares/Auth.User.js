
const { UnethenticatedError } = require("../error")
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
        throw UnethenticatedError('authentication invalid');

    }

}

module.exports = Auth