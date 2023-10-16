const User = require("../models/User");
const Ticket = require("../models/Ticket");
const { BadRequestError, UnethenticatedError } = require("../error");
const Assistant = require("../models/Assistant")
const { createJWT } = require("../utils/tokenUtils")
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
  const obj = {};


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
  // const allusers = await User.find(queryObject, { password: 0, __v: 0 }).sort("-createdAt");
  // var promiseawait = await Promise.all(
  //   allusers.map(async (user) => {
  //     const lenght = await Ticket.countDocuments({ createdBy: user._id });
  //     return {
  //       ...{
  //         user
  //       },
  //       nHits: lenght
  //     };
  //   })
  // )
  // const sortdata = promiseawait.sort((a, b) => b.nHits - a.nHits);
  // res.status(200).
  //   json({ userdetails: sortdata, nHits: sortdata.length })
  const usertickets = await User.
    aggregate([
      {
        $match: {
          ...queryObject

        }
      },
      {
        $lookup: {
          from: "restricteds",
          localField: "user_id",
          foreignField: "_id",
          as: "restrictedsRole"
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
          isrestricted: {
            $cond: [
              {
                $eq:
                  [{
                    $size: "$restrictedsRole"
                  }, 0]
              },
              false,
              true],
          },
          username: { $size: "$restrictedsRole" },
          user_id: 1,

        }
      },
      { $sort: { total: -1 } }])
  console.log("this is the user ticket here", usertickets)
  res.status(200).json({ userdetails: usertickets })
}


const userInfo = async (req, res) => {

  const {
    userInfo: { _id },
  } = req;

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




module.exports = {
  getAlluser: getUsers,
  uniqueUsers,
  userInfo,
  getStaticUser,
  getUserAndTicketLength
  , updatePassword
};
