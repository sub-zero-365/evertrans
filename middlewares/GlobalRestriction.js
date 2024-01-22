
const { UnethenticatedError, BadRequestError } = require("../error")
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
    if (!token) return next();
    const payload = jwt.verify(token,
        process.env.jwtSecret);

    const isuserblocked = payload && await Restricted.findOne({ user_id: payload.userId });
    if (isuserblocked) {
        // const error = new Error("user is suspend")
        // throw error
        throw DisableRequestError(`
        your account has been block contact admin  for information
         `)
    }
    // try {
    //     const payload = jwt.verify(token,
    //         process.env.jwtSecret);
    //     const isuserblocked = await Restricted.findOne({ user_id: payload.userId });
    //     if (isuserblocked) {
    //         const error = new Error("user is suspend")
    //         throw error
    //     }
    //     // throw new Error("user is suspend")
    //     // await isUserNotRestricted(payload.userId)
    // } catch (err) {
    //     console.log("this is the error in the auth middleware", err)
    //     throw BadRequestError(err?.message || "something went wromng")
    // }
    next()


}

module.exports = GlobalRestriction