const sanitizeUser = (userObj) => {
    // checking type is an object
    if (typeof (userObj) !== "object") return {}
    const sanitizeuser = userObj?.toJson();
    delete sanitizeuser.password;
    return sanitizeuser
}
module.exports = sanitizeUser