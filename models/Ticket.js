const { Schema, model } = require("mongoose");
const User = require("./User");
const ticketSchema = new Schema(

  {
  
    fullname: {
      type: String,
      required: [true, "please enter fullname "],
    },
    phone: {
      type: Number,
      required: [true, "please enter phone "],
    },
    from: {
      type: String,
      required: [true, "please enter from "],
    },
  

    active: {
      type: Boolean,
      default: true,
      enum: {
        values: [true, false],
      },
    },
    to: {
      type: String,
      required: [true, "please enter to"],
    },
    price: {
      type: Number,
      required: [true, "please enter price"],
    },
    traveltime: {
      type: String,
      required: [true, "please enter time"],
    },
    traveldate: {
      type: String,
      required: [true, "please enter date"],
    },
    createdBy: {
      type: Schema.ObjectId,
      required: [true, "please send a created user id"],
      ref: "users",
    },
    email: {
      type: String,
      required: false,
    },
    age: {
      type: Number,
      required: [true, "Please your age is needed or required"],
    },

    sex: {
      type: String,
      required: [true, "Please your age is needed or required"],
      enum: {
        values: ["male", "female"],
        message: "sex is either male or female",
      },
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log("this : ", this);
    const user = await User.findOne({ _id: this.createdBy });
    console.log("you have delete this user ticket : ", user.fullname);

    next();
  }
);
const ticketschema = model("Ticket", ticketSchema);
module.exports = ticketschema;
