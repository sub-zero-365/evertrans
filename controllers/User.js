const User = require("../models/User");
const Ticket = require("../models/Ticket");
const { BadRequestError, UnethenticatedError } = require("../error");
const Assistant = require("../models/Assistant")
const { createJWT } = require("../utils/tokenUtils")
const mongoose =require("mongoose")
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



const Register = async (req, res) => {
  const isAdmin_id = req?.admin?._id && req?.admin?.role == "user";
  console.log("req.admin", req.admin)
  if (!isAdmin_id) throw UnethenticatedError("not allowed to perform this action now");
  const isUserWithPhone = await User.findOne({ phone: req.body.phone });
  if (isUserWithPhone) {
    throw BadRequestError("user exist with the phone  number");
  }
  console.log(req.body)
  req.body.createdBy = req.admin._id;
  const user = await User.create({ ...req.body });
  const token = await user.createJWT();
  res.status(200).json({
    fullname: user.fullname,
    token,
  });
};
const Login = async (req, res) => {
  const {
    body: { password, phone },
  } = req;
  if (!password || !phone) {
    throw BadRequestError("please phone  or password needed");
  }
  let user = await User.findOne({ ...{ phone, password } });
  let token = null
  if (user) token = await user.createJWT();

  if (!user) {
    // search assistant user
    user = await Assistant.findOne({ ...{ phone, password } }, { password: 0 });
    if (!user) throw BadRequestError("please check your login details");
    token = createJWT({
      _id: user._id,
      phone: user.phone
    })
    delete user.password
    user = {
      ...user,
      redirect: true
    }
    return res.status(200).json({
      user,
      token,

    });
  }
  user = user.toJSON()
  delete user.password
  res.status(200).json({
    user,
    token,

  });
};



const getUsers = async (req, res) => {
  const obj = {};

  //   query: { fullname, password, phone },
  // } = req;
  // if (fullname) {
  //   obj.fullname = {
  //     $regex: fullname,
  //     $options: "i",
  //   };
  // }
  // if (password) {
  //   obj.password = password;
  // }
  // if (phone) {
  //   obj.phone = {
  //     $regex: phone,
  //     $options: "i",
  //   };
  // }

  // const users = await User.find({ ...obj }
  //   , { password: 0 });
  // res.status(200).json({
  //   users,
  //   nHits: users.length,
  // });
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
  const allusers = await User.find(queryObject, { password: 0, __v: 0 }).sort("-createdAt");
  var promiseawait = await Promise.all(
    allusers.map(async (user) => {
      const lenght = await Ticket.countDocuments({ createdBy: user._id });
      return {
        ...{
          user
        },
        nHits: lenght
      };
    })
  )
  const sortdata = promiseawait.sort((a, b) => b.nHits - a.nHits);
  res.status(200).
    json({ userdetails: sortdata, nHits: sortdata.length })
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
  Register,
  Login,
  getAlluser: getUsers,
  uniqueUsers,
  userInfo,
  getStaticUser,
  getUserAndTicketLength
  , updatePassword
};
