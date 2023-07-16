const { model, Schema } = require("mongoose");
const routeSechema = new Schema({
    from: {
        type: String,
        required: [true, "from is required"]
    },
    to: {
        type: String,
        required: [true, "to is required"]
    },
    cost: {
        type: Number,
        default: 6500
    }

}, {

    timestamps: true, versionKey: false
})
const routesschema = model("routes", routeSechema)
module.exports = routesschema