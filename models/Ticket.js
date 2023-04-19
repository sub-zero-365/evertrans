const { Schema, model } = require("mongoose");

const ticketSchema = new Schema({

    fullname: {
        type: String,
        required: [true, "please enter user name is needed"],
        minLength: 4
    },
    from: {
        type: String,
        required: [true, "please enter from "],

    },
    active: {
        type: Boolean,
        default: true,
        enum: {
            values: [true, false]
        }
    },
    to: {
        type: String,
        required: [true, "please enter to"],

    },
    price: {
        type: Number,
        required: [true, "please enter price"],
    },
    traveltime: {
        type: String,
        required: [true, "please enter time"],
    },
    traveldate: {
        type: String,
        required: [true, "please enter date"],
    }

}, {
    timestamps: true
})
const ticketschema = model("Ticket", ticketSchema);
module.exports = ticketschema