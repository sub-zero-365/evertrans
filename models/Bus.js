const { model, Schema } = require("mongoose");


const busSchema = new Schema({

    name: {
        type: String,
        required: [true, "please bus name is required"]
    },
    total_seat: {
        type: Number,
        required: [true, "please seat  is required"]

    },
    image: {
        type: String,
        required: false,
        default:"demobusimage"
    }
    ,
    feature: {
        type: String,
        default: "normal bus",
    }
}, {
    timestamps: true,
    versionKey: false
});
const Bus = model("bus", busSchema);
module.exports = Bus

