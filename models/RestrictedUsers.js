const { Schema, model } = require("mongoose");

const restrictedSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "please provide a user  name"],
            min: [2, "name  should be greater than 2"],
        },
        user_id: {
            type: Schema.ObjectId,
            required: [true, "please send a created user id"],
            ref: "users",
        }

    },
    {
        timestamps: true,
    }
);

const restrictedschema = model("restricted", restrictedSchema);

module.exports = restrictedschema;
