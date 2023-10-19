const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: [true, "please provide a user  name"],
        min: [6, "please fullname should be greater than 5"]
    },
    phone: {
        type: Number,
        required: [true, "please provide a number"],
        min: [6, "please phone number should be greater than 5"],
        uniqued: true
    },
    password: {
        type: String,
        required: [true, "please provide a password"],
        min: [4, "please passwords should be greater than 5"],
    },
    role: {
        type: String,
        enum: ['tickets',
            'mails'],
        default: 'tickets',
    }
    ,
    createdBy: {
        type: Schema.ObjectId,
        required: [true, "please send a created user id"],
        ref: "admins",
    }
}, {
    timestamps: true
}

)






UserSchema.methods.createJWT = function () {
    return jwt.sign({
        _id: this._id,
        phone: this.phone,
        role: this.role
    },
        process.env.jwtSecret, 
        { expiresIn: "24h" })

}

const userschema = model("User", UserSchema)


module.exports = userschema