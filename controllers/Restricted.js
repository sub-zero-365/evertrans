const Restricted = require("../models/RestrictedUsers");
const { BadRequestError, NotFoundError } = require("../error")
const addRestrictedUsers = async (req, res) => {
    const user_id = req.body.user_id
    console.log("enter hehahdha df with error code"+req.body)
    const isblock = await Restricted.findOne({ user_id });
    if (isblock) throw BadRequestError("user is already block");
    const newuserblockuser = await Restricted.create({ ...req.body })
    if (!newuserblockuser) throw BadRequestError("fail to create user");
    return res.status(200).json({ status: true })
}
const removeRestrictedUsers = async (req, res) => {
    const _id = req.params.id
    const newuserblockuser = await Restricted.findOneAndDelete({ user_id:_id })
    if (!newuserblockuser) throw BadRequestError("fail to delete user");
    return res.status(200).json({ status: true })
}
const getStaticRestrictedUsers = async (req, res) => {
    const id = req.params.id
    const restricteduser = await Restricted.findOne({ user_id: id });
    if (!restricteduser) throw BadRequestError("user does not exist");
    res.status(200).json({ restricteduser })
}
const getRestrictedUsers = async (req, res) => {
    const restrictedusers = await Restricted.find({})
    res.status(200).json({ restrictedusers })
}
module.exports = {
    addRestrictedUsers,
    removeRestrictedUsers,
    getRestrictedUsers,
    getStaticRestrictedUsers
}