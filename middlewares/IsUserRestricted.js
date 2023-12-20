const {
    DisableRequestError
} = require("../error")
const Restricted = require("../models/RestrictedUsers");
const isUserNotRestricted = async (req, res, next) => {
    const user_id = req?.userInfo?._id;
    return new Promise(async function (resolve, reject) {
        const isuserblocked = await Restricted.findOne({ user_id });
        if (isuserblocked) {
            return reject(DisableRequestError(`
       your account has been block contact admin  for information
        `))
        }
        else {
            resolve("everything ok");
            next()
        }
    })
}
module.exports = isUserNotRestricted