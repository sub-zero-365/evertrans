const { Schema, model } = require("mongoose")
const jwt = require("jsonwebtoken")
const UserSchema = new Schema({
    fullname: {
        type: String,
        required: [true, "please provide a user  name"],
        min: [6, "please fullname should be greater than 5"]
    },
    phone: {
        type: Number,
        required: [true, "please provide a number"],
        minLength: 6,
        maxLength: 10,
        uniqued: true
    },
    password: {
        type: String,
        required: [true, "please provide a password"],
        minLength: 4,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
}, {

    timestamps: true
}

)


UserSchema.methods.createJWT = async function () {
    return jwt.sign({ _id: this._id, 
    phone: this.phone,
    role:this.role },
        process.env.jwtAdminSecret,
        { expiresIn: "30d" })

}

const userschema = model("admins", UserSchema)
module.exports = userschema