const { model, Schema } = require("mongoose")

const BlockUserSchema = new Schema({
    block_users: {
        type: String,
        default: "Block Admins"
    },
    block_ids: [
        {
            _id: {
                type: Schema.ObjectId
            }
        }
    ]
})
const blockuserschema = model("blockusers", BlockUserSchema)
module.exports = blockuserschema