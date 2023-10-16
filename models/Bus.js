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
        min: [4, "please seat should not be less than 9 and greater than 15"],
        default: 4
    },
    plate_number: {
        type: Number,
        required: true

    },
    feature: {
        type: String,
        require: [true, "pleae bus feature  is required"],
        enum: {
            values: [
                "classic", "vip"
            ]
        }

    }
    ,
}, {
    timestamps: true,
    versionKey: false
});

const Bus = model("bus", busSchema);
module.exports = Bus

