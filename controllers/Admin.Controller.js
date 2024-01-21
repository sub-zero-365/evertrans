const { BadRequestError, UnethenticatedError } = require("../error");
const Admin = require("../models/Admin");
const mongoose = require("mongoose")
const User = require("../models/User")

// const {getStatic}=require("../controllers/User")

const getStatic = async (req, res) => {
    // const { id } = req.params
    // queryObject.updatedBy = new mongoose.Types.ObjectId(createdBy)
    const id = req?.admin?._id
    let user = await Admin.findOne({
        _id: id
    });
    if (!user) throw BadRequestError("no user with id " + id)
    user = user.toJSON()
    delete user.password;
    res.status(200).json({
        user
    })
}
const getAllUsers = async (req, res) => {
    const isSuperAdmin = req?.admin?.role == "admin"
    if (!isSuperAdmin) throw UnethenticatedError("Unethenticated error");
    let users = null;

    users = await Admin.aggregate([{
        $match: {
            _id: {
                $ne: new mongoose.Types.ObjectId(req.admin._id)
            }
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
module.exports = {
    getStatic,
    getAllUsers
}