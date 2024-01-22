
const { UnethenticatedError, UnathorizedError: UnauthorizedError } = require("../error")
// const jwt = require("jsonwebtoken");
const { verifyJWT } = require('../utils/tokenUtils.js');

const authenticateUser = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) throw UnethenticatedError('authentication invalid ');
    try {
        const payload = verifyJWT(token);
        req.user = {
            userId: payload.userId,
            role: payload.role
        }
        next()
    } catch (err) {
        // console.log("this is the error in the auth middleware", err)
        throw UnethenticatedError('authentication invalid --u');
    }

}
const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw UnauthorizedError('Unauthorized to access this route');
        }
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizePermissions
}