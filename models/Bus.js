const { model, Schema } = require("mongoose");


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
    seat_positions: {
        type: Array,
        default: []
    },
    image: {
        type: String,
        required: false,
        default: "demobusimage"
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
busSchema.pre("validate", async function () {
    this.seat_positions =
        Array.from({ length: this.number_of_seats }, (arr, index) => {
            return ({
                _id: index,
                isTaken: false,
                isReserved: false
            })
        })
    console.log(this)
})
const Bus = model("bus", busSchema);
module.exports = Bus

