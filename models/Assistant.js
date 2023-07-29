const { Schema, model } = require("mongoose");

const assistantSchema = new Schema(
    {
        fullname: {
            type: String,
            required: [true, "please provide a user  name"],
            min: [2, "name  should be greater than 2"],
        },
        phone: {
            type: String,
            required: [true, "please provide a number"],
            min: [6, "phone number should be greater than 6"],
            uniqued: true,
        },
        numberOfTicketScan: {
            type: Number,
            require: false,
            default: 0
        },
        password: {
            type: String,
            required: [true, "please provide a password"],
            min: [4, "please passwords should be greater than 5"],

        },
        ticket_details: [{
            _id: {
                type: Number,
            },
            date:{
                type: Date,
            }
        }
        ]
    },
    {
        timestamps: true,
    }
);

const assistantschema = model("assistant", assistantSchema);

module.exports = assistantschema;
