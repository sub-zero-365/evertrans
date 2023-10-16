const { Schema, model } = require("mongoose");

const restrictedSchema = new Schema(
    {
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

const restrictedschema = model("restricteds", restrictedSchema);

module.exports = restrictedschema;
