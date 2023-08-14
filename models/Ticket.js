const { Schema, model } = require("mongoose");
const User = require("./User");
const generateRandonNumber = require("../utils/RandonGeneratedIds")
const ticketSchema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "please enter fullname "],
    },
    id: {
      type: String,
      required: [true, "please field is required "]
    }
    ,
    type: {
      type: String,
      default: "singletrip",
      enum: {
        values: ["singletrip",
          "roundtrip"],
      },
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
      type: Date,
      required: [true, "please enter date"],
    },
    createdBy: {
      type: Schema.ObjectId,
      required: [true, "please send a created user id"],
      ref: "users",
    },
    updatedBy: {
      type: Schema.ObjectId,
      required: false,
      ref: "users",
    },
    updatedDate: {
      type: Date,
      required: [false, "please enter date"],
    },
    updatePrice: {
      type: Number,
      required: false,
      default: 0
    },
    doubletripdetails: {
      type: Array,
      required: true,
      default: [
        {
          updatedAt: null,
          active: null,
        },
        {
          updatedAt: null,
          active: null,
        },
      ]
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
    seatposition: {
      type: Number,
      required: [true, "Please seat is needed or required"],
      max: [58, "please ax bus seat is 58"],
      min: [0, "please min box seat is one"],

    },
    seat_id: {
      type: Schema.ObjectId,
      require: [true, "every ticket needs a unique seat id "]
    },
    paymenttype: {
      type: String,
      require: false,
      default: "Cash In",
      emun: {
        values: ["Cash In",
          "CM"],

      }
    }

  },
  {
    timestamps: true,
    versionKey: false
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
ticketSchema.pre("validate", async function () {
  this.id = generateRandonNumber()
  if (this.type === "roundtrip") {
    this.doubletripdetails = [
      {
        updatedAt: new Date(),
        active: true,
      },
      {
        updatedAt: new Date(),
        active: true,
      },

    ]
  }

})
// ticketSchema.methods.create

const ticketschema = model("Ticket", ticketSchema);
module.exports = ticketschema;
