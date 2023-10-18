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
    singletripprice: {
        type: Number,
        require:[true,"please sigletripprice is required"]
    },
    roundtripprice: {
        type: Number,
        require:[true,"please roundtripprice is required"]
    }

}, {
    timestamps: true, versionKey: false
})
const routesschema = model("routes", routeSechema)
module.exports = routesschema