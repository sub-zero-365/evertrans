const { Schema, model } = require("mongoose")
const jwt = require("jsonwebtoken")

const UserSchema = new Schema({
        fullname: {
            type: String,
            required: [true, "please provide a user  name"],
            min:[6,"please fullname should be greater than 5"]
        },
        phone: {
            type: Number,
            required: [true, "please provide a number"],
            min:[6,"please phone number should be greater than 5"],
            // max:[12,"please phone number should be less than 12"],
            uniqued: true
        },

        password: {
            type: String,
            required: [true, "please provide a password"],
            min:[4,"please passwords should be greater than 5"],
            
        }
    }, {

        timestamps: true
    }

)






UserSchema.methods.createJWT = function() {
    return jwt.sign({ _id: this._id, phone: this.phone }, process.env.jwtSecret, { expiresIn: "10d" })

}

const userschema = model("User", UserSchema)


module.exports = userschema