const { BadRequestError } = require("../error")
const jwt = require("jsonwebtoken")
const Auth =async(req,res,next)=>{
    const authHeader = req.headers.authorization;
    // console.log(req.headers)
    if (!authHeader) {
        throw BadRequestError("please provide an auth header")

    }
    if (!authHeader.startsWith(process.env.jwtSecret)) {
        throw BadRequestError("please provide a valid auth  header")

    }
    const token = authHeader.split(" ")[1];

    try {
       const payload= jwt.verify(token, process.env.jwtSecret, );
        req.userInfo ={
        _id:payload._id,
        phone:payload.phone
        }
        next()
    } catch (err) {
        throw BadRequestError("bad token")
    }

}

module.exports=Auth