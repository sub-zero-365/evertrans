    const { BadRequestError, UnethenticatedError } = require("../error");
const jwt = require("jsonwebtoken")
const auth = async (req, _, next) => {
    const { token } = req.cookies;
    if (!token) throw UnethenticatedError('authentication invalid');

    try {
        const payload = jwt.verify(token,
            process.env.jwtAdminSecret);
        req.admin = {
            phone: payload.phone,
            role: payload.role,
            _id: payload._id
        }
        next()
    } catch (err) {
        throw  UnethenticatedError('authentication invalid --a');
    }

}
module.exports = auth