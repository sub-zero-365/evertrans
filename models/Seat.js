const { model, Schema } = require("mongoose");
const seatSchema = new Schema({
    from: {
        type: String,
        required: [true, "from is required"]
    },
    to: {
        type: String,
        required: [true, "to is required"]
    },

    // traveltime: {
    //     type: String,
    //     required: [true, "please enter time"],
    // },
    traveldate: {
        type: Date,
        required: [true, "please enter date"],
    },
    bus: {
        type: Object,
        bus: {
            type: String,
            require: [true, "bus name is require please pass bus name "]
        },
        feature: {
            type: String,
            require: [true, "bus name is require please pass bus name "]
        },

        default: {
            bus: "0001",
            _id: "64b260e8ef94c7a1aa37a22b",
            feature: "vip"
        }
    },
    seat_positions: [
        {
            _id: {
                type: Number,
            },
            isTaken: {
                type: Boolean
            },
            isReserved: {
                type: Boolean
            }

        }
    ],
    number_of_seats: {
        type: Number,
        min: [9, "please seat should not be less than 9"],
        default: 9
    },
}, {
    timestamps: true,
    versionKey: false
})

seatSchema.pre("validate", async function () {
    const number_of_seats = this.number_of_seats ?? 9
    this.seat_positions =
        Array.from(
            { length: number_of_seats },
            (arr, index) => {
                return ({
                    _id: index,
                    isTaken: false,
                    isReserved: false
                })
            })

})

const seatschema = model("seats", seatSchema)
module.exports = seatschema