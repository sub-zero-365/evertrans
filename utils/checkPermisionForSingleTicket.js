const jwt = require("jsonwebtoken");
var isUserRequesting = null;
// var User = require("../models/User")
// var Admin = require("../models/Admin")
// var Assistant = require("../models/Assistant")


const checkPermissionForSingleTicket = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) throw UnethenticatedError('authentication invalid');
    try {
        jwt.verify(token, process.env.jwtSecret);
        return next()
    } catch (err) {
        try {
            jwt.verify(token,
                process.env.jwtAdminSecret);
            return next()
        } catch (err) {
            throw UnethenticatedError('authentication invalid');
        }
    }
}

module.exports=checkPermissionForSingleTicket