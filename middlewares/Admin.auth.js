const { BadRequestError } = require("../error")
const jwt = require("jsonwebtoken")
const auth = async(req, _, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw BadRequestError("please provide an auth header")

    }
    if (!authHeader.startsWith(process.env.jwtSecret)) {
        throw BadRequestError("please provide a valid auth  header")

    }
    const token = authHeader.split(" ")[1];

    try {
        jwt.verify(token, process.env.jwtSecret, );
        req.user = true
        next()
    } catch (err) {
        throw BadRequestError("bad token")
    }

}
module.exports = auth