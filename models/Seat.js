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

    traveltime: {
        type: String,
        required: [true, "please enter time"],
    },
    traveldate: {
        type: Date,
        required: [true, "please enter date"],
    },
    bus: {
        type: Object,
        default: {
            bus: "demobus",
            _id: "64b260e8ef94c7a1aa37a22b"
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
}, {

    timestamps: true, versionKey: false
})

seatSchema.pre("validate", async function () {

    const number_of_seats = 2

    this.seat_positions =
        Array.from({ length: number_of_seats }, (arr, index) => {
            return ({
                _id: index,
                isTaken: false,
            })
        })
    // this.tracking_id = uuid()
    // this.trips = [{
    //     tracking_id: this.tracking_id,
    //     date: new Date()
    // }]
    // console.log(this)
})

const seatschema = model("seats", seatSchema)
module.exports = seatschema