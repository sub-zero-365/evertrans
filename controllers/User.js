const User = require("../models/User");
// const Ticket = require("../models/Ticket");
const Admin = require("../models/Admin")
const { BadRequestError, UnethenticatedError, UnathorizedError, DisableRequestError } = require("../error");
// const Assistant = require("../models/Assistant")
const { createJWT } = require("../utils/tokenUtils")
const { comparePassword, hashPassword } = require('../utils/passwordUtils.js');
const { USER_ROLES_STATUS } = require("../utils/constants.js")
const mongoose = require("mongoose");
const isUserNotRestricted = require("../middlewares/IsUserRestricted.js");
const restrictedschema = require("../models/RestrictedUsers.js");

const getAllSubAdminUsers = async (req, res) => {
  // const isSuperAdmin = req?.user?.role == "admin"
  // if (!isSuperAdmin) throw UnethenticatedError("Unethenticated error");
  // let users = null;

  let users = await User.aggregate([{
    $match: {
      _id: {
        $ne: new mongoose.Types.ObjectId(req?.user?.userId)
      },
      role: USER_ROLES_STATUS.sub_admin//"where thier roles are sub admins"
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "createdBy",
      as: "users"
    }
  },

  {
    $project: {
      total: {
        "$size": "$users"
      },
      fullname: 1,
      _id: 1,
      createdAt: 1,
      phone: 1,
    }
  }, {
    $sort: {
      total: -1
    }
  }

  ])

  console.log("this is the new uses", users)
  res.status(200).json({ users })
}
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

  const { search, userRole } = req.query;
  const queryObject = {};
  if (userRole) {
    const users = await User.find({ role: userRole });
    return res.status(200).json({ users })
  }
  // if (!req.admin) throw UnethenticatedError("not allow to perfom this operation")
  const isSuper = req?.user?.role == "admin"
  // console.log("this is the user role here", isSuper)
  if (!isSuper) {
    queryObject.createdBy = new mongoose.Types.ObjectId(req.user?.userId)
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
          role: USER_ROLES_STATUS.ticketer
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
          role: USER_ROLES_STATUS.mailer

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

  // console.log("this is the user tickets here", usertickets)
  res.status(200).json({
    userdetails: [...usertickets, ...userMails],
    nHits: [...usertickets, ...userMails]?.length
  })
}


const userInfo = async (req, res) => {
  const isHigherOrderUser = req.query.higherorderuser
  const userId = req?.params?.userId || req?.user?.userId
  const userRole = req?.user?.role
  if (isHigherOrderUser && [USER_ROLES_STATUS.ticketer, USER_ROLES_STATUS.mailer].
    some(role => role.includes(userRole))) {
    throw UnathorizedError("not authorise to access this data please login again ")
  }
  // const isUser = await restrictedschema.findOne({ user_id: req?.user?.userId })
  // if (isUser) throw DisableRequestError("hahah")
  // if(isHigherOrderUser&&![USER_ROLES_STATUS.ticketer, USER_ROLES_STATUS.mailer].
  //   some(role => role.includes(userRole))){
  //     throw UnathorizedError("not authorise to access this data please login again ")

  //   }

  const user = await User.findOne(
    {
      _id: userId,
    }, {
    password: false
  }
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
  const deleteuserwithoutaskingpassword = req.query.allowwithotpassword;
  const { id } = req.params
  const generalAdmin_or_AdminCreated_the_user = req?.user?.role == "admin" || (
    await User.findOne({ createdBy: req?.user?.userId })
  );
  if (!generalAdmin_or_AdminCreated_the_user) {
    throw BadRequestError("cant perfom this action now please try again later")

  }
  const { password } = req.body
  // let user = null;
  let isValidUser = false;

  if (deleteuserwithoutaskingpassword) {
    isValidUser = true
  } else {
    let user = await User.findOne({ _id: id, password: password })
    isValidUser = user && password
  }
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
  deleteUser,
  getAllSubAdminUsers
};
