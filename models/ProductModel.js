const { Schema, model } = require("mongoose");
const generateRandonNumber = require("../utils/RandonGeneratedIds")
const productSchema = new Schema(
    {
        product_name: {
            type: String,
            required: [true, "please enter fullname "],
        },

        product_price: {
            type: Number,
            required: [true, "please product price is required"]
        },
        total: {
            type: Number,
            default: 1
        }
        ,
        createdBy: {
            type: Schema.ObjectId,
            required: [true, "please send a created user id"],
            ref: "users",
        },
        id: String,
        product_details: String,
        product_category: Array,
        imgUrl: String,
        avatarPublicId: String,


    },
    {
        timestamps: true,
        versionKey: false
    }

);


// ticketSchema.methods.create
productSchema.pre("validate", async function () {
    // this code will generate new id when saving a new mails to  get a new id instead of the mongoose id 
    this.id = generateRandonNumber()
})
const productschema = model("products", productSchema);
module.exports = productschema;
