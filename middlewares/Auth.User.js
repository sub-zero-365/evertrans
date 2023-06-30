const {
    BadRequestError,
    DisableRequestError,
    UnethenticatedError,
    UnathorizedError } = require("../error")
const jwt = require("jsonwebtoken");
// const Restricted = require("../models/RestrictedUsers");
// const isUserNotRestricted = async (user_id) => {
//     return new Promise(async function (resolve, reject) {
//         const isuserblocked = await Restricted.findOne({ user_id });
//         if (isuserblocked) return reject(DisableRequestError("cant perform this action casuse user is temporal block by admin contact admin"))
//         return resolve("everything ok");
//     })
// }
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
            phone: payload.phone
        }
        // await isUserNotRestricted(payload._id);
        next()
    } catch (err) {
        console.log(err)
        throw err
    }

}

module.exports = Auth