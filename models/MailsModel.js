const { Schema, model } = require("mongoose");
const generateRandonNumber = require("../utils/RandonGeneratedIds")
const mailsSchema = new Schema(
    {
        name: {
            type: String,
            required: false,
            default: "n/a"
        },
        id: {
            type: String,
            required: [true, "please field is required "]
        }
        ,
        from: {
            type: String,
            required: [true, "please enter from "],
        },
        collected: {
            type: Boolean,
            default: false,
            enum: {
                values: [true, false],
            },
        },
        to: {
            type: String,
            required: [true, "please enter to"],
        },
        // price: {
        //     type: Number,
        //     required: [true, "please enter price"],
        // },
        estimatedprice: {
            type: Number,
            required: [true, "please enter price"],
        },
        registerdate: {
            type: Date,
            required: [true, "please enter date"],
        },
        createdBy: {
            type: Schema.ObjectId,
            required: [true, "please send a created user id"],
            ref: "users",
        },
        senderphonenumber: {
            type: String,
            required: true,
        },
        recieverphonenumber: {
            type: String,
            required: true,
        },
        senderidcardnumber: {
            type: String,
            required: true,
        },
        imgUrl: String,
        avatarPublicId: String,
    },
    {
        timestamps: true,
        versionKey: false
    }

);
mailsSchema.pre("validate", async function () {
    // this code will generate new id when saving a new mails to  get a new id instead of the mongoose id 
    this.id = generateRandonNumber()
})

const mailsschema = model("mails", mailsSchema);
module.exports = mailsschema;
