
const { UnethenticatedError } = require("../error")
const jwt = require("jsonwebtoken");

const Auth = async (req, res, next) => {
    const { token } = req.cookies;
    // console.log("this is the cookie here", token)
    if (!token) throw UnethenticatedError('authentication invalid , no cookies');
    try {
        const payload = jwt.verify(token,
            process.env.jwtSecret);
        req.userInfo = { 
            _id: payload._id,
            phone: payload.phone,
            role: payload.role
        }
        // console.log("this is the current user",req.userInfo)
    //   await  isUserNotRestricted(payload._id,next)
        next()
    } catch (err) {
        console.log("this is the error in the auth middleware", err)
        throw UnethenticatedError('authentication invalid --u');
        // next()
    }

}

module.exports = Auth