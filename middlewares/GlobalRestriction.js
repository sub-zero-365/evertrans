
const { UnethenticatedError } = require("../error")
const jwt = require("jsonwebtoken");
const {
    DisableRequestError
} = require("../error")
const Restricted = require("../models/RestrictedUsers");
const isUserNotRestricted = async (user_id) => {
    return new Promise(async function (resolve, reject) {
        const isuserblocked = await Restricted.findOne({ user_id });
        if (isuserblocked) {
            return reject(DisableRequestError(`
       your account has been block contact admin  for information
        `))
        }
        else {
            resolve("everything ok");
            // next()
        }
    })
}
// module.exports = isUserNotRestricted
const GlobalRestriction = async (req, res, next) => {
    const { token } = req.cookies;
    // console.log("this is the cookie here", token)
    if (!token) return next();
    try {
        const payload = jwt.verify(token,
            process.env.jwtSecret);
        // req.userInfo = {
        //     _id: payload._id,
        //     phone: payload.phone,
        //     role: payload.role
        // }
        // console.log("this is the current user",req.userInfo)
        await isUserNotRestricted(payload._id)
    } catch (err) {
        console.log("this is the error in the auth middleware", err)
        // throw UnethenticatedError('authentication invalid --u');
        // next()
    }
    next()


}

module.exports = GlobalRestriction