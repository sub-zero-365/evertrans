const {
    DisableRequestError
    } = require("../error")
const Restricted = require("../models/RestrictedUsers");
const isUserNotRestricted = async (req, res, next) => {
    const user_id = req?.userInfo?._id;
    return new Promise(async function (resolve, reject) {
        const isuserblocked = await Restricted.findOne({ user_id });
        if (isuserblocked) { return reject(DisableRequestError("cant perform this action casuse user is temporal block by admin contact admin")) }
        else {
            next()
            resolve("everything ok");
        }
    })
}
module.exports = isUserNotRestricted