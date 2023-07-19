const { model, Schema } = require("mongoose");
const { v4: uuid } = require("uuid")
const busSchema = new Schema({
    name: {
        type: String,
        minLength: [3, "please seat should not be less than 3"],
        required: [true, "please bus name is required"]
    },
    number_of_seats: {
        type: Number,
        min: [49, "please seat should not be less than 45"],
        default: 49
    },
    plate_number: {
        type: Number,
        required: true

    }
,
}, {
    timestamps: true,
    versionKey: false
});

const Bus = model("bus", busSchema);
module.exports = Bus

