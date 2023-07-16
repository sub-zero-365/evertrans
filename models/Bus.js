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
        min: [2, "please seat should not be less than 45"],
        default: 2
    },
    tracking_id: {
        type: String
    },
    travel_count: {
        type: Number,
        default: 1
    }
    ,
    trips: [
        {
            tracking_id: {
                type: String
            },
            date: {
                type: Date
            }
        }

    ]
    // , date: {
    //     type: Date,
    //     required: [true, "please date is required when creating and reseting a bus"]
    // }
    ,
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

    feature: {
        type: String,
        default: "normal bus",
    },
    active: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});
busSchema.pre("validate", async function () {

    this.number_of_seats = 2

    this.seat_positions =
        Array.from({ length: this.number_of_seats }, (arr, index) => {
            return ({
                _id: index,
                isTaken: false,
            })
        })
    this.tracking_id = uuid()
    this.trips = [{
        tracking_id: this.tracking_id,
        date: new Date()
    }]
    // console.log(this)
})
const Bus = model("bus", busSchema);
module.exports = Bus

