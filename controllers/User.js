const User = require("../models/User");
// const Ticket = require("../models/Ticket");
const Admin = require("../models/Admin")
const { BadRequestError, UnethenticatedError } = require("../error");
// const Assistant = require("../models/Assistant")
const { createJWT } = require("../utils/tokenUtils")
const { comparePassword, hashPassword } = require('../utils/passwordUtils.js');

const mongoose = require("mongoose")
const updatePassword = async (req, res) => {
  const { oldpassword, newpassword, confirmpassword } = req.body;
  if (newpassword !== confirmpassword) throw BadRequestError("password doesnot match ");
  if (newpassword.length < 7) throw BadRequestError("Password must be greater or equal to 8")
  let user = await User.findOne({
    _id: req.userInfo._id,
    password: oldpassword
  })

  if (!user) throw BadRequestError("Incorrect Password");
  user = await User.findOneAndUpdate({
    _id: req.userInfo._id,

  }, { password: newpassword })
  if (!user) throw BadRequestError("fail to updatepassword")
  res.status(200).json({ status: true })

}






const getUsers = async (req, res) => {
  const { search } = req.query;
  const queryObject = {};
  if (search) {
    const userSearch = [
      {
        fullname: { $regex: search, $options: "i" }
      }
    ]
    console.log(Number(search))

    queryObject.$or = [
      ...userSearch
    ]

  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const users = await User.find(queryObject)
  const totalUsers = await User.countDocuments(queryObject);
  const numberOfPage = Math.ceil(totalUsers / limit);
  res.status(200).json({
    totalUsers,
    numberOfPage,
    currentPage: page,
    users
  })
  // const users=await User.

};

const getUserAndTicketLength = async (req, res) => {

  const { search } = req.query;
  const queryObject = {}
  if (!req.admin) throw UnethenticatedError("not allow to perfom this operation")
  const isSuper = req?.admin?.role == "admin"
  if (!isSuper) {
    queryObject.createdBy = new mongoose.Types.ObjectId(req.admin?._id)
  }
  if (search) {
    queryObject.$or = [
      {
        fullname: {
          $regex: search, $options: "i"
        },

      }
    ]
  }

  const usertickets = await User.
    aggregate([
      {
        $match: {
          ...queryObject,
          role: "tickets"
        }
      },
      {
        $lookup: {
          from: "tickets",
          localField: "_id",
          foreignField: "createdBy",
          as: "usersRole"
        }
      },

      {
        "$project": {
          total:
            { $size: "$usersRole" },
          fullname: 1,
          _id: 1,
          createdAt: 1,
          phone: 1,
          user_id: 1,
          role: 1

        }
      },
      { $sort: { total: -1 } }])
  const userMails = await User.
    aggregate([
      {
        $match: {
          ...queryObject,
          role: "mails"

        }
      },
      {
        $lookup: {
          from: "mails",
          localField: "_id",
          foreignField: "createdBy",
          as: "usersRole"
        }
      },

      {
        "$project": {
          total:
            { $size: "$usersRole" },
          fullname: 1,
          _id: 1,
          createdAt: 1,
          phone: 1,

          user_id: 1,
          role: 1

        }
      },
      { $sort: { total: -1 } }])
  const userRes = await User.
    aggregate([
      {
        $match: {
          ...queryObject,
          role: "restaurants"

        }
      },
      {
        $lookup: {
          from: "mails",
          localField: "_id",
          foreignField: "createdBy",
          as: "usersRole"
        }
      },

      {
        "$project": {
          total:
            { $size: "$usersRole" },
          fullname: 1,
          _id: 1,
          createdAt: 1,
          phone: 1,

          user_id: 1,
          role: 1

        }
      },
      { $sort: { total: -1 } }])

  console.log("this is the user tickets here", usertickets.length, userMails.length, userRes.length, [...usertickets, ...userMails, ...userRes].length)
  res.status(200).json({ userdetails: [...usertickets, ...userMails, ...userRes] })
}


const userInfo = async (req, res) => {

  // const {
  //   userInfo: { _id },
  // } = req;
  let _id = null
  _id = req?.userInfo || req.params?.userId;
  if (!_id) throw BadRequestError("something went wrong try again later")
  const user = await User.findOne(
    {
      _id,
    },
    { password: 0 }
  );
  if (!user) throw BadRequestError("couldnot find user");
  res.json({
    user,
  });
};
const uniqueUsers = async (req, res) => {
  const unique = await User.distinct(req.params.search);
  res.status(200).json({ unique });
};
const getStaticUser = async (req, res) => {
  console.log(req.cookies);
  const {
    params: { id: _id },
  } = req;
  const user = await User.findOne({ _id });
  if (!user) {
    throw BadRequestError("user id is incorrect please try again");
  }
  res.status(200).json({ user });
};
const deleteUser = async (req, res) => {
  const { id } = req.params
  const generalAdmin_or_AdminCreated_the_user = req?.admin?.role == "admin" || (
    await User.findOne({ createdBy: req?.admin?._id })
  );
  if (!generalAdmin_or_AdminCreated_the_user) {
    throw BadRequestError("cant perfom this action now please try again later")
  }
  const { password } = req.body
  let user = await Admin.findOne({ _id: req?.admin?._id })
  const isValidUser = (
    user && password &&
    await comparePassword(password, user.password))
  if (!isValidUser) throw BadRequestError("password did not match");
  const deletedUser = await User.findOneAndDelete({ _id: id });
  if (!deletedUser) throw BadRequestError("fail to delete user ")
  res.send(200).json({ status: "success" })
}



module.exports = {
  getAlluser: getUsers,
  uniqueUsers,
  userInfo,
  getStaticUser,
  getUserAndTicketLength
  , updatePassword,
  deleteUser
};
