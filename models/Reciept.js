const { model, Schema } = require("mongoose");
const generateRandonNumber = require("../utils/RandonGeneratedIds")

const recieptSchema = new Schema({
    id: String,
    quantity: {
        type: Number,
        require: [true, "please provide quantity "]
    },
    total_price: {
        type: Number,
        require: [true, "please provide quantity "]
    }, createdBy: {
        type: Schema.ObjectId,
        required: [true, "please send a created user id"],
        ref: "users",
    },
    products: [{
        _id: {
            // type: Schema.ObjectId,
            type: Number

        },
        total: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            require: [true, "please product price is required ,send "]
        },
        productname: {
            type: String,
            require: [true, "please provide a product name "]
        }
    }]
}, {
    timestamps: true,
    versionKey: false
})

recieptSchema.pre("validate", async function () {
    this.id = generateRandonNumber()
})

const recieptschema = model("reciepts", recieptSchema)
module.exports = recieptschema