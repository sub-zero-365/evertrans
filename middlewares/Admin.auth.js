const { BadRequestError } = require("../error");
const Admin = require("../models/Admin.js")
const jwt = require("jsonwebtoken")
const auth = async (req, _, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw BadRequestError("please provide a an auth header");
    }
    if (!authHeader.startsWith(process.env.jwtSecret)) {
        throw BadRequestError("please provide a valid auth  header")
    }
    const token = authHeader.split(" ")[1];
    if(token==""|| token==null){
        throw BadRequestError("please a valid token code")
    
    }
    try {
         jwt.verify(token,
            process.env.jwtAdminSecret);
        req.admin = true
        next()
    } catch (err) {
        throw BadRequestError("bad token")
    }

}
module.exports = auth