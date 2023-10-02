const { BadRequestError } = require("../error");
const Mail = require("../models/MailsModel")
const { formatImage } = require("../utils/multerMiddleware")
const cloudinary = require('cloudinary');
const { StatusCodes } = require("http-status-codes")
const createMail = async (req, res) => {
    // const newMail = { ...req.body };
    req.body.createdBy = req?.userInfo?._id

    console.log("req.file", req.body)

    if (req.file) {
        console.log("this i sthe file here", req.file)
        const file = formatImage(req.file);
        const response = await cloudinary.v2.uploader.upload(file);
        // newMail.avatar = response.secure_url;
        // newMail.avatarPublicId = response.public_id;
    }
    await Mail.create(req.body)
    // const updatedMail = await Mail.findByIdAndUpdate(req.Mail.MailId, newMail);

    // if (req.file && updatedMail.avatarPublicId) {
    //     await cloudinary.v2.uploader.destroy(updatedMail.avatarPublicId);
    // }

    res.status(StatusCodes.OK).json({ msg: 'update Mail' });
}
const getStaticMail = async (req, res, next) => {
    const id = req.params.id
    const mail = await Mail.findOne({ _id: id })
    if (!mail) throw BadRequestError("couldnot find mail with id " + id)
    res.status(StatusCodes.OK).json({ mail })
}
const getAllMeals = async (req, res) => {
    const mails = await Mail.find({})
    res.status(StatusCodes.OK).json({ mails })

}
module.exports = {
    createMail,
    getStaticMail,
    getAllMeals
}
