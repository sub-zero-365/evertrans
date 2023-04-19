const { Schema, model } = require("mongoose")


const UserSchema = new Schema(

    {

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
        email: {
            type: String,
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
const userschema = model("User", UserSchema)
module.exports = userschema