const { Schema, model } = require("mongoose")
const jwt = require("jsonwebtoken")

const UserSchema = new Schema({

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
    return jwt.sign({ _id: this._id, phone: this.phone }, process.env.jwtAdminSecret, { expiresIn: "10d" })

}

const userschema = model("admins", UserSchema)


module.exports = userschema