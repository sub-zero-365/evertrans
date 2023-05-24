const { Schema, model } = require("mongoose");
// const jwt = require("jsonwebtoken")

const citySchema = new Schema(
  {
    value: {
      type: String,
      required: [true, "please provide a user  name"],
    //   minLength: 6,
    },
    label: {
      type: String,
    //   required: [true, "please provide a user  name"],
    //   minLength: 6,
    },
  },
  {
    timestamps: true,
  }
);

// UserSchema.methods.createJWT = function() {
//     return jwt.sign({ _id: this._id, phone: this.phone }, process.env.jwtSecret, { expiresIn: "10d" })

// }
citySchema.pre("validate", function () {
  this.label = this.value;
});
const cityschema = model("city", citySchema);

module.exports = cityschema;
