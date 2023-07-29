const { BadRequestError } = require('../error')
const Assistant = require("../models/Assistant");
const checkPermissions = async (requestUser) => {
  let user = await Assistant.findOne({
    _id: requestUser
  })
  if (!user) throw BadRequestError("user not permited to make this actions,please login as assistant ")
  return user._id
}
module.exports = checkPermissions