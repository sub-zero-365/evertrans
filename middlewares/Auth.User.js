
const { UnethenticatedError } = require("../error")
const jwt = require("jsonwebtoken");

const Auth = async (req, res, next) => {
    console.log(req.cookies)
    const { token } = req.cookies;
    console.log("this is token", token)
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