const { Schema, model } = require("mongoose")
const jwt = require("jsonwebtoken")

const UserSchema = new Schema({
        fullname: {
            type: String,
            required: [true, "please provide a user  name"],
            minLength: 6,
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