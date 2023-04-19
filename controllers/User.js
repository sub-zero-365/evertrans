const User = require("../models/User")
const { BadRequestError } = require("../error")
module.exports = {

    Register: Register = async(req, res) => {
        if (1) throw BadRequestError("please send a valid user name thanks")
        res.send("register route here")


    },
    Login: Login = async(req, res) => {
        res.send("login route here")


    }


}